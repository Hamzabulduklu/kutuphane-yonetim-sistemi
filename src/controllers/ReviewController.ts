/**
 * Kitap Değerlendirme ve Yorum Controller Sınıfı
 * Kitaplara yapılan puanlama ve yorumları yönetir
 */

import { Response } from 'express';
import Review, { IReview } from '../models/Review';
import Book from '../models/Book';
import User from '../models/User';
import BorrowRecord from '../models/BorrowRecord';
import { AuthenticatedRequest } from '../middleware/auth';
import { 
  ReviewCreateSchema,
  ReviewUpdateSchema,
  PaginationSchema 
} from '../schemas/validationSchemas';

export class ReviewController {
  
  /**
   * Yeni değerlendirme ekleme
   */
  static async addReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Zod ile input doğrulama
      const validationResult = ReviewCreateSchema.safeParse(req.body);
      
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

      const { bookId, rating, comment } = validationResult.data;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ 
          success: false,
          message: 'Kullanıcı kimlik doğrulaması yapılmamış' 
        });
        return;
      }

      // Kitabın var olup olmadığını kontrol et
      const book = await Book.findOne({ _id: bookId, isActive: true });
      if (!book) {
        res.status(404).json({ 
          success: false,
          message: 'Kitap bulunamadı' 
        });
        return;
      }

      // Kullanıcının bu kitap için daha önce yorum yapıp yapmadığını kontrol et
      const existingReview = await Review.findOne({
        userId: userId,
        bookId: bookId,
        isActive: true
      });

      if (existingReview) {
        res.status(409).json({
          success: false,
          message: 'Bu kitap için zaten değerlendirme yapmışsınız'
        });
        return;
      }

      // Yeni değerlendirme oluştur
      const newReview = new Review({
        userId: userId,
        bookId: bookId,
        libraryId: book.libraryId,
        rating: rating,
        comment: comment
      });

      await newReview.save();

      // Kitabın ortalama puanını güncelle
      await ReviewController.updateBookRating(bookId);

      // Değerlendirmeyi populate ederek döndür
      const populatedReview = await Review.findById(newReview._id)
        .populate('userId', 'username firstName lastName')
        .populate('bookId', 'title author')
        .populate('libraryId', 'name');

      res.status(201).json({
        success: true,
        message: 'Değerlendirme başarıyla eklendi',
        review: populatedReview
      });
    } catch (error) {
      console.error('Değerlendirme ekleme hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  }

  /**
   * Kitabın tüm değerlendirmelerini getirme
   */
  static async getBookReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        rating,
        approved = 'true'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Filtre oluştur
      const filter: any = { 
        bookId: bookId,
        isActive: true
      };

      if (approved === 'true') {
        filter.isApproved = true;
      }

      if (rating) {
        filter.rating = Number(rating);
      }

      // Sıralama
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      // Değerlendirmeleri getir
      const reviews = await Review.find(filter)
        .populate('userId', 'username firstName lastName')
        .populate('borrowRecordId', 'borrowDate returnDate')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

      const totalReviews = await Review.countDocuments(filter);

      // İstatistikleri hesapla
      const ratingStats = await Review.aggregate([
        { $match: { bookId: bookId, isApproved: true, isActive: true } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const avgRating = await Review.aggregate([
        { $match: { bookId: bookId, isApproved: true, isActive: true } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      res.status(200).json({
        message: 'Kitap değerlendirmeleri başarıyla getirildi',
        data: reviews,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalReviews / Number(limit)),
          totalItems: totalReviews,
          itemsPerPage: Number(limit)
        },
        statistics: {
          averageRating: avgRating[0]?.averageRating || 0,
          totalReviews: avgRating[0]?.totalReviews || 0,
          ratingDistribution: ratingStats
        }
      });

    } catch (error) {
      console.error('Kitap değerlendirmeleri getirme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kullanıcının değerlendirmelerini getirme
   */
  static async getUserReviews(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10 } = req.query;

      if (!userId) {
        res.status(401).json({ message: 'Kullanıcı kimlik doğrulaması yapılmamış' });
        return;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const reviews = await Review.find({ userId: userId, isActive: true })
        .populate('bookId', 'title author isbn')
        .populate('libraryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const totalReviews = await Review.countDocuments({ userId: userId, isActive: true });

      res.status(200).json({
        message: 'Kullanıcı değerlendirmeleri başarıyla getirildi',
        data: reviews,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalReviews / Number(limit)),
          totalItems: totalReviews,
          itemsPerPage: Number(limit)
        }
      });

    } catch (error) {
      console.error('Kullanıcı değerlendirmeleri getirme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Değerlendirme güncelleme
   */
  static async updateReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        rating,
        title,
        comment,
        pros,
        cons,
        isAnonymous,
        readingDate,
        recommendedAge,
        tags,
        spoilerWarning
      } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Kullanıcı kimlik doğrulaması yapılmamış' });
        return;
      }

      // Değerlendirmeyi bul ve kullanıcının sahip olduğunu kontrol et
      const review = await Review.findOne({ 
        _id: id, 
        userId: userId, 
        isActive: true 
      });

      if (!review) {
        res.status(404).json({ message: 'Değerlendirme bulunamadı veya size ait değil' });
        return;
      }

      // Güncelleme verilerini hazırla
      const updateData: any = {};
      if (rating !== undefined) updateData.rating = rating;
      if (title !== undefined) updateData.title = title;
      if (comment !== undefined) updateData.comment = comment;
      if (pros !== undefined) updateData.pros = pros;
      if (cons !== undefined) updateData.cons = cons;
      if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous;
      if (readingDate !== undefined) updateData.readingDate = new Date(readingDate);
      if (recommendedAge !== undefined) updateData.recommendedAge = recommendedAge;
      if (tags !== undefined) updateData.tags = tags;
      if (spoilerWarning !== undefined) updateData.spoilerWarning = spoilerWarning;

      // Değerlendirmeyi güncelle
      const updatedReview = await Review.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('userId', 'username firstName lastName')
       .populate('bookId', 'title author')
       .populate('libraryId', 'name');

      // Eğer rating güncellendiyse kitabın ortalama puanını güncelle
      if (rating !== undefined) {
        await ReviewController.updateBookRating(review.bookId);
      }

      res.status(200).json({
        message: 'Değerlendirme başarıyla güncellendi',
        data: updatedReview
      });

    } catch (error) {
      console.error('Değerlendirme güncelleme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Değerlendirme silme
   */
  static async deleteReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Kullanıcı kimlik doğrulaması yapılmamış' });
        return;
      }

      // Değerlendirmeyi bul
      const review = await Review.findOne({ 
        _id: id, 
        userId: userId, 
        isActive: true 
      });

      if (!review) {
        res.status(404).json({ message: 'Değerlendirme bulunamadı veya size ait değil' });
        return;
      }

      // Soft delete
      review.isActive = false;
      await review.save();

      // Kitabın ortalama puanını güncelle
      await ReviewController.updateBookRating(review.bookId);

      res.status(200).json({
        message: 'Değerlendirme başarıyla silindi'
      });

    } catch (error) {
      console.error('Değerlendirme silme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Değerlendirmeyi faydalı olarak işaretleme
   */
  static async markHelpful(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: 'Kullanıcı kimlik doğrulaması yapılmamış' });
        return;
      }

      const review = await Review.findOne({ 
        _id: id, 
        isActive: true, 
        isApproved: true 
      });

      if (!review) {
        res.status(404).json({ message: 'Değerlendirme bulunamadı' });
        return;
      }

      // Faydalı oy sayısını arttır
      review.helpfulVotes += 1;
      await review.save();

      res.status(200).json({
        message: 'Değerlendirme faydalı olarak işaretlendi',
        helpfulVotes: review.helpfulVotes
      });

    } catch (error) {
      console.error('Faydalı işaretleme hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * Kitabın ortalama puanını güncelleme (internal method)
   */
  private static async updateBookRating(bookId: string): Promise<void> {
    try {
      const ratingStats = await Review.aggregate([
        { 
          $match: { 
            bookId: bookId, 
            isApproved: true, 
            isActive: true 
          } 
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      const avgRating = ratingStats[0]?.averageRating || 0;
      const totalReviews = ratingStats[0]?.totalReviews || 0;

      // Book modeline rating bilgilerini güncelle
      await Book.findByIdAndUpdate(bookId, {
        'rating.average': Math.round(avgRating * 10) / 10, // 1 ondalık
        'rating.count': totalReviews
      });

    } catch (error) {
      console.error('Kitap puanı güncelleme hatası:', error);
    }
  }

  /**
   * En çok değerlendirilen kitaplar
   */
  static async getMostReviewedBooks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;

      const mostReviewed = await Review.aggregate([
        { $match: { isApproved: true, isActive: true } },
        {
          $group: {
            _id: '$bookId',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        },
        { $sort: { totalReviews: -1 } },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: '_id',
            as: 'book'
          }
        },
        { $unwind: '$book' },
        {
          $project: {
            bookId: '$_id',
            title: '$book.title',
            author: '$book.author',
            isbn: '$book.isbn',
            averageRating: { $round: ['$averageRating', 1] },
            totalReviews: 1
          }
        }
      ]);

      res.status(200).json({
        message: 'En çok değerlendirilen kitaplar getirildi',
        data: mostReviewed
      });

    } catch (error) {
      console.error('En çok değerlendirilen kitaplar hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }

  /**
   * En yüksek puanlı kitaplar
   */
  static async getTopRatedBooks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { limit = 10, minReviews = 3 } = req.query;

      const topRated = await Review.aggregate([
        { $match: { isApproved: true, isActive: true } },
        {
          $group: {
            _id: '$bookId',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        },
        { $match: { totalReviews: { $gte: Number(minReviews) } } },
        { $sort: { averageRating: -1, totalReviews: -1 } },
        { $limit: Number(limit) },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: '_id',
            as: 'book'
          }
        },
        { $unwind: '$book' },
        {
          $project: {
            bookId: '$_id',
            title: '$book.title',
            author: '$book.author',
            isbn: '$book.isbn',
            averageRating: { $round: ['$averageRating', 1] },
            totalReviews: 1
          }
        }
      ]);

      res.status(200).json({
        message: 'En yüksek puanlı kitaplar getirildi',
        data: topRated
      });

    } catch (error) {
      console.error('En yüksek puanlı kitaplar hatası:', error);
      res.status(500).json({ message: 'Sunucu hatası' });
    }
  }
}
