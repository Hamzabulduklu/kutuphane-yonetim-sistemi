import mongoose, { Schema, Document } from 'mongoose';
const { ulid } = require('ulid');

/**
 * Kitap Veri Mod  // Ödünç alan kullanıcıların ID'leri
  borrowedBy: [{
    type: String,
    ref: 'User', // User modeline referans
  }],
  
  // Değerlendirme bilgileri
  rating: {
    // Ortalama puan (0-5 arası)
    average: {
      type: Number,
      default: 0,
      min: [0, 'Ortalama puan 0\'dan küçük olamaz'],
      max: [5, 'Ortalama puan 5\'ten büyük olamaz'],
    },
    // Toplam değerlendirme sayısı
    count: {
      type: Number,
      default: 0,
      min: [0, 'Değerlendirme sayısı negatif olamaz'],
    }
  },
  
  // Kitabın aktif olup olmadığı (soft delete için)
  isActive: {
    type: Boolean,
    default: true,
  },
 * Kitapların sahip olacağı tüm özellikleri tanımlar
 */
export interface IBook extends Document {
  _id: string;            // Benzersiz kitap ID'si (ULID formatında)
  title: string;          // Kitap başlığı
  author: string;         // Yazar adı
  isbn?: string;          // ISBN numarası (opsiyonel)
  publisher?: string;     // Yayınevi (opsiyonel)
  publishedYear?: number; // Yayın yılı (opsiyonel)
  category: string;       // Kategori
  description?: string;   // Açıklama (opsiyonel)
  totalCopies: number;    // Toplam kopya sayısı
  availableCopies: number;// Müsait kopya sayısı
  libraryId: string;      // Hangi kütüphanede olduğu
  borrowedBy: string[];   // Kitabı ödünç alan kullanıcı ID'leri
  rating: {               // Değerlendirme bilgileri
    average: number;      // Ortalama puan (0-5)
    count: number;        // Toplam değerlendirme sayısı
  };
  isActive: boolean;      // Kitabın aktif olup olmadığı
  createdAt: Date;        // Oluşturulma tarihi
  updatedAt: Date;        // Güncellenme tarihi
}

/**
 * Kitap MongoDB Şeması
 * Veritabanında kitap verilerinin nasıl saklanacağını tanımlar
 */
const BookSchema: Schema = new Schema({
  // Benzersiz ID - ULID formatında otomatik oluşturulur
  _id: {
    type: String,
    default: () => ulid(),
  },
  
  // Kitap başlığı - zorunlu, maksimum 200 karakter
  title: {
    type: String,
    required: [true, 'Kitap başlığı zorunludur'],
    trim: true,
    maxlength: [200, 'Başlık 200 karakteri geçemez'],
  },
  
  // Yazar adı - zorunlu, maksimum 100 karakter
  author: {
    type: String,
    required: [true, 'Yazar adı zorunludur'],
    trim: true,
    maxlength: [100, 'Yazar adı 100 karakteri geçemez'],
  },
  
  // ISBN numarası - opsiyonel, benzersiz, geçerli ISBN formatı
  isbn: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // Null değerlerde unique constraint'i uygulamaz
    match: [/^(?:\d{9}[\dX]|\d{13})$/, 'Lütfen geçerli bir ISBN giriniz'],
  },
  
  // Yayınevi - opsiyonel, maksimum 100 karakter
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Yayınevi adı 100 karakteri geçemez'],
  },
  
  // Yayın yılı - opsiyonel, geçerli yıl aralığında
  publishedYear: {
    type: Number,
    min: [1000, 'Yayın yılı geçerli olmalıdır'],
    max: [new Date().getFullYear(), 'Yayın yılı gelecekte olamaz'],
  },
  
  // Kategori - zorunlu, maksimum 50 karakter
  category: {
    type: String,
    required: [true, 'Kategori zorunludur'],
    trim: true,
    maxlength: [50, 'Kategori 50 karakteri geçemez'],
  },
  
  // Açıklama - opsiyonel, maksimum 1000 karakter
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Açıklama 1000 karakteri geçemez'],
  },
  
  // Toplam kopya sayısı - zorunlu, en az 1
  totalCopies: {
    type: Number,
    required: [true, 'Toplam kopya sayısı zorunludur'],
    min: [1, 'Toplam kopya sayısı en az 1 olmalıdır'],
  },
  
  // Müsait kopya sayısı - zorunlu, negatif olamaz
  availableCopies: {
    type: Number,
    required: [true, 'Müsait kopya sayısı zorunludur'],
    min: [0, 'Müsait kopya sayısı negatif olamaz'],
  },
  
  // Kütüphane ID'si - zorunlu
  libraryId: {
    type: String,
    required: [true, 'Kütüphane ID\'si zorunludur'],
    ref: 'Library', // Library modeline referans
  },
  
  // Kitabı ödünç alan kullanıcıların ID'leri
  borrowedBy: [{
    type: String,
    ref: 'User', // User modeline referans
  }],
  
  // Kitabın aktif olup olmadığı (soft delete için)
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,  // createdAt ve updatedAt otomatik eklenir
  versionKey: false, // __v alanını kaldırır
});

/**
 * Kaydetmeden önce doğrulama
 * Müsait kopya sayısının toplam kopya sayısını geçmemesini sağlar
 */
BookSchema.pre<IBook>('save', function(next) {
  if (this.availableCopies > this.totalCopies) {
    next(new Error('Müsait kopya sayısı toplam kopya sayısını geçemez'));
  } else {
    next();
  }
});

// Performans için indeksler
BookSchema.index({ title: 1 });      // Başlığa göre arama
BookSchema.index({ author: 1 });     // Yazara göre arama
BookSchema.index({ category: 1 });   // Kategoriye göre arama
BookSchema.index({ libraryId: 1 });  // Kütüphaneye göre arama
// Not: isbn için unique: true zaten indeks oluşturur, tekrar tanımlamaya gerek yok
BookSchema.index({ isActive: 1 });   // Aktif kitaplara göre filtreleme

// Kitap modelini dışa aktar
export default mongoose.model<IBook>('Book', BookSchema);
