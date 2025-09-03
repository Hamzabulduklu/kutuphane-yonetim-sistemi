import { Response } from 'express';
import Book, { IBook } from '../models/Book';
import Library from '../models/Library';
import User from '../models/User';
import BorrowRecord from '../models/BorrowRecord';
import Fine from '../models/Fine';
import { AuthenticatedRequest } from '../middleware/auth';
import { 
  BookCreateSchema,
  BookUpdateSchema,
  BookSearchSchema,
  PaginationSchema,
  BorrowBookSchema 
} from '../schemas/validationSchemas';

/**
 * Kitap İşlemleri Controller Sınıfı
 * Bu sınıf kütüphanedeki kitaplarla ilgili tüm işlemleri yönetir
 */
export class BookController {
  
  /**
   * Kütüphaneye yeni kitap ekleme fonksiyonu
   * @param req - HTTP isteği (kitap bilgilerini içerir)
   * @param res - HTTP yanıtı
   */
  static async addBook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Zod ile input doğrulama
      const validationResult = BookCreateSchema.safeParse(req.body);
      
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

      const { 
        title,
        author,
        isbn,
        publisher,
        publishedYear,
        category,
        description,
        totalCopies,
        libraryId
      } = validationResult.data;

      // Kütüphanenin var olup olmadığını kontrol et
      const library = await Library.findOne({ _id: libraryId, isActive: true });
      if (!library) {
        res.status(404).json({ 
          success: false,
          message: 'Kütüphane bulunamadı' 
        });
        return;
      }

      // Aynı ISBN'e sahip kitap var mı kontrol et
      if (isbn) {
        const existingBook = await Book.findOne({ 
          isbn, 
          libraryId, 
          isActive: true 
        });
        
        if (existingBook) {
          res.status(409).json({ 
            success: false,
            message: 'Bu ISBN\'e sahip kitap zaten bu kütüphanede mevcut' 
          });
          return;
        }
      }

      // Yeni kitap oluştur
      const newBook = new Book({
        title,
        author,
        isbn,
        publisher,
        publishedYear,
        category,
        description,
        totalCopies,
        availableCopies: totalCopies, // Başlangıçta tüm kopyalar müsait
        libraryId,
      });

      // Kitabı veritabanına kaydet
      const savedBook = await newBook.save();

      // Kitabı kütüphanenin kitap listesine ekle
      await Library.findByIdAndUpdate(libraryId, {
        $push: { books: savedBook._id }
      });

