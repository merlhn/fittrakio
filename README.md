# Fitness Tracker

Günlük fitness takip sistemi - "Winning is not comfortable!"

## Özellikler

- ✅ Kullanıcı kayıt ve giriş sistemi
- ✅ Günlük antrenman işaretleme (checkbox)
- ✅ Haftalık minimum 3 antrenman kontrolü
- ✅ Otomatik liability hesaplama (eksik gün başına 15€)
- ✅ Aylık ödül sistemi (birinci +40€, diğerleri -20€)
- ✅ Aktivite akışı (timeline)
- ✅ Leader board
- ✅ Finansal takip

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Veritabanını oluşturun:
```bash
npm run prisma:migrate
```

3. Development server'ı başlatın:
```bash
npm run dev
```

4. Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

## Kullanım

1. İlk kullanıcıyı kaydedin (register)
2. Giriş yapın (login)
3. Dashboard'da antrenmanlarınızı işaretleyin
4. Haftalık minimum 3 antrenman yapmayı unutmayın!

## Program Bilgileri

- **Başlangıç Tarihi:** 27.10.2025
- **Bitiş Tarihi:** 01.09.2026
- **Haftalık Minimum:** 3 antrenman
- **Eksik Gün Cezası:** 15€
- **Ay Birincisi Ödülü:** +40€
- **Diğer Katılımcılar:** -20€

## Teknolojiler

- Next.js 16
- TypeScript
- Tailwind CSS
- Prisma (SQLite)
- JWT Authentication
- bcryptjs

## Veritabanı

SQLite veritabanı `prisma/dev.db` dosyasında saklanır.

Prisma Studio ile veritabanını görüntülemek için:
```bash
npm run prisma:studio
```

