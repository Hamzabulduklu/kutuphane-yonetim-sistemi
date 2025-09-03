import { z } from 'zod';

// User Schemas
export const UserRegisterSchema = z.object({
  username: z.string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(30, 'Kullanıcı adı en fazla 30 karakter olabilir')
    .regex(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
  email: z.string()
    .email('Geçerli bir email adresi giriniz'),
  password: z.string()
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .max(100, 'Şifre en fazla 100 karakter olabilir'),
  firstName: z.string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  lastName: z.string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olabilir'),
  maxBooks: z.number()
    .int('Maksimum kitap sayısı tam sayı olmalıdır')
    .min(1, 'Maksimum kitap sayısı en az 1 olmalıdır')
    .max(50, 'Maksimum kitap sayısı en fazla 50 olabilir')
    .optional()
});

export const UserLoginSchema = z.object({
  username: z.string()
    .min(1, 'Kullanıcı adı veya email gereklidir'),
  password: z.string()
    .min(1, 'Şifre gereklidir')
});

export const UserUpdateSchema = z.object({
  firstName: z.string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olabilir')
    .optional(),
  lastName: z.string()
    .min(2, 'Soyad en az 2 karakter olmalıdır')
    .max(50, 'Soyad en fazla 50 karakter olabilir')
    .optional(),
  email: z.string()
    .email('Geçerli bir email adresi giriniz')
    .optional(),
  maxBooks: z.number()
    .int('Maksimum kitap sayısı tam sayı olmalıdır')
    .min(1, 'Maksimum kitap sayısı en az 1 olmalıdır')
    .max(50, 'Maksimum kitap sayısı en fazla 50 olabilir')
    .optional()
});

// Book Schemas
export const BookCreateSchema = z.object({
  title: z.string()
    .min(1, 'Kitap başlığı gereklidir')
    .max(200, 'Kitap başlığı en fazla 200 karakter olabilir'),
  author: z.string()
    .min(1, 'Yazar adı gereklidir')
    .max(100, 'Yazar adı en fazla 100 karakter olabilir'),
  isbn: z.string()
    .regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'Geçerli bir ISBN numarası giriniz')
    .optional(),
  publisher: z.string()
    .min(1, 'Yayınevi gereklidir')
    .max(100, 'Yayınevi en fazla 100 karakter olabilir'),
  publishedYear: z.number()
    .int('Yayın yılı tam sayı olmalıdır')
    .min(1000, 'Yayın yılı 1000\'den büyük olmalıdır')
    .max(new Date().getFullYear(), 'Yayın yılı gelecek bir tarih olamaz'),
  category: z.string()
    .min(1, 'Kategori gereklidir')
    .max(50, 'Kategori en fazla 50 karakter olabilir'),
  description: z.string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional(),
  totalCopies: z.number()
    .int('Toplam kopya sayısı tam sayı olmalıdır')
    .min(1, 'Toplam kopya sayısı en az 1 olmalıdır')
    .max(1000, 'Toplam kopya sayısı en fazla 1000 olabilir'),
  libraryId: z.string()
    .min(1, 'Kütüphane ID gereklidir')
});

export const BookUpdateSchema = z.object({
  title: z.string()
    .min(1, 'Kitap başlığı gereklidir')
    .max(200, 'Kitap başlığı en fazla 200 karakter olabilir')
    .optional(),
  author: z.string()
    .min(1, 'Yazar adı gereklidir')
    .max(100, 'Yazar adı en fazla 100 karakter olabilir')
    .optional(),
  isbn: z.string()
    .regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'Geçerli bir ISBN numarası giriniz')
    .optional(),
  publisher: z.string()
    .min(1, 'Yayınevi gereklidir')
    .max(100, 'Yayınevi en fazla 100 karakter olabilir')
    .optional(),
  publishedYear: z.number()
    .int('Yayın yılı tam sayı olmalıdır')
    .min(1000, 'Yayın yılı 1000\'den büyük olmalıdır')
    .max(new Date().getFullYear(), 'Yayın yılı gelecek bir tarih olamaz')
    .optional(),
  category: z.string()
    .min(1, 'Kategori gereklidir')
    .max(50, 'Kategori en fazla 50 karakter olabilir')
    .optional(),
  description: z.string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional(),
  totalCopies: z.number()
    .int('Toplam kopya sayısı tam sayı olmalıdır')
    .min(1, 'Toplam kopya sayısı en az 1 olmalıdır')
    .max(1000, 'Toplam kopya sayısı en fazla 1000 olabilir')
    .optional()
});

