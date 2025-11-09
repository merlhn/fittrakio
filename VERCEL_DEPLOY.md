# Vercel Deployment Guide

## Gerekli Değişiklikler Yapıldı ✅

1. ✅ Prisma schema PostgreSQL'e güncellendi
2. ✅ Build script'leri güncellendi
3. ✅ Postinstall script eklendi

## Vercel'de Yapılacaklar

### 1. Vercel Postgres Database Ekleme

1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. **Storage** sekmesine gidin
4. **Create Database** → **Postgres** seçin
5. Database'i oluşturun
6. `DATABASE_URL` otomatik olarak environment variable olarak eklenecek

### 2. Environment Variables Ekleme

Vercel Dashboard → **Settings** → **Environment Variables**:

| Variable | Value | Açıklama |
|----------|-------|----------|
| `DATABASE_URL` | (Otomatik) | Vercel Postgres eklendiğinde otomatik eklenir |
| `JWT_SECRET` | Rastgele string | Örnek: `your-super-secret-jwt-key-here` |

**JWT_SECRET oluşturma:**
```bash
openssl rand -base64 32
```

### 3. Migration Çalıştırma

İlk deployment'tan önce migration'ları çalıştırın:

**Seçenek 1: Vercel CLI ile (Önerilen)**
```bash
npx vercel env pull .env.local
npx prisma migrate deploy
```

**Seçenek 2: Vercel Dashboard'dan**
- Deployments → En son deployment → **Redeploy** yapın
- Build sırasında `prisma migrate deploy` otomatik çalışacak

### 4. İlk Kullanıcıları Oluşturma

Database hazır olduktan sonra, ilk kullanıcıları oluşturmak için:

1. Vercel'de **Functions** → **Terminal** açın
2. Veya local'de `.env.local` dosyası oluşturup:
```bash
DATABASE_URL="your-vercel-postgres-url"
JWT_SECRET="your-secret"
```

Sonra script çalıştırın:
```bash
npm run prisma:generate
npx tsx scripts/create-users.ts
```

## Deployment Sonrası Kontroller

1. ✅ Login sayfası açılıyor mu?
2. ✅ Register çalışıyor mu?
3. ✅ Database bağlantısı çalışıyor mu?

## Sorun Giderme

### "Error: P1001: Can't reach database server"
- `DATABASE_URL` environment variable'ının doğru olduğundan emin olun
- Vercel Postgres'in aktif olduğunu kontrol edin

### "Error: Migration failed"
- `prisma migrate deploy` komutunu manuel çalıştırın
- Migration dosyalarının doğru olduğundan emin olun

### "JWT Secret" hatası
- `JWT_SECRET` environment variable'ının eklendiğinden emin olun

## Notlar

- Local development için `.env.local` dosyası oluşturun
- Production'da `DATABASE_URL` Vercel tarafından otomatik sağlanır
- SQLite dosyası (`dev.db`) artık kullanılmıyor

