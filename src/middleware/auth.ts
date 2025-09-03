import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

/**
 * Kimlik Doğrulama ve Yetkilendirme Middleware'leri
 * JWT token ve şifre işlemleri için yardımcı fonksiyonlar
 */

/**
 * Genişletilmiş Request arayüzü
 * Kimlik doğrulanmış kullanıcı bilgilerini içerir
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;       // Kullanıcı ID'si
    username: string; // Kullanıcı adı
    email: string;    // Email adresi
  };
}

// Çevre değişkenlerinden JWT ayarlarını al
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * JWT Token oluşturma fonksiyonu
 * @param payload - Token'da saklanacak veri (kullanıcı bilgileri)
 * @returns Oluşturulan JWT token string'i
 */
export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

/**
 * JWT Token doğrulama fonksiyonu
 * @param token - Doğrulanacak JWT token
 * @returns Token'dan çıkarılan veri veya hata
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Şifre hashleme fonksiyonu
 * @param password - Hashlenecek düz metin şifre
 * @returns Hashlenmiş şifre
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // Güvenlik seviyesi (12 yeterli)
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Şifre karşılaştırma fonksiyonu
 * @param password - Düz metin şifre
 * @param hashedPassword - Hashlenmiş şifre
 * @returns Şifrelerin eşleşip eşleşmediği
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * JWT Token doğrulama middleware'i
 * API endpoint'lerini korumak için kullanılır
 * @param req - HTTP isteği
 * @param res - HTTP yanıtı
 * @param next - Bir sonraki middleware'e geçiş fonksiyonu
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // Authorization header'ından token'ı al
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" formatından TOKEN kısmını al
  
  // Token yoksa hata döndür
  if (!token) {
    res.status(401).json({ 
      message: 'Erişim token\'ı gereklidir',
      error: 'MISSING_TOKEN'
    });
    return;
  }

  try {
    // Token'ı doğrula ve kullanıcı bilgilerini çıkar
    const decoded = verifyToken(token as string);
    req.user = decoded; // Kullanıcı bilgilerini request'e ekle
    next(); // Bir sonraki middleware'e geç
  } catch (error) {
    // Token geçersiz veya süresi dolmuşsa hata döndür
    res.status(403).json({ 
      message: 'Geçersiz veya süresi dolmuş token',
      error: 'INVALID_TOKEN'
    });
  }
};
