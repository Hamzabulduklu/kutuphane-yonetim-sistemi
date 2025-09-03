/**
 * Kütüphane İşlemleri Controller Sınıfı
 * Bu sınıf kütüphane yönetimi ile ilgili tüm işlemleri yönetir
 */

import { Response } from 'express';
import Library, { ILibrary } from '../models/Library';
import Book from '../models/Book';
import { AuthenticatedRequest } from '../middleware/auth';
import { 
  LibraryCreateSchema,
  LibraryUpdateSchema,
  PaginationSchema 
} from '../schemas/validationSchemas';

/**
 * Kütüphane İşlemleri Controller Sınıfı
 * Kütüphane oluşturma, güncelleme, silme ve listeleme işlemlerini yönetir
 */
export class LibraryController {
  
  /**
   * Yeni kütüphane oluşturma fonksiyonu
   * @param req - HTTP isteği (kütüphane bilgilerini içerir)
   * @param res - HTTP yanıtı
   */
  static async createLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Zod ile input doğrulama
      const validationResult = LibraryCreateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        res.status(400).json({
          success: false,
          message: 'Doğrulama hatası',
          errors
        });
        return;
      }

      const { name, address, phone, email, operatingHours } = validationResult.data;

      // Aynı isimde aktif kütüphane var mı kontrol et
      const existingLibrary = await Library.findOne({ name, isActive: true });
      if (existingLibrary) {
        res.status(409).json({ 
          success: false,
          message: 'Bu isimde bir kütüphane zaten mevcut' 
        });
        return;
      }

      // Yeni kütüphane oluştur
      const newLibrary = new Library({
        name,
        address,
        phone,
        email,
        operatingHours,
      });

      // Kütüphaneyi veritabanına kaydet
      const savedLibrary = await newLibrary.save();

      res.status(201).json({
        success: true,
        message: 'Kütüphane başarıyla oluşturuldu',
        library: savedLibrary,
      });
    } catch (error) {
      console.error('Create library error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Tüm aktif kütüphaneleri sayfalama ile getiren fonksiyon
   * @param req - HTTP isteği (sayfa numarası ve limit parametrelerini içerir)
   * @param res - HTTP yanıtı
   */
  static async getAllLibraries(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Sayfa numarası ve limit değerlerini al (varsayılan değerlerle)
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit; // Kaç kayıt atlanacağını hesapla

      // Aktif kütüphaneleri kitaplarıyla birlikte getir
      const libraries = await Library.find({ isActive: true })
        .populate('books') // Kütüphaneye ait kitapları da getir
        .skip(skip) // Belirtilen sayıda kayıt atla
        .limit(limit) // Belirtilen sayıda kayıt getir
        .sort({ createdAt: -1 }); // En yeni oluşturulanları önce sırala

      // Toplam aktif kütüphane sayısını al
      const total = await Library.countDocuments({ isActive: true });

      // Başarılı yanıt döndür
      res.status(200).json({
        libraries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit), // Toplam sayfa sayısını hesapla
        },
      });
    } catch (error) {
      console.error('Get libraries error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * ID'ye göre belirli bir kütüphaneyi getiren fonksiyon
   * @param req - HTTP isteği (kütüphane ID'sini içerir)
   * @param res - HTTP yanıtı
   */
  static async getLibraryById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // URL parametresinden kütüphane ID'sini al
      const { id } = req.params;

      // Belirtilen ID'ye sahip aktif kütüphaneyi kitaplarıyla birlikte getir
      const library = await Library.findOne({ _id: id, isActive: true })
        .populate('books'); // Kütüphaneye ait kitapları da getir

      // Kütüphane bulunamadıysa hata döndür
      if (!library) {
        res.status(404).json({ message: 'Library not found' });
        return;
      }

      // Başarılı yanıt döndür
      res.status(200).json({ library });
    } catch (error) {
      console.error('Get library error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Mevcut kütüphane bilgilerini güncelleyen fonksiyon
   * @param req - HTTP isteği (kütüphane ID'si ve güncellenecek bilgileri içerir)
   * @param res - HTTP yanıtı
   */
  static async updateLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // URL parametresinden kütüphane ID'sini al
      const { id } = req.params;
      // İstekten güncellenecek kütüphane bilgilerini al
      const { name, description, address, phone, email } = req.body;

      // Kütüphanenin var olup olmadığını kontrol et
      const library = await Library.findOne({ _id: id, isActive: true });
      if (!library) {
        res.status(404).json({ message: 'Library not found' });
        return;
      }

      // Eğer isim güncelleniyorsa, aynı isimde başka kütüphane var mı kontrol et
      if (name) {
        const duplicateLibrary = await Library.findOne({
          _id: { $ne: id }, // Mevcut kütüphane hariç
          name,
          isActive: true,
        });

        if (duplicateLibrary) {
          res.status(409).json({ message: 'Library with this name already exists' });
          return;
        }
      }

      // Kütüphane bilgilerini güncelle
      const updatedLibrary = await Library.findByIdAndUpdate(
        id,
        {
          // Sadece gönderilen alanları güncelle
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(address && { address }),
          ...(phone !== undefined && { phone }),
          ...(email !== undefined && { email }),
        },
        { new: true, runValidators: true } // Güncellenmiş veriyi döndür ve validasyon yap
      );

      res.status(200).json({
        message: 'Library updated successfully',
        library: updatedLibrary,
      });
    } catch (error) {
      console.error('Update library error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Kütüphaneyi silen fonksiyon (soft delete - veritabanından fiziksel olarak silmez)
   * @param req - HTTP isteği (silinecek kütüphane ID'sini içerir)
   * @param res - HTTP yanıtı
   */
  static async deleteLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // URL parametresinden kütüphane ID'sini al
      const { id } = req.params;

      // Silinecek kütüphanenin var olup olmadığını kontrol et
      const library = await Library.findOne({ _id: id, isActive: true });
      if (!library) {
        res.status(404).json({ message: 'Library not found' });
        return;
      }

      // Kütüphanede kitap var mı kontrol et
      const bookCount = await Book.countDocuments({ libraryId: id, isActive: true });
      if (bookCount > 0) {
        res.status(400).json({ 
          message: 'Cannot delete library with books. Please remove all books first.' 
        });
        return;
      }

      // Soft delete işlemi (isActive durumunu false yap)
      await Library.findByIdAndUpdate(id, { isActive: false });

      res.status(200).json({ message: 'Library deleted successfully' });
    } catch (error) {
      console.error('Delete library error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Kütüphane istatistiklerini getiren fonksiyon
   * Toplam kitap sayısı, mevcut kitap sayısı, ödünç verilen kitap sayısı ve kategori dağılımını hesaplar
   * @param req - HTTP isteği (kütüphane ID'sini içerir)
   * @param res - HTTP yanıtı
   */
  static async getLibraryStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // URL parametresinden kütüphane ID'sini al
      const { id } = req.params;

      // Kütüphanenin var olup olmadığını kontrol et
      const library = await Library.findOne({ _id: id, isActive: true });
      if (!library) {
        res.status(404).json({ message: 'Library not found' });
        return;
      }

      // Toplam kitap sayısını hesapla
      const totalBooks = await Book.countDocuments({ libraryId: id, isActive: true });
      
      // Mevcut (ödünç verilebilir) kitap kopyalarının toplamını hesapla
      const availableBooks = await Book.aggregate([
        { $match: { libraryId: id, isActive: true } }, // Bu kütüphaneye ait aktif kitapları filtrele
        { $group: { _id: null, total: { $sum: '$availableCopies' } } } // Mevcut kopya sayılarını topla
      ]);

      // Ödünç verilen kitap kopyalarının toplamını hesapla
      const borrowedBooks = await Book.aggregate([
        { $match: { libraryId: id, isActive: true } }, // Bu kütüphaneye ait aktif kitapları filtrele
        { $group: { _id: null, total: { $sum: { $subtract: ['$totalCopies', '$availableCopies'] } } } } // Toplam - Mevcut = Ödünç verilen
      ]);

      // Kategorilere göre kitap dağılımını hesapla
      const categoryStats = await Book.aggregate([
        { $match: { libraryId: id, isActive: true } }, // Bu kütüphaneye ait aktif kitapları filtrele
        { $group: { _id: '$category', count: { $sum: 1 } } }, // Kategorilere göre grupla ve say
        { $sort: { count: -1 } } // En çok kitabı olan kategoriden azalan sırada sırala
      ]);

      // İstatistikleri yanıt olarak döndür
      res.status(200).json({
        library: {
          name: library.name,
          id: library._id,
        },
        statistics: {
          totalBooks,
          availableBooks: availableBooks[0]?.total || 0, // Eğer sonuç yoksa 0 döndür
          borrowedBooks: borrowedBooks[0]?.total || 0, // Eğer sonuç yoksa 0 döndür
          categories: categoryStats,
        },
      });
    } catch (error) {
      console.error('Get library stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
