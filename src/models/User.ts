import mongoose, { Schema, Document } from 'mongoose';
const { ulid } = require('ulid');

/**
 * Kullanıcı Veri Modeli Arayüzü
 * Kullanıcının sahip olacağı tüm özellikleri tanımlar
 */
export interface IUser extends Document {
  _id: string;           // Benzersiz kullanıcı ID'si (ULID formatında)
  username: string;      // Kullanıcı adı
  email: string;         // Email adresi
  password: string;      // Şifre (hashlenmiş)
  firstName: string;     // Ad
  lastName: string;      // Soyad
  maxBooks: number;      // Maksimum ödünç alabileceği kitap sayısı
  borrowedBooks: string[]; // Ödünç aldığı kitapların ID'leri
  isActive: boolean;     // Kullanıcının aktif olup olmadığı
  createdAt: Date;       // Oluşturulma tarihi
  updatedAt: Date;       // Güncellenme tarihi
}

/**
 * Kullanıcı MongoDB Şeması
 * Veritabanında kullanıcı verilerinin nasıl saklanacağını tanımlar
 */
const UserSchema: Schema = new Schema({
  // Benzersiz ID - ULID formatında otomatik oluşturulur
  _id: {
    type: String,
    default: () => ulid(),
  },
  
  // Kullanıcı adı - zorunlu, benzersiz, 3-30 karakter arası
  username: {
    type: String,
    required: [true, 'Kullanıcı adı zorunludur'],
    unique: true,
    trim: true,
    minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır'],
    maxlength: [30, 'Kullanıcı adı 30 karakteri geçemez'],
  },
  
  // Email adresi - zorunlu, benzersiz, geçerli email formatı
  email: {
    type: String,
    required: [true, 'Email adresi zorunludur'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Lütfen geçerli bir email adresi giriniz'],
  },
  
  // Şifre - zorunlu, en az 6 karakter
  password: {
    type: String,
    required: [true, 'Şifre zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
  },
  
  // Ad - zorunlu, maksimum 50 karakter
  firstName: {
    type: String,
    required: [true, 'Ad zorunludur'],
    trim: true,
    maxlength: [50, 'Ad 50 karakteri geçemez'],
  },
  
  // Soyad - zorunlu, maksimum 50 karakter
  lastName: {
    type: String,
    required: [true, 'Soyad zorunludur'],
    trim: true,
    maxlength: [50, 'Soyad 50 karakteri geçemez'],
  },
  
  // Maksimum kitap sayısı - varsayılan 5, 1-20 arası
  maxBooks: {
    type: Number,
    default: 5,
    min: [1, 'Kullanıcı en az 1 kitap ödünç alabilmelidir'],
    max: [20, 'Kullanıcı en fazla 20 kitap ödünç alabilir'],
  },
  
  // Ödünç alınan kitapların ID'leri
  borrowedBooks: [{
    type: String,
    ref: 'Book', // Book modeline referans
  }],
  
  // Kullanıcının aktif olup olmadığı (soft delete için)
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,  // createdAt ve updatedAt otomatik eklenir
  versionKey: false, // __v alanını kaldırır
});

// Performans için indeksler
// Not: username ve email için unique: true zaten indeks oluşturur, tekrar tanımlamaya gerek yok
UserSchema.index({ isActive: 1 }); // Sadece aktif kullanıcılar için ek indeks

// Kullanıcı modelini dışa aktar
export default mongoose.model<IUser>('User', UserSchema);
