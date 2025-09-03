/**
 * Kütüphane Route Tanımları
 * Kütüphane ile ilgili tüm API endpoint'lerini tanımlar
 */

import { Router } from 'express';
import { LibraryController } from '../controllers/LibraryController';
import { authenticateToken } from '../middleware/auth';
import { validateSchema, validateIdParam } from '../middleware/validation';
import { 
  LibraryCreateSchema,
  LibraryUpdateSchema,
  PaginationSchema 
} from '../schemas/validationSchemas';

// Express Router oluştur
const router = Router();

// =====================================
// KORUNMUŞ ENDPOINT'LER (Tümü kimlik doğrulaması gerektirir)
// =====================================

// Tüm kütüphane route'ları kimlik doğrulaması gerektirir
router.use(authenticateToken);

/**
 * POST /api/libraries/
 * Yeni kütüphane oluşturur
 */
router.post('/', validateSchema(LibraryCreateSchema), LibraryController.createLibrary);

/**
 * GET /api/libraries/
 * Tüm kütüphaneleri listeler (sayfalanmış)
 */
router.get('/', validateSchema(PaginationSchema, 'query'), LibraryController.getAllLibraries);

/**
 * GET /api/libraries/:id
 * Belirli bir kütüphanenin detay bilgilerini getirir
 */
router.get('/:id', validateIdParam, LibraryController.getLibraryById);

/**
 * PUT /api/libraries/:id
 * Kütüphane bilgilerini günceller
 */
router.put('/:id', validateIdParam, validateSchema(LibraryUpdateSchema), LibraryController.updateLibrary);

/**
 * DELETE /api/libraries/:id
 * Kütüphaneyi siler (soft delete)
 */
router.delete('/:id', validateIdParam, LibraryController.deleteLibrary);

/**
 * GET /api/libraries/:id/stats
 * Kütüphane istatistiklerini getirir (kitap sayısı, ödünç verilen kitaplar vb.)
 */
router.get('/:id/stats', LibraryController.getLibraryStats);

// Router'ı dışa aktar
export default router;