// Library Schemas
export const LibraryCreateSchema = z.object({
  name: z.string()
    .min(1, 'Kütüphane adı gereklidir')
    .max(100, 'Kütüphane adı en fazla 100 karakter olabilir'),
  address: z.string()
    .min(1, 'Adres gereklidir')
    .max(300, 'Adres en fazla 300 karakter olabilir'),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{10,20}$/, 'Geçerli bir telefon numarası giriniz')
    .optional(),
  email: z.string()
    .email('Geçerli bir email adresi giriniz')
    .optional(),
  operatingHours: z.string()
    .max(200, 'Çalışma saatleri en fazla 200 karakter olabilir')
    .optional()
});

export const LibraryUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Kütüphane adı gereklidir')
    .max(100, 'Kütüphane adı en fazla 100 karakter olabilir')
    .optional(),
  address: z.string()
    .min(1, 'Adres gereklidir')
    .max(300, 'Adres en fazla 300 karakter olabilir')
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{10,20}$/, 'Geçerli bir telefon numarası giriniz')
    .optional(),
  email: z.string()
    .email('Geçerli bir email adresi giriniz')
    .optional(),
  operatingHours: z.string()
    .max(200, 'Çalışma saatleri en fazla 200 karakter olabilir')
    .optional()
});

// Borrow Record Schemas
export const BorrowBookSchema = z.object({
  bookId: z.string()
    .min(1, 'Kitap ID gereklidir'),
  dueDate: z.string()
    .datetime('Geçerli bir tarih formatı giriniz (ISO 8601)')
    .optional()
});

export const ReturnBookSchema = z.object({
  borrowRecordId: z.string()
    .min(1, 'Ödünç alma kayıt ID gereklidir')
});

// Review Schemas
export const ReviewCreateSchema = z.object({
  bookId: z.string()
    .min(1, 'Kitap ID gereklidir'),
  rating: z.number()
    .int('Puan tam sayı olmalıdır')
    .min(1, 'Puan en az 1 olmalıdır')
    .max(5, 'Puan en fazla 5 olabilir'),
  comment: z.string()
    .min(1, 'Yorum gereklidir')
    .max(1000, 'Yorum en fazla 1000 karakter olabilir')
});

export const ReviewUpdateSchema = z.object({
  rating: z.number()
    .int('Puan tam sayı olmalıdır')
    .min(1, 'Puan en az 1 olmalıdır')
    .max(5, 'Puan en fazla 5 olabilir')
    .optional(),
  comment: z.string()
    .min(1, 'Yorum gereklidir')
    .max(1000, 'Yorum en fazla 1000 karakter olabilir')
    .optional()
});

// Fine Schemas
export const FinePaymentSchema = z.object({
  amount: z.number()
    .positive('Ödeme miktarı pozitif olmalıdır')
});

// Query Parameter Schemas
export const PaginationSchema = z.object({
  page: z.coerce.number()
    .int('Sayfa numarası tam sayı olmalıdır')
    .min(1, 'Sayfa numarası en az 1 olmalıdır')
    .optional(),
  limit: z.coerce.number()
    .int('Limit tam sayı olmalıdır')
    .min(1, 'Limit en az 1 olmalıdır')
    .max(100, 'Limit en fazla 100 olabilir')
    .optional()
});

export const BookSearchSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  category: z.string().optional(),
  libraryId: z.string().optional(),
  available: z.coerce.boolean().optional()
}).merge(PaginationSchema);

export const UserSearchSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional()
}).merge(PaginationSchema);
