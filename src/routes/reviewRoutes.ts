/**
 * Kitap Değerlendirme ve Yorum Route Tanımları
 * Değerlendirme işlemleri ile ilgili tüm API endpoint'lerini tanımlar
 */

import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { authenticateToken } from '../middleware/auth';
import { validateSchema, validateIdParam } from '../middleware/validation';
import { 
  ReviewCreateSchema,
  ReviewUpdateSchema,
  PaginationSchema 
} from '../schemas/validationSchemas';

const router = Router();

// =====================================
// KORUNMUŞ ENDPOINT'LER (Kimlik doğrulaması gerektirir)
// =====================================

// Tüm review route'ları kimlik doğrulaması gerektirir
router.use(authenticateToken);

/**
 * POST /api/reviews/
 * Yeni kitap değerlendirmesi ekler
 */
router.post('/', validateSchema(ReviewCreateSchema), ReviewController.addReview);

/**
 * GET /api/reviews/my
 * Giriş yapan kullanıcının tüm değerlendirmelerini listeler
 */
router.get('/my', validateSchema(PaginationSchema, 'query'), ReviewController.getUserReviews);

/**
 * GET /api/reviews/book/:bookId
 * Belirli bir kitabın tüm değerlendirmelerini getirir
 */
router.get('/book/:bookId', validateIdParam, validateSchema(PaginationSchema, 'query'), ReviewController.getBookReviews);

/**
 * GET /api/reviews/top-rated
 * En yüksek puanlı kitapları getirir
 */
router.get('/top-rated', validateSchema(PaginationSchema, 'query'), ReviewController.getTopRatedBooks);

/**
 * GET /api/reviews/most-reviewed
 * En çok değerlendirilen kitapları getirir
 */
router.get('/most-reviewed', validateSchema(PaginationSchema, 'query'), ReviewController.getMostReviewedBooks);

/**
 * PUT /api/reviews/:id
 * Mevcut değerlendirmeyi günceller
 */
router.put('/:id', validateIdParam, validateSchema(ReviewUpdateSchema), ReviewController.updateReview);

/**
 * DELETE /api/reviews/:id
 * Değerlendirmeyi siler (soft delete)
 */
router.delete('/:id', validateIdParam, ReviewController.deleteReview);

/**
 * POST /api/reviews/:id/helpful
 * Değerlendirmeyi faydalı olarak işaretler
 */
router.post('/:id/helpful', validateIdParam, ReviewController.markHelpful);

export default router;