      // Başarılı yanıt gönder
      res.status(201).json({
        success: true,
        message: 'Kitap başarıyla eklendi',
        book: savedBook,
      });
    } catch (error) {
      console.error('Kitap ekleme hatası:', error);
      res.status(500).json({ 
        success: false,
        message: 'Sunucu hatası' 
      });
    }
  }

  /**
   * Tüm kitapları listeleme fonksiyonu (filtreleme ve sayfalama ile)
   * @param req - HTTP isteği (filtre ve sayfa parametrelerini içerir)
   * @param res - HTTP yanıtı
   */
  static async getAllBooks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Zod ile query parametrelerini doğrula
      const validationResult = BookSearchSchema.safeParse(req.query);
      
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

      const { page = 1, limit = 10, title, author, category, libraryId, available } = validationResult.data;
      const skip = (page - 1) * limit;

      // Filtreleme seçenekleri oluştur
      const filter: any = { isActive: true };
      
      // Kütüphane filtresi
      if (libraryId) {
        filter.libraryId = libraryId;
      }
      
      // Kategori filtresi
      if (category) {
        filter.category = new RegExp(category, 'i');
      }
      
      // Yazar filtresi
      if (author) {
        filter.author = new RegExp(author, 'i');
      }
      
      // Başlık filtresi
      if (title) {
        filter.title = new RegExp(title, 'i');
      }

      // Sadece müsait kitapları göster filtresi
      if (available === true) {
        filter.availableCopies = { $gt: 0 };
      }

      // Kitapları veritabanından getir
      const books = await Book.find(filter)
        .populate('libraryId', 'name address') // Kütüphane bilgilerini de getir
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // En yeni eklenenler önce

      // Toplam kitap sayısını hesapla
      const total = await Book.countDocuments(filter);

      // Sonuçları gönder
      res.status(200).json({
        success: true,
        books,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Kitapları getirme hatası:', error);
      res.status(500).json({ 
        success: false,
        message: 'Sunucu hatası' 
      });
    }
  }

  /**
   * ID'ye göre kitap getirme fonksiyonu
   * @param req - HTTP isteği (kitap ID'sini içerir)
   * @param res - HTTP yanıtı
   */
  static async getBookById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Kitabı ID'ye göre bul ve ilgili bilgileri getir
      const book = await Book.findOne({ _id: id, isActive: true })
        .populate('libraryId', 'name address phone email') // Kütüphane detayları
        .populate('borrowedBy', 'username firstName lastName email'); // Kitabı ödünç alan kullanıcılar

      // Kitap bulunamadıysa hata döndür
      if (!book) {
        res.status(404).json({ message: 'Kitap bulunamadı' });
        return;
      }

      // Kitap bilgilerini gönder
      res.status(200).json({ book });
    } catch (error) {
      console.error('Kitap getirme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kitap güncelleme fonksiyonu
   * @param req - HTTP isteği (güncellenecek kitap bilgilerini içerir)
   * @param res - HTTP yanıtı
   */
  static async updateBook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { 
        title,        // Yeni başlık
        author,       // Yeni yazar
        isbn,         // Yeni ISBN
        publisher,    // Yeni yayınevi
        publishedYear,// Yeni yayın yılı
        category,     // Yeni kategori
        description,  // Yeni açıklama
        totalCopies   // Yeni toplam kopya sayısı
      } = req.body;

      // Kitabın var olup olmadığını kontrol et
      const book = await Book.findOne({ _id: id, isActive: true });
      if (!book) {
        res.status(404).json({ message: 'Kitap bulunamadı' });
        return;
      }

      // ISBN değiştiriliyorsa çakışma kontrolü yap
      if (isbn && isbn !== book.isbn) {
        const duplicateBook = await Book.findOne({
          _id: { $ne: id },
          isbn,
          libraryId: book.libraryId,
          isActive: true,
        });

        if (duplicateBook) {
          res.status(409).json({ message: 'Bu ISBN\'e sahip kitap zaten bu kütüphanede mevcut' });
          return;
        }
      }

      // Toplam kopya sayısı güncelleniyorsa müsait kopya sayısını ayarla
      let availableCopies = book.availableCopies;
      if (totalCopies !== undefined) {
        const borrowedCopies = book.totalCopies - book.availableCopies;
        availableCopies = Math.max(0, totalCopies - borrowedCopies);
      }

      // Kitabı güncelle
      const updatedBook = await Book.findByIdAndUpdate(
        id,
        {
          ...(title && { title }),
          ...(author && { author }),
          ...(isbn !== undefined && { isbn }),
          ...(publisher !== undefined && { publisher }),
          ...(publishedYear !== undefined && { publishedYear }),
          ...(category && { category }),
          ...(description !== undefined && { description }),
          ...(totalCopies !== undefined && { totalCopies, availableCopies }),
        },
        { new: true, runValidators: true }
      ).populate('libraryId', 'name address');

      res.status(200).json({
        message: 'Kitap başarıyla güncellendi',
        book: updatedBook,
      });
    } catch (error) {
      console.error('Kitap güncelleme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kitap silme fonksiyonu (soft delete)
   * @param req - HTTP isteği (silinecek kitap ID'sini içerir)
   * @param res - HTTP yanıtı
   */
  static async deleteBook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Kitabın var olup olmadığını kontrol et
      const book = await Book.findOne({ _id: id, isActive: true });
      if (!book) {
        res.status(404).json({ message: 'Kitap bulunamadı' });
        return;
      }

      // Kitap şu anda ödünç verilmiş mi kontrol et
      if (book.borrowedBy.length > 0) {
        res.status(400).json({ 
          message: 'Şu anda ödünç verilmiş olan kitap silinemez' 
        });
        return;
      }

      // Soft delete (kitabı pasif yap, veriyi silme)
      await Book.findByIdAndUpdate(id, { isActive: false });

      // Kitabı kütüphanenin kitap dizisinden çıkar
      await Library.findByIdAndUpdate(book.libraryId, {
        $pull: { books: id }
      });

      res.status(200).json({ message: 'Kitap başarıyla silindi' });
    } catch (error) {
      console.error('Kitap silme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kitap ödünç alma fonksiyonu
   * @param req - HTTP isteği (ödünç alınacak kitap ID'si ve geri verme tarihi)
   * @param res - HTTP yanıtı
   */
  static async borrowBook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id, dueDate } = req.body;
      const userId = req.user?.id;
     // const { dueDate } = req.body;

      // Kullanıcının kimlik doğrulaması yapılmış mı kontrol et
      if (!userId) {
        res.status(401).json({ message: 'Kullanıcı kimlik doğrulaması yapılmamış' });
        return;
      }

      // Kitabın var olup olmadığını ve müsait olup olmadığını kontrol et
      const book = await Book.findOne({ _id: id, isActive: true });
      if (!book) {
        res.status(404).json({ message: 'Kitap bulunamadı' });
        return;
      }

      // Kitap müsait mi kontrol et
      if (book.availableCopies <= 0) {
        res.status(400).json({ message: 'Kitap ödünç alınabilir durumda değil' });
        return;
      }

      // Kullanıcının var olup olmadığını ve aktif olup olmadığını kontrol et
      const user = await User.findOne({ _id: userId, isActive: true });
      if (!user) {
        res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        return;
      }

      // Kullanıcının maksimum kitap limitine ulaşıp ulaşmadığını kontrol et
      if (user.borrowedBooks.length >= user.maxBooks) {
        res.status(400).json({ 
          message: `Kullanıcı maksimum ${user.maxBooks} kitap limitine ulaştı` 
        });
        return;
      }

      // Kullanıcının bu kitabı zaten ödünç alıp almadığını kontrol et
      if (user.borrowedBooks.includes(id as string)) {
        res.status(400).json({ message: 'Kullanıcı bu kitabı zaten ödünç almış' });
        return;
      }

      // Ödünç alma kaydı oluştur
      const borrowRecord = new BorrowRecord({
        userId,
        bookId: id,
        libraryId: book.libraryId,
        borrowDate: new Date(),
        dueDate: new Date(dueDate),
      });

      await borrowRecord.save();

      // Kitap ve kullanıcı bilgilerini güncelle
      await Book.findByIdAndUpdate(id, {
        $inc: { availableCopies: -1 }, // Müsait kopya sayısını 1 azalt
        $push: { borrowedBy: userId }  // Ödünç alan kullanıcıları listesine ekle
      });

      await User.findByIdAndUpdate(userId, {
        $push: { borrowedBooks: id }  // Kullanıcının ödünç aldığı kitaplar listesine ekle
      });

      res.status(200).json({
        message: 'Kitap başarıyla ödünç alındı',
        borrowRecord,
      });
    } catch (error) {
      console.error('Kitap ödünç alma hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kitap geri verme fonksiyonu
   * @param req - HTTP isteği (geri verilecek kitap ID'si, notlar ve ceza)
   * @param res - HTTP yanıtı
   */
  static async returnBook(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { notes, manualFine } = req.body;

      // Kullanıcının kimlik doğrulaması yapılmış mı kontrol et
      if (!userId) {
        res.status(401).json({ message: 'Kullanıcı kimlik doğrulaması yapılmamış' });
        return;
      }

      // Aktif ödünç alma kaydını bul
      const borrowRecord = await BorrowRecord.findOne({
        userId,
        bookId: id,
        isReturned: false, // Henüz geri verilmemiş
      }).populate('bookId', 'title')
        .populate('libraryId', 'name');

      if (!borrowRecord) {
        res.status(404).json({ message: 'Ödünç alma kaydı bulunamadı' });
        return;
      }

      const today = new Date();
      const dueDate = new Date(borrowRecord.dueDate);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let calculatedFine = 0;
      let fineMessage = '';

      // Gecikme cezası hesaplama (14 günden sonra)
      if (daysOverdue > 14) {
        const fineDays = daysOverdue - 14; // 14 günlük ödemesiz dönem
        calculatedFine = Math.min(fineDays * 2.0, 100.0); // Günlük 2 TL, maksimum 100 TL
        fineMessage = `${fineDays} gün gecikme için ${calculatedFine} TL ceza hesaplandı.`;
        
        // Otomatik ceza kaydı oluştur
        if (calculatedFine > 0) {
          const existingFine = await Fine.findOne({
            borrowRecordId: borrowRecord._id,
            status: { $in: ['pending', 'paid'] },
            isActive: true
          });

          if (!existingFine) {
            const fineRecord = new Fine({
              userId: userId,
              borrowRecordId: borrowRecord._id,
              bookId: id,
              libraryId: borrowRecord.libraryId,
              amount: calculatedFine,
              currency: 'TRY',
              reason: 'overdue',
              description: `${fineDays} gün gecikme cezası`,
              daysOverdue: daysOverdue,
              calculationDate: today
            });
            
            await fineRecord.save();
          }
        }
      } else if (daysOverdue > 0 && daysOverdue <= 14) {
        fineMessage = `${daysOverdue} gün gecikme (14 günlük ödemesiz dönem içinde - ceza yok).`;
      }

      // Manuel ceza varsa kullan, yoksa hesaplanmış cezayı kullan
      const finalFine = manualFine !== undefined ? manualFine : calculatedFine;

      // Ödünç alma kaydını güncelle
      borrowRecord.returnDate = today;
      borrowRecord.isReturned = true;
      if (notes) borrowRecord.notes = notes;
      borrowRecord.fine = finalFine;
      
      await borrowRecord.save();

      // Kitap ve kullanıcı bilgilerini güncelle
      await Book.findByIdAndUpdate(id, {
        $inc: { availableCopies: 1 },
        $pull: { borrowedBy: userId }
      });

      await User.findByIdAndUpdate(userId, {
        $pull: { borrowedBooks: id }
      });

      res.status(200).json({
        message: 'Kitap başarıyla geri verildi',
        borrowRecord,
        fineInfo: {
          daysOverdue: daysOverdue,
          calculatedFine: calculatedFine,
          finalFine: finalFine,
          message: fineMessage || 'Gecikme yok, ceza hesaplanmadı.'
        }
      });
    } catch (error) {
      console.error('Kitap geri verme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kitap arama fonksiyonu
   * @param req - HTTP isteği (arama sorgusu ve filtre parametrelerini içerir)
   * @param res - HTTP yanıtı
   */
  static async searchBooks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { query, libraryId, page = 1, limit = 10 } = req.body;

      // Arama sorgusu zorunlu
      if (!query) {
        res.status(400).json({ message: 'Arama sorgusu gereklidir' });
        return;
      }

      const skip = (page - 1) * limit;

      // Arama filtresi oluştur (başlık, yazar, kategori, açıklama alanlarında ara)
      const searchFilter: any = {
        isActive: true,
        $or: [
          { title: new RegExp(query as string, 'i') },       // Başlıkta ara (büyük/küçük harf duyarsız)
          { author: new RegExp(query as string, 'i') },      // Yazarda ara
          { category: new RegExp(query as string, 'i') },    // Kategoride ara
          { description: new RegExp(query as string, 'i') }, // Açıklamada ara
        ],
      };

      // Kütüphane filtresi varsa ekle
      if (libraryId) {
        searchFilter.libraryId = libraryId;
      }

      // Arama sonuçlarını getir
      const books = await Book.find(searchFilter)
        .populate('libraryId', 'name address') // Kütüphane bilgilerini de getir
        .skip(skip)
        .limit(limit)
        .sort({ title: 1 }); // Başlığa göre alfabetik sırala

      // Toplam sonuç sayısını hesapla
      const total = await Book.countDocuments(searchFilter);

      res.status(200).json({
        books,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        searchQuery: query, // Arama sorgusunu da döndür
      });
    } catch (error) {
      console.error('Kitap arama hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}
