# Kreasi AI Chat — V4 Vercel PostgreSQL

Website chat dan generator AI dengan struktur fitur: **Chat & Kreasi**, **Koleksi Saya**, **Daftar & Masuk**, dan **Pengaturan Akun**.

Versi ini sudah diperbaiki untuk **deploy di Vercel** dengan **PostgreSQL**, bukan SQLite. Error seperti berikut sudah ditangani dari sisi struktur project:

```txt
Error code 14: Unable to open the database file
```

Penyebab error itu adalah penggunaan SQLite `file:./dev.db` di Vercel. Vercel tidak cocok untuk database file lokal yang perlu dibaca-tulis terus-menerus. Karena itu schema Prisma sekarang memakai:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL untuk production/deploy
- Cookie httpOnly + JWT + tabel `AuthSession`
- Pollinations adapter untuk multimodal AI

## Fitur utama

- Register dan login akun
- Session login per user/account
- Dashboard statistik
- Chat AI
- Generate gambar, video, audio/TTS, musik
- Session chat/generate per akun
- Koleksi hasil generate per akun
- Favorite, rename, delete, download hasil
- Update profil
- Export data workspace ke JSON
- Rate limit sederhana per user
- API key tetap di backend
- Tema modern simple indigo-violet

## Struktur penting

```txt
package.json
prisma/schema.prisma
src/app
src/components
src/lib
```

Pastikan folder `prisma` dan `src` ikut ter-upload ke GitHub.

## Environment Variables

Buat file `.env` untuk lokal, atau isi di Vercel lewat:

```txt
Vercel > Project > Settings > Environment Variables
```

Isi minimal:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
SESSION_SECRET="ganti_dengan_secret_minimal_32_karakter"
POLLINATIONS_BASE_URL="https://gen.pollinations.ai"
POLLINATIONS_KEY=""
POLLINATIONS_PUBLIC_KEY=""
```

`DATABASE_URL` harus PostgreSQL online, misalnya dari Neon atau Supabase. Jangan pakai:

```env
DATABASE_URL="file:./dev.db"
```

untuk Vercel.

## Cara paling cepat pakai Neon PostgreSQL

1. Buka `https://neon.tech`.
2. Login pakai GitHub.
3. Buat **New Project**.
4. Copy connection string PostgreSQL.
5. Tempel ke `.env` lokal dan Environment Variables Vercel.

Contoh format:

```env
DATABASE_URL="postgresql://neondb_owner:password@ep-xxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

## Instalasi lokal

```bash
npm install
cp .env.example .env
```

Edit `.env`, isi `DATABASE_URL` PostgreSQL asli. Setelah itu:

```bash
npx prisma db push
npm run dev
```

Buka:

```txt
http://localhost:3000
```

## Deploy ke Vercel

1. Upload project lengkap ke GitHub.
2. Pastikan GitHub berisi:

```txt
src/
prisma/
prisma/schema.prisma
package.json
```

3. Di Vercel, import repo.
4. Isi Environment Variables:

```env
DATABASE_URL="postgresql://..."
SESSION_SECRET="minimal_32_karakter"
POLLINATIONS_BASE_URL="https://gen.pollinations.ai"
POLLINATIONS_KEY=""
POLLINATIONS_PUBLIC_KEY=""
```

5. Deploy.

## Perintah penting

```bash
npm install
npx prisma db push
npx prisma generate
npm run dev
npm run build
```

## Upload ulang ke GitHub

```bash
git add .
git commit -m "fix database for vercel postgres"
git push
```

Kalau repo sebelumnya berantakan atau file `src`/`prisma` tidak ikut, dari folder project lengkap jalankan:

```bash
git init
git remote remove origin
git remote add origin https://github.com/Shinee159/chat.git
git branch -M main
git add .
git commit -m "upload fixed vercel postgres project"
git push -u origin main --force
```

## Catatan

- `.env` tidak boleh di-upload ke GitHub.
- Untuk Vercel, SQLite sudah diganti menjadi PostgreSQL.
- Jalankan `npx prisma db push` minimal sekali setelah `DATABASE_URL` PostgreSQL diisi.
- Jika tabel belum ada di production, login/register akan error sampai schema berhasil dipush ke database.
