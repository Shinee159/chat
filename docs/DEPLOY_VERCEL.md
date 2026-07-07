# Deploy Vercel — Kreasi AI Chat V4

## 1. Buat PostgreSQL

Pakai Neon atau Supabase. Copy connection string PostgreSQL.

Format wajib:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
```

## 2. Isi Environment Variables di Vercel

Masuk ke:

```txt
Vercel > Project > Settings > Environment Variables
```

Tambahkan:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
SESSION_SECRET=buat_random_minimal_32_karakter
POLLINATIONS_BASE_URL=https://gen.pollinations.ai
POLLINATIONS_KEY=
POLLINATIONS_PUBLIC_KEY=
```

## 3. Push schema ke database

Di laptop, isi `.env` dengan DATABASE_URL yang sama, lalu jalankan:

```bash
npx prisma db push
```

## 4. Redeploy

Setelah database berisi tabel, redeploy project di Vercel.

## Error umum

### Unable to open the database file

Penyebab: masih pakai SQLite.

Fix: pakai V4 ini dan isi `DATABASE_URL` PostgreSQL.

### Could not find Prisma Schema

Penyebab: folder `prisma` tidak ikut ke GitHub atau root directory Vercel salah.

Fix: pastikan ada:

```txt
prisma/schema.prisma
```

### Table does not exist

Penyebab: belum menjalankan `npx prisma db push` ke PostgreSQL.

Fix:

```bash
npx prisma db push
```
