/**
 * Kitap Route Tanımları
 * Kitap ile ilgili tüm API endpoint'lerini tanımlar
 */

import { Router } from 'express';
import { BookController } from '../controllers/BookController';
import { authenticateToken } from '../middleware/auth';
import { validateSchema, validateIdParam } from '../middleware/validation';
import { 
  BookCreateSchema,
  BookUpdateSchema,
  BookSearchSchema,
  BorrowBookSchema 
} from '../schemas/validationSchemas';

// Express Router oluştur
const router = Router();

// =====================================
// KORUNMUŞ ENDPOINT'LER (Tümü kimlik doğrulaması gerektirir)
// =====================================

// Tüm kitap route'ları kimlik doğrulaması gerektirir
router.use(authenticateToken);

/**
 * POST /api/books/
 * Yeni kitap ekler
 */
router.post('/', validateSchema(BookCreateSchema), BookController.addBook);

/**
 * GET /api/books/
 * Tüm kitapları listeler (sayfalanmış)
 */
router.get('/', validateSchema(BookSearchSchema, 'query'), BookController.getAllBooks);

/**
 * POST /api/books/search
 * Kitaplarda arama yapar (başlık, yazar, kategori vb.)
 */
router.post('/search', validateSchema(BookSearchSchema), BookController.searchBooks);

/**
 * GET /api/books/:id
 * Belirli bir kitabın detay bilgilerini getirir
 */
router.get('/:id', validateIdParam, BookController.getBookById);

/**
 * PUT /api/books/:id
 * Kitap bilgilerini günceller
 */
router.put('/:id', validateIdParam, validateSchema(BookUpdateSchema), BookController.updateBook);

/**
 * DELETE /api/books/:id
 * Kitabı siler (soft delete)
 */
router.delete('/:id', validateIdParam, BookController.deleteBook);

/**
 * POST /api/books/borrow
 * Kitabı ödünç alma işlemi
 */
router.post('/borrow', validateSchema(BorrowBookSchema), BookController.borrowBook);

/**
 * POST /api/books/:id/return
 * Kitabı geri verme işlemi
 */
router.put('/:id/return', validateIdParam, BookController.returnBook);

// Router'ı dışa aktar
export default router;
