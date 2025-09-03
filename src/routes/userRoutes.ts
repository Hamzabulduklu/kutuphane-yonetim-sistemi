/**
 * Kullanıcı Route Tanımları
 * Kullanıcı ile ilgili tüm API endpoint'lerini tanımlar
 */

import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';
import { validateSchema, validateIdParam } from '../middleware/validation';
import { 
  UserRegisterSchema,
  UserLoginSchema,
  UserUpdateSchema,
  PaginationSchema 
} from '../schemas/validationSchemas';

// Express Router oluştur
const router = Router();

// =====================================
// AÇIK ENDPOINT'LER (Kimlik doğrulaması gerektirmez)
// =====================================

/**
 * POST /api/users/register
 * Yeni kullanıcı kaydı oluşturur
 */
router.post('/register', validateSchema(UserRegisterSchema), UserController.register);

/**
 * POST /api/users/login  
 * Kullanıcı girişi yapar ve JWT token döndürür
 */
router.post('/login', validateSchema(UserLoginSchema), UserController.login);

// =====================================
// KORUNMUŞ ENDPOINT'LER (Kimlik doğrulaması gerektirir)
// =====================================

// Bu noktadan sonra tüm route'lar kimlik doğrulaması gerektirir
router.use(authenticateToken);

/**
 * GET /api/users/profile
 * Giriş yapmış kullanıcının profil bilgilerini getirir
 */
router.get('/profile', UserController.getProfile);

/**
 * GET /api/users/
 * Tüm kullanıcıları listeler (sayfalanmış)
 */
router.get('/', validateSchema(PaginationSchema, 'query'), UserController.getAllUsers);

/**
 * GET /api/users/:id
 * Belirli bir kullanıcının detay bilgilerini getirir
 */
router.get('/:id', validateIdParam, UserController.getUserById);

/**
 * PUT /api/users/:id
 * Kullanıcı bilgilerini günceller
 */
router.put('/:id', validateIdParam, validateSchema(UserUpdateSchema), UserController.updateUser);

/**
 * DELETE /api/users/:id
 * Kullanıcıyı siler (soft delete)
 */
router.delete('/:id', validateIdParam, UserController.deleteUser);

// Router'ı dışa aktar
export default router;
