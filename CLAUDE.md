@AGENTS.md

## Arsitektur (keputusan final, jangan diubah tanpa diminta)
- Modular monolith di dalam Next.js. Backend = Route Handler di src/app/api/v1/** yang tipis, logika di src/server/modules/<modul>/.
- Modul: akademik, presensi, beasiswa, layanan, asisten. Hal lintas modul di src/server/shared/ (db, auth, rbac, errors, audit, notifikasi).
- Setiap modul hanya mengekspor fungsi publik lewat src/server/modules/<modul>/index.ts. Modul lain DILARANG mengimpor file internal atau mengakses tabel Prisma milik modul lain secara langsung.
- Jangan pakai Server Actions untuk data. Semua baca/tulis data lewat service modul; komponen klien memanggil /api/v1, server component boleh memanggil service langsung.
- Identitas user selalu dari session/token di server lewat getAuthUser(); jangan pernah dari body request atau parameter URL.
- Validasi input dengan zod di Route Handler.
- Fungsi aturan bisnis yang sudah ada (src/lib/academic-utils.ts, src/lib/presensi-utils.ts) dipakai ulang, bukan ditulis ulang.
- Semua konfigurasi lewat .env (lihat .env.example). Jangan menulis URL atau rahasia di kode.
- Aplikasi mobile (Expo) akan menyusul dan memakai /api/v1 yang sama, jadi respons API harus JSON bersih dan stabil.
- Bahasa UI dan pesan error: Bahasa Indonesia.

## Kebiasaan kerja
- Sebelum menulis kode Next.js, baca panduan yang relevan di node_modules/next/dist/docs/.
- Setiap selesai tugas: jalankan npm run lint dan npm run build, perbaiki sampai bersih.
- Perubahan kecil dan bertahap. Jangan refactor halaman yang tidak disebut di tugas.
