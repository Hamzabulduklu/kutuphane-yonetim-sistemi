/**
 * Veritabanı Bağlantı Konfigürasyonu
 * MongoDB bağlantısını yönetir ve veritabanı işlemlerini organize eder
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Çevre değişkenlerini yükle
dotenv.config();

// MongoDB bağlantı URI'si - çevre değişkeninden al veya varsayılan değeri kullan
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kutuphane_yonetim';

/**
 * MongoDB veritabanına bağlantı kurar
 * @returns Promise<void> - Bağlantı başarılı olduğunda resolve edilir
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    // Mongoose ile MongoDB'ye bağlan ve database adını belirt
    const connection = await mongoose.connect(MONGODB_URI, {
      dbName: 'kutuphane_yonetim' // Hangi database'e bağlanacağımızı belirt
    });
    console.log(`✅ MongoDB bağlantısı başarılı: ${connection.connection.host}`);
    console.log(`📚 Database: ${connection.connection.name}`);
  } catch (error) {
    console.error('❌ Veritabanı bağlantı hatası:', error);
    process.exit(1); // Hata durumunda uygulamayı kapat
  }
};

/**
 * MongoDB veritabanı bağlantısını güvenli şekilde kapatır
 * @returns Promise<void> - Bağlantı kapatıldığında resolve edilir
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('❌ Veritabanı bağlantısını kapatma hatası:', error);
  }
};

// =====================================
// GÜVENLİ KAPATMA İŞLEMLERİ
// =====================================

/**
 * SIGINT sinyali yakalandığında (Ctrl+C) veritabanı bağlantısını kapat
 */
process.on('SIGINT', async () => {
  console.log('\n🔄 Uygulama kapatılıyor... Veritabanı bağlantısı temizleniyor');
  await disconnectDatabase();
  process.exit(0);
});

/**
 * SIGTERM sinyali yakalandığında (PM2, Docker vb.) veritabanı bağlantısını kapat
 */
process.on('SIGTERM', async () => {
  console.log('\n🔄 Uygulama sonlandırılıyor... Veritabanı bağlantısı temizleniyor');
  await disconnectDatabase();
  process.exit(0);
});
