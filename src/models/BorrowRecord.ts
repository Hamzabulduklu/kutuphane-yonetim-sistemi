/**
 * Ödünç Alma Kayıt Modeli ve MongoDB Şeması
 * Kullanıcıların kitap ödünç alma işlemlerini izlemek için kullanılır
 */

import mongoose, { Schema, Document } from 'mongoose';
const { ulid } = require('ulid');

/**
 * Ödünç Alma Kayıt Arayüzü
 * Ödünç alma işlemlerinin sahip olacağı tüm özellikleri tanımlar
 */
export interface IBorrowRecord extends Document {
  _id: string;           // Benzersiz kayıt ID'si (ULID formatında)
  userId: string;        // Ödünç alan kullanıcının ID'si
  bookId: string;        // Ödünç alınan kitabın ID'si
  libraryId: string;     // Kütüphanenin ID'si
  borrowDate: Date;      // Ödünç alınma tarihi
  dueDate: Date;         // Geri verme tarihi
  returnDate?: Date;     // Gerçek geri verme tarihi (opsiyonel)
  isReturned: boolean;   // Kitabın geri verilip verilmediği
  fine?: number;         // Gecikme cezası (opsiyonel)
  notes?: string;        // Notlar (opsiyonel)
  createdAt: Date;       // Oluşturulma tarihi
  updatedAt: Date;       // Güncellenme tarihi
}

/**
 * Ödünç Alma Kayıt MongoDB Şeması
 * Veritabanında ödünç alma kayıtlarının nasıl saklanacağını tanımlar
 */
const BorrowRecordSchema: Schema = new Schema({
  // Benzersiz ID - ULID formatında otomatik oluşturulur
  _id: {
    type: String,
    default: () => ulid(),
  },
  
  // Kullanıcı ID'si - zorunlu
  userId: {
    type: String,
    required: [true, 'Kullanıcı ID\'si zorunludur'],
    ref: 'User', // User modeline referans
  },
  
  // Kitap ID'si - zorunlu
  bookId: {
    type: String,
    required: [true, 'Kitap ID\'si zorunludur'],
    ref: 'Book', // Book modeline referans
  },
  
  // Kütüphane ID'si - zorunlu
  libraryId: {
    type: String,
    required: [true, 'Kütüphane ID\'si zorunludur'],
    ref: 'Library', // Library modeline referans
  },
  
  // Ödünç alınma tarihi - zorunlu, varsayılan olarak şu an
  borrowDate: {
    type: Date,
    required: [true, 'Ödünç alma tarihi zorunludur'],
    default: Date.now,
  },
  
  // Geri verme tarihi - zorunlu
  dueDate: {
    type: Date,
    required: [true, 'Geri verme tarihi zorunludur'],
  },
  
  // Gerçek geri verme tarihi - opsiyonel
  returnDate: {
    type: Date,
  },
  
  // Kitabın geri verilip verilmediği - varsayılan false
  isReturned: {
    type: Boolean,
    default: false,
  },
  
  // Gecikme cezası - opsiyonel, negatif olamaz
  fine: {
    type: Number,
    min: [0, 'Ceza negatif olamaz'],
    default: 0,
  },
  
  // Notlar - opsiyonel, maksimum 500 karakter
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notlar 500 karakteri geçemez'],
  },
}, {
  timestamps: true,  // createdAt ve updatedAt otomatik eklenir
  versionKey: false, // __v alanını kaldırır
});

// Performans için indeksler
BorrowRecordSchema.index({ userId: 1 });      // Kullanıcıya göre arama
BorrowRecordSchema.index({ bookId: 1 });      // Kitaba göre arama
BorrowRecordSchema.index({ libraryId: 1 });   // Kütüphaneye göre arama
BorrowRecordSchema.index({ isReturned: 1 });  // Geri verme durumuna göre filtreleme
BorrowRecordSchema.index({ borrowDate: 1 });  // Ödünç alma tarihine göre sıralama
BorrowRecordSchema.index({ dueDate: 1 });     // Geri verme tarihine göre sıralama

// Ödünç alma kayıt modelini dışa aktar
export default mongoose.model<IBorrowRecord>('BorrowRecord', BorrowRecordSchema);
