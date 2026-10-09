-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'DOSEN', 'MAHASISWA', 'DIREKTORAT_KEMAHASISWAAN', 'PENGELOLA_FASILITAS', 'MITRA_BEASISWA');

-- CreateEnum
CREATE TYPE "StatusMahasiswa" AS ENUM ('AKTIF', 'CUTI', 'DO', 'LULUS');

-- CreateEnum
CREATE TYPE "StatusKRS" AS ENUM ('DRAFT', 'DISETUJUI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "StatusPresensi" AS ENUM ('HADIR', 'IZIN', 'SAKIT', 'ALFA');

-- CreateEnum
CREATE TYPE "MetodePresensi" AS ENUM ('QR', 'MANUAL');

-- CreateEnum
CREATE TYPE "StatusProgramBeasiswa" AS ENUM ('DRAF', 'MENUNGGU_REVIEW', 'PUBLISH', 'DITOLAK', 'DITUTUP');

-- CreateEnum
CREATE TYPE "StatusMitra" AS ENUM ('MENUNGGU', 'DIREKOMENDASIKAN', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusFinal" AS ENUM ('DIPROSES', 'DITERIMA', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusPeminjaman" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusProposal" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "HariEnum" AS ENUM ('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "angkatan" INTEGER NOT NULL,
    "status" "StatusMahasiswa" NOT NULL DEFAULT 'AKTIF',
    "programStudi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dosen" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nidn" TEXT NOT NULL,
    "homebase" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_kuliah" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "deskripsi" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mata_kuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruangan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL,
    "lokasi" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ruangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periode_akademik" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "tanggalMulaiKRS" TIMESTAMP(3) NOT NULL,
    "tanggalTutupKRS" TIMESTAMP(3) NOT NULL,
    "tanggalMulai" TIMESTAMP(3) NOT NULL,
    "tanggalSelesai" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periode_akademik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" TEXT NOT NULL,
    "mataKuliahId" TEXT NOT NULL,
    "dosenId" TEXT NOT NULL,
    "ruanganId" TEXT NOT NULL,
    "periodeId" TEXT NOT NULL,
    "namaKelas" TEXT NOT NULL,
    "hari" "HariEnum" NOT NULL,
    "jamMulai" TEXT NOT NULL,
    "jamSelesai" TEXT NOT NULL,
    "kuota" INTEGER NOT NULL,
    "ambangKehadiranPersen" INTEGER NOT NULL DEFAULT 75,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "krs" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "status" "StatusKRS" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "krs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "komponen_nilai" (
    "id" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "bobotPersen" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "komponen_nilai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skala_nilai" (
    "id" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "huruf" TEXT NOT NULL,
    "skorMin" DOUBLE PRECISION NOT NULL,
    "skorMax" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "skala_nilai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai_komponen" (
    "id" TEXT NOT NULL,
    "krsId" TEXT NOT NULL,
    "komponenId" TEXT NOT NULL,
    "skor" DOUBLE PRECISION,

    CONSTRAINT "nilai_komponen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai" (
    "id" TEXT NOT NULL,
    "krsId" TEXT NOT NULL,
    "nilaiAkhirOtomatis" DOUBLE PRECISION,
    "nilaiAkhirFinal" DOUBLE PRECISION,
    "huruf" TEXT,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nilai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesi_presensi" (
    "id" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "pertemuanKe" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "tokenQr" TEXT NOT NULL,
    "waktuMulai" TIMESTAMP(3) NOT NULL,
    "waktuKadaluarsa" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesi_presensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presensi" (
    "id" TEXT NOT NULL,
    "sesiId" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "waktuScan" TIMESTAMP(3),
    "status" "StatusPresensi" NOT NULL DEFAULT 'ALFA',
    "metode" "MetodePresensi" NOT NULL DEFAULT 'MANUAL',
    "dibatalkanOleh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_presensi" (
    "id" TEXT NOT NULL,
    "presensiId" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "statusLama" TEXT,
    "statusBaru" TEXT,
    "alasan" TEXT,
    "dilakukanOleh" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_presensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mitra" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "namaOrganisasi" TEXT NOT NULL,
    "kontak" TEXT,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mitra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_beasiswa" (
    "id" TEXT NOT NULL,
    "mitraId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kriteria" TEXT,
    "kuota" INTEGER NOT NULL,
    "periodeMulai" TIMESTAMP(3),
    "periodeSelesai" TIMESTAMP(3),
    "status" "StatusProgramBeasiswa" NOT NULL DEFAULT 'DRAF',
    "catatanReview" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_beasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendaftaran_beasiswa" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "statusMitra" "StatusMitra" NOT NULL DEFAULT 'MENUNGGU',
    "statusFinal" "StatusFinal" NOT NULL DEFAULT 'DIPROSES',
    "catatanMitra" TEXT,
    "catatanFinal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pendaftaran_beasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumen_pendukung" (
    "id" TEXT NOT NULL,
    "pendaftaranId" TEXT NOT NULL,
    "namaFile" TEXT NOT NULL,
    "tipeFile" TEXT NOT NULL,
    "ukuranBytes" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dokumen_pendukung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fasilitas" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kapasitas" INTEGER,
    "lokasi" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fasilitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peminjaman_fasilitas" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "fasilitasId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jamMulai" TEXT NOT NULL,
    "jamSelesai" TEXT NOT NULL,
    "keperluan" TEXT,
    "status" "StatusPeminjaman" NOT NULL DEFAULT 'MENUNGGU',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peminjaman_fasilitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_kegiatan" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "namaAcara" TEXT NOT NULL,
    "deskripsi" TEXT,
    "filePdf" TEXT,
    "status" "StatusProposal" NOT NULL DEFAULT 'MENUNGGU',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "entitas" TEXT NOT NULL,
    "entitasId" TEXT NOT NULL,
    "detail" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_userId_key" ON "mahasiswa"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_userId_key" ON "dosen"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_nidn_key" ON "dosen"("nidn");

-- CreateIndex
CREATE UNIQUE INDEX "mata_kuliah_kode_key" ON "mata_kuliah"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "ruangan_nama_key" ON "ruangan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "krs_mahasiswaId_kelasId_key" ON "krs"("mahasiswaId", "kelasId");

-- CreateIndex
CREATE UNIQUE INDEX "nilai_komponen_krsId_komponenId_key" ON "nilai_komponen"("krsId", "komponenId");

-- CreateIndex
CREATE UNIQUE INDEX "nilai_krsId_key" ON "nilai"("krsId");

-- CreateIndex
CREATE UNIQUE INDEX "sesi_presensi_tokenQr_key" ON "sesi_presensi"("tokenQr");

-- CreateIndex
CREATE UNIQUE INDEX "presensi_sesiId_mahasiswaId_key" ON "presensi"("sesiId", "mahasiswaId");

-- CreateIndex
CREATE UNIQUE INDEX "mitra_userId_key" ON "mitra"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_beasiswa_mahasiswaId_programId_key" ON "pendaftaran_beasiswa"("mahasiswaId", "programId");

-- CreateIndex
CREATE INDEX "notifikasi_userId_isRead_idx" ON "notifikasi"("userId", "isRead");

-- CreateIndex
CREATE INDEX "audit_log_userId_idx" ON "audit_log"("userId");

-- CreateIndex
CREATE INDEX "audit_log_entitas_entitasId_idx" ON "audit_log"("entitas", "entitasId");

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dosen" ADD CONSTRAINT "dosen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_mataKuliahId_fkey" FOREIGN KEY ("mataKuliahId") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_ruanganId_fkey" FOREIGN KEY ("ruanganId") REFERENCES "ruangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_periodeId_fkey" FOREIGN KEY ("periodeId") REFERENCES "periode_akademik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "krs" ADD CONSTRAINT "krs_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "krs" ADD CONSTRAINT "krs_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komponen_nilai" ADD CONSTRAINT "komponen_nilai_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skala_nilai" ADD CONSTRAINT "skala_nilai_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_komponen" ADD CONSTRAINT "nilai_komponen_krsId_fkey" FOREIGN KEY ("krsId") REFERENCES "krs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai_komponen" ADD CONSTRAINT "nilai_komponen_komponenId_fkey" FOREIGN KEY ("komponenId") REFERENCES "komponen_nilai"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_krsId_fkey" FOREIGN KEY ("krsId") REFERENCES "krs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesi_presensi" ADD CONSTRAINT "sesi_presensi_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presensi" ADD CONSTRAINT "presensi_sesiId_fkey" FOREIGN KEY ("sesiId") REFERENCES "sesi_presensi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presensi" ADD CONSTRAINT "presensi_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_presensi" ADD CONSTRAINT "log_presensi_presensiId_fkey" FOREIGN KEY ("presensiId") REFERENCES "presensi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mitra" ADD CONSTRAINT "mitra_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_beasiswa" ADD CONSTRAINT "program_beasiswa_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "mitra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_beasiswa" ADD CONSTRAINT "pendaftaran_beasiswa_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_beasiswa" ADD CONSTRAINT "pendaftaran_beasiswa_programId_fkey" FOREIGN KEY ("programId") REFERENCES "program_beasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_pendukung" ADD CONSTRAINT "dokumen_pendukung_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "pendaftaran_beasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peminjaman_fasilitas" ADD CONSTRAINT "peminjaman_fasilitas_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peminjaman_fasilitas" ADD CONSTRAINT "peminjaman_fasilitas_fasilitasId_fkey" FOREIGN KEY ("fasilitasId") REFERENCES "fasilitas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_kegiatan" ADD CONSTRAINT "proposal_kegiatan_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
