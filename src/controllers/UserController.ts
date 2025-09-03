import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { hashPassword, comparePassword, generateToken, AuthenticatedRequest } from '../middleware/auth';
import { 
  UserRegisterSchema,
  UserLoginSchema,
  UserUpdateSchema,
  PaginationSchema 
} from '../schemas/validationSchemas';

/**
 * Kullanıcı İşlemleri Controller Sınıfı
 * Bu sınıf kullanıcılarla ilgili tüm işlemleri yönetir
 */
export class UserController {
  
  /**
   * Yeni kullanıcı kayıt fonksiyonu
   * @param req - HTTP isteği (kullanıcı bilgilerini içerir)
   * @param res - HTTP yanıtı
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Zod ile input doğrulama
      const validationResult = UserRegisterSchema.safeParse(req.body);
      
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

      const { username, email, password, firstName, lastName, maxBooks } = validationResult.data;

      // Aynı email veya kullanıcı adına sahip kullanıcı var mı kontrol et
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        res.status(409).json({ 
          success: false,
          message: 'Bu email veya kullanıcı adına sahip kullanıcı zaten mevcut' 
        });
        return;
      }

      // Şifreyi hashle (güvenlik için)
      const hashedPassword = await hashPassword(password);

      // Yeni kullanıcı oluştur
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        maxBooks: maxBooks || 5, // Varsayılan olarak 5 kitap
      });

      // Kullanıcıyı veritabanına kaydet
      const savedUser = await newUser.save();

      // Şifreyi yanıttan çıkar (güvenlik için)
      const userResponse = savedUser.toObject();
      const { password: _, ...userWithoutPassword } = userResponse;

      // Başarılı yanıt gönder
      res.status(201).json({
        success: true,
        message: 'Kullanıcı başarıyla kaydedildi',
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error('Kayıt hatası:', error);
      res.status(500).json({ 
        success: false,
        message: 'Sunucu hatası' 
      });
    }
  }

  /**
   * Kullanıcı giriş fonksiyonu
   * @param req - HTTP isteği (giriş bilgilerini içerir)
   * @param res - HTTP yanıtı
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Zod ile input doğrulama
      const validationResult = UserLoginSchema.safeParse(req.body);
      
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

      const { username, password } = validationResult.data;

      // Kullanıcıyı kullanıcı adı veya email ile bul
      const user = await User.findOne({
        $or: [{ username }, { email: username }],
        isActive: true,
      });

      if (!user) {
        res.status(401).json({ 
          success: false,
          message: 'Geçersiz kimlik bilgileri' 
        });
        return;
      }

      // Şifreyi kontrol et
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ 
          success: false,
          message: 'Geçersiz kimlik bilgileri' 
        });
        return;
      }

      // JWT token oluştur
      const token = generateToken({
        id: user._id,
        username: user.username,
        email: user.email,
      });

      // Şifreyi yanıttan çıkar
      const userResponse = user.toObject();
      const { password: _, ...userWithoutPassword } = userResponse;

      // Başarılı giriş yanıtı gönder
      res.status(200).json({
        success: true,
        message: 'Giriş başarılı',
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error('Giriş hatası:', error);
      res.status(500).json({ 
        success: false,
        message: 'Sunucu hatası' 
      });
    }
  }

  /**
   * Tüm kullanıcıları listeleme fonksiyonu (sayfalama ile)
   * @param req - HTTP isteği (sayfa parametrelerini içerir)
   * @param res - HTTP yanıtı
   */
  static async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Zod ile query parametrelerini doğrula
      const validationResult = PaginationSchema.safeParse(req.query);
      
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

      // Sayfa ve limit parametrelerini al
      const { page = 1, limit = 10 } = validationResult.data;
      const skip = (page - 1) * limit;

      // Aktif kullanıcıları getir (şifre hariç)
      const users = await User.find({ isActive: true })
        .select('-password') // Şifreyi dahil etme
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // En yeni kayıtlar önce

      // Toplam kullanıcı sayısını hesapla
      const total = await User.countDocuments({ isActive: true });

      // Sonuçları gönder
      res.status(200).json({
        success: true,
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Kullanıcıları getirme hatası:', error);
      res.status(500).json({ 
        success: false,
        message: 'Sunucu hatası' 
      });
    }
  }

