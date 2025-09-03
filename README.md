# Kütüphane Yönetim Sistemi

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Hamzabulduklu/kutuphane-yonetim-sistemi)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green?logo=mongodb)](https://www.mongodb.com/)
[![Zod](https://img.shields.io/badge/Zod-Validation-purple?logo=zod)](https://zod.dev/)

TypeScript, Express.js, MongoDB ve modern web teknolojileri ile geliştirilmiş kapsamlı kütüphane yönetim sistemi.

## 🚀 Hızlı Başlangıç

```bash
# Repository'yi klonlayın
git clone https://github.com/Hamzabulduklu/kutuphane-yonetim-sistemi.git
cd kutuphane-yonetim-sistemi

# Bağımlılıkları yükleyin
npm install

# Ortam değişkenlerini ayarlayın
cp .env.example .env

# Geliştirme sunucusunu başlatın
npm run dev
```

## 🚀 Özellikler

### Kullanıcı Yönetimi
- **Zod doğrulama** ile kullanıcı kaydı ve kimlik doğrulama
- JWT tabanlı yetkilendirme
- Kullanıcı profil yönetimi
- Kullanıcı CRUD işlemleri
- Soft delete işlevselliği

### Kütüphane Yönetimi
- Çoklu kütüphane desteği
- **Input doğrulama** ile kütüphane CRUD işlemleri
- Kütüphane istatistikleri ve analizleri
- Soft delete işlevselliği

### Kitap Yönetimi
- Kütüphanelerde kitap CRUD işlemleri
- **Doğrulanmış sorgular** ile kitap arama ve filtreleme
- Kitap kategorizasyonu
- **Regex kalıpları** ile ISBN doğrulama
- Kopya yönetimi (toplam ve mevcut)

### Ödünç Alma Sistemi
- Kitap ödünç alma ve iade etme
- Teslim tarihi yönetimi
- Ceza hesaplama
- Ödünç alma geçmişi takibi
- Kullanıcı başına maksimum kitap sınırı

### Değerlendirme Sistemi
- Kitap puanlama ve değerlendirme sistemi
- **Doğrulanmış değerlendirme girişleri** (1-5 puan, zorunlu yorumlar)
- Değerlendirme CRUD işlemleri
- Değerlendirmelere dayalı kitap istatistikleri

### Gelişmiş Özellikler
- **🔒 Zod Input Doğrulama**: Tüm API uç noktaları kapsamlı doğrulama ile korunmuş
- **ULID** benzersiz tanımlayıcılar için
- **MongoDB** ile Mongoose ODM
- **Kapsamlı hata işleme** standardize edilmiş yanıt formatı ile
- **Type-safe doğrulama** detaylı hata mesajları ile
- Sayfalama desteği
- Arama işlevselliği
- API dokümantasyonu hazır

## 🛠️ Teknoloji Yığını

- **Backend**: Node.js, Express.js, TypeScript
- **Veritabanı**: MongoDB ile Mongoose
- **Doğrulama**: Type-safe input doğrulama için **Zod**
- **Kimlik Doğrulama**: JWT (JSON Web Tokens)
- **Güvenlik**: Helmet, CORS, bcrypt
- **Test**: Mocha, Sinon.js, Chai
- **Kod Kalitesi**: ESLint, Prettier
- **ID Üretimi**: ULID

## 📋 Ön Koşullar

Bu uygulamayı çalıştırmadan önce aşağıdakilerin yüklü olduğundan emin olun:

- Node.js (v16 veya üzeri)
- MongoDB (v5.0 veya üzeri)
- npm veya yarn paket yöneticisi

## 🔧 Kurulum

1. **Repository'yi klonlayın**
   ```bash
   git clone https://github.com/Hamzabulduklu/kutuphane-yonetim-sistemi.git
   cd kutuphane-yonetim-sistemi
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Ortam Yapılandırması**
   
   `.env` dosyasını kopyalayın ve ortam değişkenlerinizi yapılandırın:
   ```bash
   cp .env.example .env
   ```

   `.env` dosyasında aşağıdaki değişkenleri güncelleyin:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/kutuphane_yonetim
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRES_IN=7d
   MAX_BOOKS_PER_USER=5
   ```

4. **MongoDB'yi Başlatın**
   
   MongoDB'nin sisteminizde çalıştığından emin olun:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

## 🚀 Kullanım

### Geliştirme Modu
```bash
npm run dev
```
Bu komut ts-node kullanarak hot-reload ile sunucuyu başlatır.

### Üretim Derlemesi
```bash
npm run build
npm start
```

### Testleri Çalıştırma
```bash
npm test
```

### Kod Formatlama ve Linting
```bash
npm run lint
npm run format
```

## 📚 API Uç Noktaları

### Kimlik Doğrulama
- `POST /api/users/register` - Yeni kullanıcı kaydı
- `POST /api/users/login` - Kullanıcı girişi

### Kullanıcı Yönetimi
- `GET /api/users/profile` - Mevcut kullanıcı profilini getir
- `GET /api/users` - Tüm kullanıcıları getir (sayfalanmış)
- `GET /api/users/:id` - ID'ye göre kullanıcı getir
- `PUT /api/users/:id` - Kullanıcıyı güncelle
- `DELETE /api/users/:id` - Kullanıcıyı sil (soft delete)

### Kütüphane Yönetimi
- `POST /api/libraries` - Yeni kütüphane oluştur
- `GET /api/libraries` - Tüm kütüphaneleri getir (sayfalanmış)
- `GET /api/libraries/:id` - ID'ye göre kütüphane getir
- `PUT /api/libraries/:id` - Kütüphaneyi güncelle
- `DELETE /api/libraries/:id` - Kütüphaneyi sil (soft delete)
- `GET /api/libraries/:id/stats` - Kütüphane istatistiklerini getir

### Kitap Yönetimi
- `POST /api/books` - Kütüphaneye yeni kitap ekle
- `GET /api/books` - Tüm kitapları getir (sayfalanmış, filtrelenebilir)
- `GET /api/books/search` - Kitap arama
- `GET /api/books/:id` - ID'ye göre kitap getir
- `PUT /api/books/:id` - Kitabı güncelle
- `DELETE /api/books/:id` - Kitabı sil (soft delete)
- `POST /api/books/borrow` - Kitap ödünç al
- `PUT /api/books/:id/return` - Kitabı iade et

### Sağlık Kontrolü
- `GET /health` - API sağlık durumu
- `GET /` - API bilgileri

## 🔐 Kimlik Doğrulama

API, kimlik doğrulama için JWT (JSON Web Tokens) kullanır. Giriş yaptıktan sonra, token'ı Authorization başlığına dahil edin:

```
Authorization: Bearer <your-jwt-token>
```

## ✅ Girdi Doğrulama

Bu sistem, tüm API uç noktalarında kapsamlı girdi doğrulama için **Zod** kullanır.

### Doğrulama Özellikleri
- **TypeScript entegrasyonu** ile tip güvenli doğrulama
- **Türkçe detaylı hata mesajları**
- **Alan düzeyinde doğrulama** özel kurallarla
- **Tutarlı hata formatı** tüm uç noktalarda

### Örnek Doğrulama Hata Yanıtı
```json
{
  "success": false,
  "message": "Doğrulama hatası",
  "errors": [
    {
      "field": "username",
      "message": "Kullanıcı adı en az 3 karakter olmalıdır",
      "code": "too_small"
    },
    {
      "field": "email",
      "message": "Geçerli bir email adresi giriniz",
      "code": "invalid_string"
    }
  ]
}
```

### Doğrulama Kuralları

#### Kullanıcı Kaydı
- **username**: 3-30 karakter, sadece alfanümerik + alt çizgi
- **email**: Geçerli email formatı
- **password**: 6-100 karakter
- **firstName/lastName**: 2-50 karakter
- **maxBooks**: 1-50 tamsayı (opsiyonel)

#### Kitap Oluşturma
- **title**: 1-200 karakter
- **author**: 1-100 karakter
- **isbn**: Geçerli ISBN formatı (opsiyonel)
- **publisher**: 1-100 karakter
- **publishedYear**: 1000 ile mevcut yıl arası
- **totalCopies**: 1-1000 tamsayı

#### İnceleme Oluşturma
- **rating**: 1-5 tamsayı
- **comment**: 1-1000 karakter
- **bookId**: Gerekli string

### Doğrulama Testleri
```bash
# Doğrulama testlerini çalıştır
npx ts-node src/tests/validation.test.ts
```

## 📖 Veritabanı Şeması

### Kullanıcı Modeli
- `_id`: ULID
- `username`: Benzersiz kullanıcı adı
- `email`: Benzersiz email adresi
- `password`: Hash'lenmiş şifre
- `firstName`: Kullanıcının adı
- `lastName`: Kullanıcının soyadı
- `maxBooks`: Kullanıcının ödünç alabileceği maksimum kitap sayısı
- `borrowedBooks`: Ödünç alınan kitap ID'leri dizisi
- `isActive`: Soft delete bayrağı

### Kütüphane Modeli
- `_id`: ULID
- `name`: Kütüphane adı
- `description`: Opsiyonel açıklama
- `address`: Kütüphane adresi
- `phone`: İletişim telefonu
- `email`: İletişim email'i
- `books`: Kitap ID'leri dizisi
- `isActive`: Soft delete bayrağı

### Kitap Modeli
- `_id`: ULID
- `title`: Kitap başlığı
- `author`: Kitap yazarı
- `isbn`: ISBN (opsiyonel, benzersiz)
- `publisher`: Yayınevi adı
- `publishedYear`: Yayın yılı
- `category`: Kitap kategorisi
- `description`: Kitap açıklaması
- `totalCopies`: Toplam kopya sayısı
- `availableCopies`: Mevcut kopya sayısı
- `libraryId`: Kütüphane referansı
- `borrowedBy`: Ödünç alan kullanıcı ID'leri dizisi
- `isActive`: Soft delete bayrağı

### Ödünç Alma Kaydı Modeli
- `_id`: ULID
- `userId`: Kullanıcı referansı
- `bookId`: Kitap referansı
- `libraryId`: Kütüphane referansı
- `borrowDate`: Ödünç alma tarihi
- `dueDate`: Teslim tarihi
- `returnDate`: Gerçek teslim tarihi
- `isReturned`: İade durumu
- `fine`: Ceza miktarı (varsa)
- `notes`: Ek notlar

## 🧪 Test

Proje, test için Sinon.js ile Mocha kullanır. Test dosyaları `src/tests` dizininde bulunur.

```bash
# Tüm testleri çalıştır
npm test

# Belirli test dosyasını çalıştır
npx mocha --require ts-node/register src/tests/UserController.test.ts
```

## 🔧 Geliştirme

### Proje Yapısı
```
src/
├── config/         # Yapılandırma dosyaları
├── controllers/    # Route controller'ları
├── middleware/     # Özel middleware'ler
├── models/         # MongoDB modelleri
├── routes/         # API route'ları
├── tests/          # Test dosyaları
└── index.ts        # Uygulama giriş noktası
```

### Kod Kalitesi
- ESLint kod linting için
- Prettier kod biçimlendirme için
- TypeScript tip güvenliği için
- Sıkı TypeScript yapılandırması

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **MongoDB Bağlantı Hatası**
   - MongoDB'nin çalıştığından emin olun
   - `.env` dosyasındaki bağlantı dizesini kontrol edin
   - Ağ bağlantısını doğrulayın

2. **JWT Token Sorunları**
   - Ortam değişkenlerindeki JWT_SECRET'ı kontrol edin
   - Authorization header'ındaki token formatını doğrulayın
   - Token sona erme süresini kontrol edin

3. **Port Zaten Kullanımda**
   - `.env` dosyasındaki PORT'u değiştirin
   - Portu kullanan işlemi sonlandırın: `lsof -ti:3000 | xargs kill -9`

## 📞 Destek

Destek ve sorular için lütfen repository'de bir issue oluşturun veya geliştirme ekibiyle iletişime geçin.

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için LICENSE dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Repository'yi fork edin
2. Özellik dalı oluşturun
3. Değişikliklerinizi commit edin
4. Dalı push edin
5. Pull Request oluşturun

## 🚀 Deployment

### Üretim Kontrol Listesi
- [ ] `NODE_ENV=production` ayarlayın
- [ ] Üretim MongoDB URI'sını yapılandırın
- [ ] Güçlü JWT secret'ı ayarlayın
- [ ] Üretim domainleri için CORS yapılandırın
- [ ] MongoDB kimlik doğrulamasını etkinleştirin
- [ ] İzleme ve loglama ayarlayın
- [ ] Reverse proxy yapılandırın (nginx)
- [ ] SSL sertifikaları ayarlayın
