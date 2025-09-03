/**
 * Ceza ve Ödeme İşlemleri Controller Sınıfı
 * Geciken kitap ödünç alma işlemleri için ceza yönetimi
 */

import { Response } from 'express';
import Fine, { IFine } from '../models/Fine';
import BorrowRecord from '../models/BorrowRecord';
import Book from '../models/Book';
import User from '../models/User';
import Library from '../models/Library';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Ceza Hesaplama Ayarları
 */
const FINE_SETTINGS = {
  GRACE_PERIOD_DAYS: 14,           // 14 gün ödemesiz dönem
  DAILY_FINE_RATE: 2.0,            // Günlük ceza miktarı (TL)
  MAX_FINE_AMOUNT: 100.0,          // Maksimum ceza miktarı (TL)
  CURRENCY: 'TRY',                 // Para birimi
  PAYMENT_DUE_DAYS: 30,            // Ceza ödeme süresi (gün)
};

export class FineController {
  
  /**
   * Otomatik ceza hesaplama ve oluşturma fonksiyonu
   * Geciken tüm ödünç alma kayıtları için ceza hesaplar
   */
  static async calculateOverdueFines(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const today = new Date();
      
      // Geciken ve henüz geri verilmemiş ödünç alma kayıtlarını bul
      const overdueRecords = await BorrowRecord.find({
        isReturned: false,
        dueDate: { $lt: today }, // Geri verme tarihi geçmiş
        isActive: true
      }).populate('userId', 'username firstName lastName email')
        .populate('bookId', 'title author isbn')
        .populate('libraryId', 'name') as any[];

      let processedCount = 0;
      let newFinesCount = 0;
      let updatedFinesCount = 0;
      const results = [];

      for (const record of overdueRecords) {
        const daysOverdue = Math.floor((today.getTime() - new Date(record.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        
        // 14 günlük ödemesiz dönem kontrolü
        if (daysOverdue <= FINE_SETTINGS.GRACE_PERIOD_DAYS) {
          continue; // Henüz ceza dönemine girmemiş
        }
        
        // Ceza günü hesapla (14 günden sonraki günler)
        const fineDays = daysOverdue - FINE_SETTINGS.GRACE_PERIOD_DAYS;
        
        // Ceza miktarını hesapla
        let fineAmount = fineDays * FINE_SETTINGS.DAILY_FINE_RATE;
        if (fineAmount > FINE_SETTINGS.MAX_FINE_AMOUNT) {
          fineAmount = FINE_SETTINGS.MAX_FINE_AMOUNT;
        }

        // Mevcut ceza kaydını kontrol et
        let existingFine = await Fine.findOne({
          borrowRecordId: record._id,
          status: { $in: ['pending', 'paid'] },
          isActive: true
        });

        if (existingFine) {
          // Mevcut cezayı güncelle
          existingFine.amount = fineAmount;
          existingFine.daysOverdue = daysOverdue;
          existingFine.calculationDate = today;
          await existingFine.save();
          updatedFinesCount++;
        } else {
          // Yeni ceza oluştur
          const newFine = new Fine({
            userId: record.userId._id,
            borrowRecordId: record._id,
            bookId: record.bookId._id,
            libraryId: record.libraryId._id,
            amount: fineAmount,
            currency: FINE_SETTINGS.CURRENCY,
            reason: 'overdue',
            description: `${fineDays} gün gecikme cezası`,
            daysOverdue: daysOverdue,
            calculationDate: today
          });
          
          await newFine.save();
          
          // BorrowRecord'a ceza miktarını güncelle
          await BorrowRecord.findByIdAndUpdate(record._id, {
            fine: fineAmount
          });
          
          newFinesCount++;
        }

        results.push({
          borrowRecordId: record._id,
          userId: record.userId._id,
          userName: `${record.userId.firstName} ${record.userId.lastName}`,
          bookTitle: record.bookId.title,
          daysOverdue: daysOverdue,
          fineAmount: fineAmount,
          status: existingFine ? 'updated' : 'created'
        });

        processedCount++;
      }

      res.status(200).json({
        message: 'Ceza hesaplama işlemi tamamlandı',
        summary: {
          totalProcessed: processedCount,
          newFines: newFinesCount,
          updatedFines: updatedFinesCount,
          gracePeriodDays: FINE_SETTINGS.GRACE_PERIOD_DAYS,
          dailyRate: FINE_SETTINGS.DAILY_FINE_RATE
        },
        results: results
      });

    } catch (error) {
      console.error('Ceza hesaplama hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kullanıcının cezalarını listeleme
   */
  static async getUserFines(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { status = 'all', page = 1, limit = 10 } = req.query;

      if (!userId) {
        res.status(401).json({ message: 'Kullanıcı kimlik doğrulaması yapılmamış' });
        return;
      }

      const skip = (Number(page) - 1) * Number(limit);
      
      // Filtre oluştur
      const filter: any = { 
        userId: userId,
        isActive: true 
      };
      
      if (status !== 'all') {
        filter.status = status;
      }

      // Cezaları getir
      const fines = await Fine.find(filter)
        .populate('bookId', 'title author isbn')
        .populate('libraryId', 'name address')
        .populate('borrowRecordId', 'borrowDate dueDate returnDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      // Toplam sayıyı hesapla
      const totalFines = await Fine.countDocuments(filter);
      
      // Özet istatistikleri hesapla
      const unpaidFines = await Fine.aggregate([
        { $match: { userId: userId, status: 'pending', isActive: true } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);

      res.status(200).json({
        message: 'Kullanıcı cezaları başarıyla getirildi',
        data: fines,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalFines / Number(limit)),
          totalItems: totalFines,
          itemsPerPage: Number(limit)
        },
        summary: {
          unpaidAmount: unpaidFines[0]?.totalAmount || 0,
          unpaidCount: unpaidFines[0]?.count || 0,
          currency: FINE_SETTINGS.CURRENCY
        }
      });

    } catch (error) {
      console.error('Kullanıcı cezaları getirme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Tüm cezaları listeleme (admin)
   */
  static async getAllFines(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { 
        status = 'all', 
        libraryId, 
        userId,
        startDate,
        endDate,
        page = 1, 
        limit = 10 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      
      // Filtre oluştur
      const filter: any = { isActive: true };
      
      if (status !== 'all') {
        filter.status = status;
      }
      
      if (libraryId) {
        filter.libraryId = libraryId;
      }
      
      if (userId) {
        filter.userId = userId;
      }
      
      if (startDate || endDate) {
        filter.calculationDate = {};
        if (startDate) filter.calculationDate.$gte = new Date(startDate as string);
        if (endDate) filter.calculationDate.$lte = new Date(endDate as string);
      }

      // Cezaları getir
      const fines = await Fine.find(filter)
        .populate('userId', 'username firstName lastName email')
        .populate('bookId', 'title author isbn')
        .populate('libraryId', 'name address')
        .populate('borrowRecordId', 'borrowDate dueDate returnDate')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const totalFines = await Fine.countDocuments(filter);

      // Genel istatistikler
      const stats = await Fine.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);

      res.status(200).json({
        message: 'Cezalar başarıyla getirildi',
        data: fines,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalFines / Number(limit)),
          totalItems: totalFines,
          itemsPerPage: Number(limit)
        },
        statistics: stats
      });

    } catch (error) {
      console.error('Cezaları getirme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Ceza ödeme işlemi
   */
  static async payFine(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { paymentMethod, paymentReference, notes } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Kullanıcı kimlik doğrulaması yapılmamış' });
        return;
      }

      // Cezayı bul
      const fine = await Fine.findOne({ 
        _id: id, 
        userId: userId,
        status: 'pending',
        isActive: true 
      });

      if (!fine) {
        res.status(404).json({ message: 'Ceza kaydı bulunamadı veya zaten ödenmiş' });
        return;
      }

      // Cezayı ödenmiş olarak işaretle
      fine.status = 'paid';
      fine.isPaid = true;
      fine.paymentDate = new Date();
      fine.paymentMethod = paymentMethod;
      fine.paymentReference = paymentReference;
      if (notes) fine.description = fine.description + ` | Ödeme notu: ${notes}`;

      await fine.save();

      res.status(200).json({
        message: 'Ceza başarıyla ödendi',
        data: fine
      });

    } catch (error) {
      console.error('Ceza ödeme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Ceza iptal etme (admin)
   */
  static async cancelFine(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const fine = await Fine.findOne({ 
        _id: id, 
        status: { $in: ['pending', 'paid'] },
        isActive: true 
      });

      if (!fine) {
        res.status(404).json({ message: 'Ceza kaydı bulunamadı' });
        return;
      }

      fine.status = 'cancelled';
      fine.description = fine.description + ` | İptal sebebi: ${reason || 'Admin tarafından iptal edildi'}`;

      await fine.save();

      res.status(200).json({
        message: 'Ceza başarıyla iptal edildi',
        data: fine
      });

    } catch (error) {
      console.error('Ceza iptal hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Ceza ayarlarını getirme
   */
  static async getFineSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      res.status(200).json({
        message: 'Ceza ayarları getirildi',
        settings: FINE_SETTINGS
      });
    } catch (error) {
      console.error('Ceza ayarları getirme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Ceza istatistikleri
   */
  static async getFineStatistics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { libraryId, startDate, endDate } = req.query;
      
      // Filtre oluştur
      const filter: any = { isActive: true };
      
      if (libraryId) {
        filter.libraryId = libraryId;
      }
      
      if (startDate || endDate) {
        filter.calculationDate = {};
        if (startDate) filter.calculationDate.$gte = new Date(startDate as string);
        if (endDate) filter.calculationDate.$lte = new Date(endDate as string);
      }

      // Genel istatistikler
      const generalStats = await Fine.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalFines: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            paidFines: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
            },
            paidAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
            },
            pendingFines: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            pendingAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
            }
          }
        }
      ]);

      // Aylık trend
      const monthlyTrend = await Fine.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: '$calculationDate' },
              month: { $month: '$calculationDate' }
            },
            totalFines: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]);

      res.status(200).json({
        message: 'Ceza istatistikleri getirildi',
        general: generalStats[0] || {
          totalFines: 0,
          totalAmount: 0,
          paidFines: 0,
          paidAmount: 0,
          pendingFines: 0,
          pendingAmount: 0
        },
        monthlyTrend: monthlyTrend,
        settings: FINE_SETTINGS
      });

    } catch (error) {
      console.error('Ceza istatistikleri hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}