  /**
   * ID'ye göre kullanıcı getirme fonksiyonu
   * @param req - HTTP isteği (kullanıcı ID'sini içerir)
   * @param res - HTTP yanıtı
   */
  static async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Kullanıcıyı ID'ye göre bul ve ödünç aldığı kitapları da getir
      const user = await User.findOne({ _id: id, isActive: true })
        .select('-password') // Şifreyi dahil etme
        .populate('borrowedBooks'); // Ödünç alınan kitap detayları

      if (!user) {
        res.status(404).json({ 
          success: false,
          message: 'Kullanıcı bulunamadı' 
        });
        return;
      }

      res.status(200).json({ 
        success: true,
        user 
      });
    } catch (error) {
      console.error('Kullanıcı getirme hatası:', error);
      res.status(500).json({ 
        success: false,
        message: 'Sunucu hatası' 
      });
    }
  }

  /**
   * Kullanıcı güncelleme fonksiyonu
   * @param req - HTTP isteği (güncellenecek kullanıcı bilgilerini içerir)
   * @param res - HTTP yanıtı
   */
  static async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Zod ile input doğrulama
      const validationResult = UserUpdateSchema.safeParse(req.body);
      
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

      const updateData = validationResult.data;

      // Kullanıcının var olup olmadığını kontrol et
      const user = await User.findOne({ _id: id, isActive: true });
      if (!user) {
        res.status(404).json({ 
          success: false,
          message: 'Kullanıcı bulunamadı' 
        });
        return;
      }

      // Email değiştiriliyorsa çakışma kontrolü yap
      if (updateData.email) {
        const duplicateUser = await User.findOne({
          _id: { $ne: id },
          email: updateData.email
        });

        if (duplicateUser) {
          res.status(409).json({ 
            success: false,
            message: 'Bu email adresi zaten kullanılmaktadır' 
          });
          return;
        }
      }

      // Kullanıcıyı güncelle
      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password'); // Şifreyi dahil etme

      res.status(200).json({
        success: true,
        message: 'Kullanıcı başarıyla güncellendi',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      res.status(500).json({ 
        success: false,
        message: 'Sunucu hatası' 
      });
    }
  }

  /**
   * Kullanıcı silme fonksiyonu (soft delete - veritabanından fiziksel olarak silmez)
   * @param req - HTTP isteği (silinecek kullanıcı ID'sini içerir)
   * @param res - HTTP yanıtı
   */
  static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // URL parametresinden kullanıcı ID'sini al
      const { id } = req.params;

      // Kullanıcının var olup olmadığını kontrol et
      const user = await User.findOne({ _id: id, isActive: true });
      if (!user) {
        res.status(404).json({ 
          success: false,
          message: 'Kullanıcı bulunamadı' 
        });
        return;
      }

      // Kullanıcının ödünç aldığı kitap var mı kontrol et
      if (user.borrowedBooks.length > 0) {
        res.status(400).json({ 
          success: false,
          message: 'Ödünç kitabı olan kullanıcı silinemez. Önce tüm kitapları iade etmelidir.' 
        });
        return;
      }

      // Soft delete işlemi (isActive durumunu false yap)
      await User.findByIdAndUpdate(id, { isActive: false });

      res.status(200).json({ 
        success: true,
        message: 'Kullanıcı başarıyla silindi' 
      });
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      res.status(500).json({ 
        success: false,
        message: 'Sunucu hatası' 
      });
    }
  }

  /**
   * Mevcut kullanıcının profil bilgilerini getiren fonksiyon
   * JWT token'dan kullanıcı bilgilerini alır ve profil detaylarını döndürür
   * @param req - HTTP isteği (JWT token'dan gelen kullanıcı bilgilerini içerir)
   * @param res - HTTP yanıtı
   */
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Token'dan kullanıcı ID'sini al
      const userId = req.user?.id;

      // Kullanıcıyı bul ve ödünç aldığı kitapları da getir
      const user = await User.findOne({ _id: userId, isActive: true })
        .select('-password') // Şifreyi dahil etme
        .populate('borrowedBooks'); // Ödünç alınan kitap detayları

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
