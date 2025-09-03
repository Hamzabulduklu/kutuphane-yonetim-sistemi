import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";

// Route imports
import userRoutes from "./routes/userRoutes";
import libraryRoutes from "./routes/libraryRoutes";
import bookRoutes from "./routes/bookRoutes";
import fineRoutes from "./routes/fineRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import birds from "./routes/birds";

// Çevre değişkenlerini yükle
dotenv.config();

/**
 * Kütüphane Yönetim Sistemi Ana Sunucu Dosyası
 * MongoDB Atlas ile çalışacak şekilde düzenlenmiş Express.js API sunucusu
 */

console.log("🔧 Kütüphane Yönetim Sistemi başlatılıyor...");
console.log("🌍 Ortam:", process.env.NODE_ENV || "development");

// Express uygulamasını oluştur
const app = express();
const PORT = process.env.PORT || 3000;

// =====================================
// GÜVENLİK VE MIDDLEWARE AYARLARI
// =====================================

// Güvenlik başlıkları ekle
app.use(helmet());

// CORS (Cross-Origin Resource Sharing) ayarları
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGINS?.split(",")
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// JSON ve URL encoded verilerini parse et (maksimum 10MB)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =====================================
// ROUTE LOADER - Async Route Loading
// =====================================

    app.use("/api/users", userRoutes);
    app.use("/api/libraries", libraryRoutes);
    app.use("/api/books", bookRoutes);
    app.use("/api/fines", fineRoutes);
    app.use("/api/reviews", reviewRoutes);



// =====================================
// GENEL ENDPOINT'LER
// =====================================

/**
 * Sistem sağlık kontrolü endpoint'i
 * Sunucunun çalışıp çalışmadığını kontrol etmek için kullanılır
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Kütüphane Yönetim Sistemi API çalışıyor",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: "MongoDB Atlas Connected",
  });
});

/**
 * Ana sayfa endpoint'i
 * API hakkında temel bilgileri gösterir
 */
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Kütüphane Yönetim Sistemi API'sine Hoş Geldiniz",
    version: "1.0.0",
    database: "MongoDB Atlas",
    features: [
      "Kullanıcı yönetimi",
      "Kütüphane yönetimi",
      "Kitap yönetimi",
      "Ödünç alma sistemi",
      "Ceza ve ödeme sistemi",
      "Kitap değerlendirme sistemi",
      "ULID kimlik sistemi",
    ],
    endpoints: {
      health: "/health",
      users: "/api/users",
      libraries: "/api/libraries",
      books: "/api/books",
      fines: "/api/fines",
      reviews: "/api/reviews",
    },
  });
});

// =====================================
// HATA YÖNETİMİ
// =====================================

/**
 * 404 - Sayfa bulunamadı hatası
 * Tanımlanmamış route'lar için
 */
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Endpoint bulunamadı",
    path: req.originalUrl,
    suggestion: "Lütfen doğru API endpoint'ini kullandığınızdan emin olun",
  });
});

/**
 * Genel hata yakalayıcı
 * Tüm yakalanmamış hataları işler
 */
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Genel hata yakalayıcı:", error);

    res.status(error.status || 500).json({
      message: error.message || "Sunucu hatası",
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
);

// =====================================
// SUNUCU BAŞLATMA
// =====================================

/**
 * Sunucuyu başlat
 * MongoDB Atlas'a bağlan, route'ları yükle ve HTTP sunucusunu başlat
 */

const startServer = async () => {
  try {

    console.log("📊 MongoDB Atlas bağlantısı kuruluyor...");
    // MongoDB Atlas veritabanına bağlan
    await connectDatabase();
    console.log("✅ MongoDB Atlas bağlantısı başarılı!");

    // Routes'ları yükle

    // HTTP sunucusunu başlat
    app.listen(PORT, () => {
      console.log("🎉 Sunucu başarıyla başlatıldı!");
      console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
      console.log(`📚 Kütüphane Yönetim Sistemi API - MongoDB Atlas`);
      console.log(`🌍 Ortam: ${process.env.NODE_ENV || "development"}`);
      console.log(`💻 Sağlık kontrolü: http://localhost:${PORT}/health`);
      console.log(`⭐ Ana sayfa: http://localhost:${PORT}/`);
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Sunucu başlatma hatası:", error);
    process.exit(1); // Hata durumunda uygulamayı kapat
  }
};

// Sunucuyu başlat
startServer();

// Express uygulamasını dışa aktar (test amaçlı)
export default app;
