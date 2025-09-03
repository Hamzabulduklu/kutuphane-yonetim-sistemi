/**
 * Kitap Değerlendirme ve Yorum Modeli
 * Kullanıcıların kitaplara verdikleri puanlar ve yorumlar için
 */

import mongoose, { Schema, Document } from 'mongoose';
const { ulid } = require('ulid');

/**
 * Değerlendirme Arayüzü
 * Kitap değerlendirmelerinin sahip olacağı tüm özellikleri tanımlar
 */
export interface IReview extends Document {
  _id: string;                    // Benzersiz değerlendirme ID'si (ULID formatında)
  userId: string;                 // Değerlendiren kullanıcının ID'si
  bookId: string;                 // Değerlendirilen kitabın ID'si
  libraryId: string;              // Kütüphanenin ID'si
  borrowRecordId?: string;        // İlgili ödünç alma kaydı (opsiyonel)
  rating: number;                 // Puan (1-5 arasında)
  title?: string;                 // Yorum başlığı (opsiyonel)
  comment?: string;               // Yorum metni (opsiyonel)
  pros?: string[];                // Artıları (opsiyonel)
  cons?: string[];                // Eksileri (opsiyonel)
  isAnonymous: boolean;           // Anonim değerlendirme mi?
  isApproved: boolean;            // Moderatör onayı
  moderatorNote?: string;         // Moderatör notu
  helpfulVotes: number;           // Faydalı oy sayısı
  reportCount: number;            // Şikayet sayısı
  isActive: boolean;              // Aktiflik durumu
  readingDate?: Date;             // Okuma tarihi
  recommendedAge?: string;        // Önerilen yaş grubu
  tags?: string[];                // Etiketler (genre, mood, vb.)
  spoilerWarning: boolean;        // Spoiler uyarısı var mı?
  createdAt: Date;                // Oluşturulma tarihi
  updatedAt: Date;                // Güncellenme tarihi
}

/**
 * Değerlendirme MongoDB Şeması
 * Veritabanında değerlendirmelerin nasıl saklanacağını tanımlar
 */
const ReviewSchema: Schema = new Schema({
  // Benzersiz ID - ULID formatında otomatik oluşturulur
  _id: {
    type: String,
    default: () => ulid(),
  },
  
  // Kullanıcı ID'si - zorunlu
  userId: {
    type: String,
    required: [true, 'Kullanıcı ID\'si zorunludur'],
    ref: 'User',
  },
  
  // Kitap ID'si - zorunlu
  bookId: {
    type: String,
    required: [true, 'Kitap ID\'si zorunludur'],
    ref: 'Book',
  },
  
  // Kütüphane ID'si - zorunlu
  libraryId: {
    type: String,
    required: [true, 'Kütüphane ID\'si zorunludur'],
    ref: 'Library',
  },
  
  // Ödünç alma kaydı ID'si - opsiyonel
  borrowRecordId: {
    type: String,
    ref: 'BorrowRecord',
  },
  
  // Puan - zorunlu, 1-5 arasında
  rating: {
    type: Number,
    required: [true, 'Puan zorunludur'],
    min: [1, 'Puan en az 1 olmalıdır'],
    max: [5, 'Puan en fazla 5 olmalıdır'],
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value) && value >= 1 && value <= 5;
      },
      message: 'Puan 1-5 arasında tam sayı olmalıdır'
    }
  },
  
  // Yorum başlığı - opsiyonel
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Başlık 200 karakteri geçemez'],
  },
  
  // Yorum metni - opsiyonel
  comment: {
    type: String,
    trim: true,
    maxlength: [2000, 'Yorum 2000 karakteri geçemez'],
  },
  
  // Artıları - opsiyonel
  pros: [{
    type: String,
    trim: true,
    maxlength: [500, 'Her artı 500 karakteri geçemez'],
  }],
  
  // Eksileri - opsiyonel
  cons: [{
    type: String,
    trim: true,
    maxlength: [500, 'Her eksi 500 karakteri geçemez'],
  }],
  
  // Anonim değerlendirme - varsayılan false
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  
  // Moderatör onayı - varsayılan true
  isApproved: {
    type: Boolean,
    default: true,
  },
  
  // Moderatör notu - opsiyonel
  moderatorNote: {
    type: String,
    trim: true,
    maxlength: [500, 'Moderatör notu 500 karakteri geçemez'],
  },
  
  // Faydalı oy sayısı - varsayılan 0
  helpfulVotes: {
    type: Number,
    default: 0,
    min: [0, 'Faydalı oy sayısı negatif olamaz'],
  },
  
  // Şikayet sayısı - varsayılan 0
  reportCount: {
    type: Number,
    default: 0,
    min: [0, 'Şikayet sayısı negatif olamaz'],
  },
  
  // Aktiflik durumu - varsayılan true
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Okuma tarihi - opsiyonel
  readingDate: {
    type: Date,
  },
  
  // Önerilen yaş grubu - opsiyonel
  recommendedAge: {
    type: String,
    enum: {
      values: ['0-6', '7-12', '13-17', '18+', 'all'],
      message: 'Geçersiz yaş grubu'
    }
  },
  
  // Etiketler - opsiyonel
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Her etiket 50 karakteri geçemez'],
  }],
  
  // Spoiler uyarısı - varsayılan false
  spoilerWarning: {
    type: Boolean,
    default: false,
  },
  
}, {
  timestamps: true,  // createdAt ve updatedAt otomatik eklenir
  versionKey: false, // __v alanını kaldırır
});

// Performans için indeksler
ReviewSchema.index({ userId: 1 });                    // Kullanıcıya göre arama
ReviewSchema.index({ bookId: 1 });                    // Kitaba göre arama
ReviewSchema.index({ libraryId: 1 });                 // Kütüphaneye göre arama
ReviewSchema.index({ rating: 1 });                    // Puana göre filtreleme
ReviewSchema.index({ isApproved: 1 });                // Onay durumuna göre filtreleme
ReviewSchema.index({ isActive: 1 });                  // Aktiflik durumuna göre filtreleme
ReviewSchema.index({ createdAt: -1 });                // Tarihe göre sıralama (yeni->eski)
ReviewSchema.index({ helpfulVotes: -1 });             // Faydalı oy sayısına göre sıralama

// Birleşik indeksler
ReviewSchema.index({ bookId: 1, isApproved: 1, isActive: 1 }); // Kitap değerlendirmeleri
ReviewSchema.index({ userId: 1, bookId: 1 }, { unique: true }); // Bir kullanıcı bir kitaba sadece bir değerlendirme
ReviewSchema.index({ bookId: 1, rating: 1 });                  // Kitap ve puan filtreleme

// Middleware: Bir kullanıcı aynı kitaba birden fazla değerlendirme yapamamalı
ReviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingReview = await mongoose.model('Review').findOne({
      userId: this.userId,
      bookId: this.bookId,
      _id: { $ne: this._id }
    });
    
    if (existingReview) {
      const error = new Error('Bu kitap için zaten bir değerlendirmeniz bulunmaktadır');
      return next(error);
    }
  }
  next();
});

// Modeli dışa aktar
export default mongoose.model<IReview>('Review', ReviewSchema);
