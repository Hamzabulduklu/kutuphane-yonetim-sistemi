/**
 * Kütüphane Veri Modeli ve MongoDB Şeması
 * Kütüphane bilgilerini saklamak ve yönetmek için kullanılır
 */

import mongoose, { Schema, Document } from 'mongoose';
const { ulid } = require('ulid');

/**
 * Kütüphane Veri Modeli Arayüzü
 * Kütüphanelerin sahip olacağı tüm özellikleri tanımlar
 */
export interface ILibrary extends Document {
  _id: string;           // Benzersiz kütüphane ID'si (ULID formatında)
  name: string;          // Kütüphane adı
  description?: string;  // Açıklama (opsiyonel)
  address: string;       // Adres
  phone?: string;        // Telefon numarası (opsiyonel)
  email?: string;        // Email adresi (opsiyonel)
  books: string[];       // Kütüphanedeki kitapların ID'leri
  isActive: boolean;     // Kütüphanenin aktif olup olmadığı
  createdAt: Date;       // Oluşturulma tarihi
  updatedAt: Date;       // Güncellenme tarihi
}

/**
 * Kütüphane MongoDB Şeması
 * Veritabanında kütüphane verilerinin nasıl saklanacağını tanımlar
 */
const LibrarySchema: Schema = new Schema({
  // Benzersiz ID - ULID formatında otomatik oluşturulur
  _id: {
    type: String,
    default: () => ulid(),
  },
  
  // Kütüphane adı - zorunlu, maksimum 100 karakter
  name: {
    type: String,
    required: [true, 'Kütüphane adı zorunludur'],
    trim: true,
    maxlength: [100, 'Kütüphane adı 100 karakteri geçemez'],
  },
  
  // Açıklama - opsiyonel, maksimum 500 karakter
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Açıklama 500 karakteri geçemez'],
  },
  
  // Adres - zorunlu, maksimum 200 karakter
  address: {
    type: String,
    required: [true, 'Adres zorunludur'],
    trim: true,
    maxlength: [200, 'Adres 200 karakteri geçemez'],
  },
  
  // Telefon numarası - opsiyonel, geçerli telefon formatı
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Lütfen geçerli bir telefon numarası giriniz'],
  },
  
  // Email adresi - opsiyonel, geçerli email formatı
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Lütfen geçerli bir email adresi giriniz'],
  },
  
  // Kütüphanedeki kitapların ID'leri
  books: [{
    type: String,
    ref: 'Book', // Book modeline referans
  }],
  
  // Kütüphanenin aktif olup olmadığı (soft delete için)
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,  // createdAt ve updatedAt otomatik eklenir
  versionKey: false, // __v alanını kaldırır
});

// Performans için indeksler
LibrarySchema.index({ name: 1 });      // Ada göre arama
LibrarySchema.index({ isActive: 1 });  // Aktif kütüphanelere göre filtreleme

// Kütüphane modelini dışa aktar
export default mongoose.model<ILibrary>('Library', LibrarySchema);
