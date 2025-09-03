/**
 * Ceza ve Ödeme Modeli
 * Geciken kitap ödünç alma işlemleri için ceza sistemi
 */

import mongoose, { Schema, Document } from 'mongoose';
const { ulid } = require('ulid');

/**
 * Ceza Arayüzü
 * Ceza kayıtlarının sahip olacağı tüm özellikleri tanımlar
 */
export interface IFine extends Document {
  _id: string;                    // Benzersiz ceza ID'si (ULID formatında)
  userId: string;                 // Ceza alan kullanıcının ID'si
  borrowRecordId: string;         // İlgili ödünç alma kaydının ID'si
  bookId: string;                 // Geciken kitabın ID'si
  libraryId: string;              // Kütüphanenin ID'si
  amount: number;                 // Ceza miktarı (TL)
  currency: string;               // Para birimi (varsayılan: TRY)
  reason: string;                 // Ceza sebebi
  description?: string;           // Ek açıklama
  daysOverdue: number;            // Gecikme gün sayısı
  calculationDate: Date;          // Cezanın hesaplandığı tarih
  dueDate: Date;                  // Cezanın ödenme tarihi
  isPaid: boolean;                // Cezanın ödenip ödenmediği
  paymentDate?: Date;             // Ödeme tarihi
  paymentMethod?: string;         // Ödeme yöntemi (cash, card, transfer)
  paymentReference?: string;      // Ödeme referans numarası
  status: 'pending' | 'paid' | 'cancelled' | 'waived'; // Ceza durumu
  isActive: boolean;              // Cezanın aktif olup olmadığı
  createdAt: Date;                // Oluşturulma tarihi
  updatedAt: Date;                // Güncellenme tarihi
}

/**
 * Ceza MongoDB Şeması
 * Veritabanında ceza kayıtlarının nasıl saklanacağını tanımlar
 */
const FineSchema: Schema = new Schema({
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
  
  // Ödünç alma kaydı ID'si - zorunlu
  borrowRecordId: {
    type: String,
    required: [true, 'Ödünç alma kaydı ID\'si zorunludur'],
    ref: 'BorrowRecord',
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
  
  // Ceza miktarı - zorunlu, pozitif değer
  amount: {
    type: Number,
    required: [true, 'Ceza miktarı zorunludur'],
    min: [0, 'Ceza miktarı negatif olamaz'],
    validate: {
      validator: function(value: number) {
        return value >= 0;
      },
      message: 'Ceza miktarı 0 veya pozitif olmalıdır'
    }
  },
  
  // Para birimi - varsayılan TRY
  currency: {
    type: String,
    required: true,
    default: 'TRY',
    enum: ['TRY', 'USD', 'EUR'],
    uppercase: true,
  },
  
  // Ceza sebebi - zorunlu
  reason: {
    type: String,
    required: [true, 'Ceza sebebi zorunludur'],
    enum: {
      values: [
        'overdue',           // Gecikme
        'damage',            // Hasar
        'lost',              // Kayıp
        'late_return',       // Geç iade
        'violation',         // Kural ihlali
        'other'              // Diğer
      ],
      message: 'Geçersiz ceza sebebi'
    },
    default: 'overdue'
  },
  
  // Ek açıklama - opsiyonel
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Açıklama 500 karakteri geçemez'],
  },
  
  // Gecikme gün sayısı - pozitif değer
  daysOverdue: {
    type: Number,
    required: [true, 'Gecikme gün sayısı zorunludur'],
    min: [0, 'Gecikme gün sayısı negatif olamaz'],
  },
  
  // Cezanın hesaplandığı tarih
  calculationDate: {
    type: Date,
    required: [true, 'Hesaplama tarihi zorunludur'],
    default: Date.now,
  },
  
  // Cezanın ödenme tarihi (hesaplama tarihinden 30 gün sonra)
  dueDate: {
    type: Date,
    required: [true, 'Ödeme tarihi zorunludur'],
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 30); // 30 gün sonra
      return date;
    }
  },
  
  // Cezanın ödenip ödenmediği
  isPaid: {
    type: Boolean,
    default: false,
  },
  
  // Ödeme tarihi - opsiyonel
  paymentDate: {
    type: Date,
  },
  
  // Ödeme yöntemi - opsiyonel
  paymentMethod: {
    type: String,
    enum: {
      values: ['cash', 'card', 'transfer', 'online', 'check'],
      message: 'Geçersiz ödeme yöntemi'
    }
  },
  
  // Ödeme referans numarası - opsiyonel
  paymentReference: {
    type: String,
    trim: true,
    maxlength: [100, 'Referans numarası 100 karakteri geçemez'],
  },
  
  // Ceza durumu
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'paid', 'cancelled', 'waived'],
      message: 'Geçersiz ceza durumu'
    },
    default: 'pending'
  },
  
  // Aktiflik durumu
  isActive: {
    type: Boolean,
    default: true,
  },
  
}, {
  timestamps: true,  // createdAt ve updatedAt otomatik eklenir
  versionKey: false, // __v alanını kaldırır
});

// Performans için indeksler
FineSchema.index({ userId: 1 });              // Kullanıcıya göre arama
FineSchema.index({ borrowRecordId: 1 });      // Ödünç alma kaydına göre arama
FineSchema.index({ bookId: 1 });              // Kitaba göre arama
FineSchema.index({ libraryId: 1 });           // Kütüphaneye göre arama
FineSchema.index({ status: 1 });              // Duruma göre filtreleme
FineSchema.index({ isPaid: 1 });              // Ödeme durumuna göre filtreleme
FineSchema.index({ calculationDate: 1 });     // Hesaplama tarihine göre sıralama
FineSchema.index({ dueDate: 1 });             // Ödeme tarihine göre sıralama
FineSchema.index({ isActive: 1 });            // Aktif kayıtlar için filtreleme

// Birleşik indeksler
FineSchema.index({ userId: 1, status: 1 });   // Kullanıcı ve durum
FineSchema.index({ libraryId: 1, status: 1 }); // Kütüphane ve durum

// Modeli dışa aktar
export default mongoose.model<IFine>('Fine', FineSchema);
