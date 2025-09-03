/**
 * Ceza ve Ödeme Route Tanımları
 * Ceza işlemleri ile ilgili tüm API endpoint'lerini tanımlar
 */

import { Router } from 'express';
import { FineController } from '../controllers/FineController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// =====================================
// KORUNMUŞ ENDPOINT'LER (Kimlik doğrulaması gerektirir)
// =====================================

// Tüm ceza route'ları kimlik doğrulaması gerektirir
router.use(authenticateToken);

/**
 * POST /api/fines/calculate
 * Geciken ödünç alma kayıtları için otomatik ceza hesaplama
 * Admin yetkisi gerektirir
 */
router.post('/calculate', FineController.calculateOverdueFines);

/**
 * GET /api/fines/my
 * Giriş yapan kullanıcının cezalarını listeler
 */
router.get('/my', FineController.getUserFines);

/**
 * GET /api/fines/
 * Tüm cezaları listeler (admin/staff)
 * Filtreleme ve sayfalama destekler
 */
router.get('/', FineController.getAllFines);

/**
 * GET /api/fines/settings
 * Ceza hesaplama ayarlarını getirir
 */
router.get('/settings', FineController.getFineSettings);

/**
 * GET /api/fines/statistics
 * Ceza istatistiklerini getirir (admin/staff)
 */
router.get('/statistics', FineController.getFineStatistics);

/**
 * POST /api/fines/:id/pay
 * Belirli bir cezayı öder
 */
router.post('/:id/pay', FineController.payFine);

/**
 * POST /api/fines/:id/cancel
 * Belirli bir cezayı iptal eder (admin)
 */
router.post('/:id/cancel', FineController.cancelFine);

export default router;
