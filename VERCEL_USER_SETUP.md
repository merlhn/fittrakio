# Vercel Database'e Kullanıcı Ekleme

## Sorun
Vercel'deki database'de kullanıcılar yok, bu yüzden login çalışmıyor.

## Çözüm: Kullanıcıları Vercel Database'ine Ekleme

### Yöntem 1: Vercel Dashboard'dan DATABASE_URL Alıp Local'de Çalıştırma (Önerilen)

1. **Vercel Dashboard'a gidin:**
   - https://vercel.com/dashboard
   - Projenizi seçin (fittrakio)

2. **DATABASE_URL'i alın:**
   - **Storage** sekmesine gidin
   - Database'inizi seçin (fittrakio-prisma-postgres-...)
   - **Getting Started** sekmesine gidin
   - `.env.local` tab'ına tıklayın
   - `DATABASE_POSTGRES_URL` veya `DATABASE_PRISMA_DATABASE_URL` değerini kopyalayın
   - **"Show secret"** butonuna tıklayıp değeri görün

3. **Local'de .env.local dosyası oluşturun:**
   ```bash
   cd /Users/omerilhan/Desktop/Tracker
   ```

   `.env.local` dosyası oluşturup içine ekleyin:
   ```
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-jwt-secret-here"
   ```

4. **Kullanıcıları oluşturun:**
   ```bash
   npm run prisma:generate
   npx tsx scripts/create-vercel-users.ts
   ```

### Yöntem 2: Register Sayfasından Kayıt Olma

1. Vercel'deki uygulamanıza gidin
2. **Register** sayfasına gidin
3. Her kullanıcı için kayıt olun:
   - Ömer İlhan: `omerlhn@gmail.com` / `Omer2025!`
   - Egemen Başar: `i.egemenbasar@gmail.com` / `Egemen2025!`
   - Bayram Çakır: `bayramcakir1992@gmail.com` / `Bayram2025!`

### Yöntem 3: Vercel CLI ile (Login gerekli)

1. **Vercel CLI'ye login olun:**
   ```bash
   npx vercel login
   ```

2. **Environment variables'ı çekin:**
   ```bash
   npx vercel env pull .env.local
   ```

3. **Kullanıcıları oluşturun:**
   ```bash
   npm run prisma:generate
   npx tsx scripts/create-vercel-users.ts
   ```

## Oluşturulacak Kullanıcılar

1. **Ömer İlhan**
   - Email: `omerlhn@gmail.com`
   - Password: `Omer2025!`

2. **Egemen Başar**
   - Email: `i.egemenbasar@gmail.com`
   - Password: `Egemen2025!`

3. **Bayram Çakır**
   - Email: `bayramcakir1992@gmail.com`
   - Password: `Bayram2025!`

## Kontrol

Kullanıcılar oluşturulduktan sonra Vercel'deki login sayfasından giriş yapabilirsiniz.

