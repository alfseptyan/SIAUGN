This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Menjalankan lokal

Prasyarat: Node.js, npm, dan Docker Desktop (pastikan sudah berjalan).

1. Pasang dependensi:
   ```bash
   npm install
   ```
2. Salin konfigurasi lingkungan, lalu isi `AUTH_SECRET` (mis. `npx auth secret`) dan variabel `LLM_*` bila perlu:
   ```bash
   cp .env.example .env
   ```
3. Jalankan database PostgreSQL + pgvector (port 5432) dan tunggu sampai status `healthy`:
   ```bash
   npm run db:up
   docker compose ps
   ```
4. Terapkan migrasi (membuat tabel dan mengaktifkan ekstensi `vector`):
   ```bash
   npm run db:migrate
   ```
5. (Opsional) Isi data awal bila script seed sudah tersedia, atau buka Prisma Studio untuk melihat data:
   ```bash
   npm run db:seed
   npm run db:studio
   ```
6. Jalankan aplikasi di http://localhost:3000:
   ```bash
   npm run dev
   ```

Menghentikan database: `docker compose stop db`. Menghapus database beserta datanya: `docker compose down -v`.

## Seed data & akun uji

`npm run db:seed` mengisi database dari konstanta `INITIAL_*` di `src/lib/*-store.ts` dan akun di `src/lib/mock-data.ts`. Seed memakai `upsert` dengan ID tetap, sehingga aman dijalankan berulang (password akun di-reset ke nilai di bawah setiap kali seed dijalankan).

| Role | Nama | Email | Password |
|---|---|---|---|
| SUPER_ADMIN | Siti Rahayu | admin@siakad.ac.id | admin123 |
| DOSEN | Dr. Ahmad Fauzi, M.Kom. | dosen@siakad.ac.id | dosen123 |
| MAHASISWA | Budi Santoso | mahasiswa@siakad.ac.id | mhs123 |
| DIREKTORAT_KEMAHASISWAAN | Ir. Dewi Lestari, M.T. | kemahasiswaan@siakad.ac.id | kemahasiswaan123 |
| PENGELOLA_FASILITAS | Hendra Wijaya | fasilitas@siakad.ac.id | fasilitas123 |
| MITRA_BEASISWA | PT Beasiswa Nusantara | mitra@siakad.ac.id | mitra123 |

Akun mahasiswa uji (password `mhs123`):

| Kondisi | Nama | Email |
|---|---|---|
| Kehadiran di bawah ambang (hadir 2 dari 6 pertemuan = 33% di kelas k1, ambang 75%) | Dimas Kehadiran | uji.kehadiran@siakad.ac.id |
| Beasiswa DIPROSES, DITERIMA, dan DITOLAK oleh Direktorat (satu per program) | Citra Beasiswa | uji.beasiswa@siakad.ac.id |
| KRS DRAFT pada kelas penuh (k7, kuota 2, sudah terisi 2) | Eko Kuota | uji.kuota@siakad.ac.id |

Akun pendukung lain dari data store:

| Role | Email | Password |
|---|---|---|
| MAHASISWA (Annisa, Rizky, Siti, Fajar) | mhs-002@siakad.ac.id s/d mhs-005@siakad.ac.id | mhs123 |
| DOSEN (tiga dosen lain) | dos-002@siakad.ac.id s/d dos-004@siakad.ac.id | dosen123 |
| MITRA_BEASISWA (Yayasan Sains & Inovasi Bangsa) | info@sainsinovasi.or.id | mitra123 |

Mahasiswa uji hanya untuk pengembangan; jangan dipakai di lingkungan produksi.

## API v1 (mahasiswa, baca)

Semua endpoint memerlukan login sebagai MAHASISWA (cookie sesi, atau header `Authorization: Bearer <jwt>`) dan hanya mengembalikan data milik user tersebut. Respons sukses: `{ "data": ... }`; gagal: `{ "error": { "code", "message" } }`.

| Endpoint | Isi |
|---|---|
| `GET /api/v1/mahasiswa/krs` | KRS periode aktif, total SKS, katalog kelas |
| `GET /api/v1/mahasiswa/khs?semester=n` | KHS per semester, riwayat nilai, IPS/IPK, predikat |
| `GET /api/v1/mahasiswa/jadwal` | Jadwal kelas yang diambil |
| `GET /api/v1/mahasiswa/presensi?kelasId=` | Riwayat dan persentase kehadiran per kelas, sesi aktif |
| `GET /api/v1/mahasiswa/beasiswa` | Katalog program dan status pendaftaran (status final hanya setelah keputusan Direktorat) |
| `GET /api/v1/mahasiswa/pengajuan` | Fasilitas, jadwal terpakai, peminjaman dan proposal milik sendiri |

Aksi tulis (ambil KRS, scan presensi, daftar beasiswa, ajukan peminjaman/proposal) masih memakai store lokal; ditandai `TODO(tulis)` di halaman terkait.
