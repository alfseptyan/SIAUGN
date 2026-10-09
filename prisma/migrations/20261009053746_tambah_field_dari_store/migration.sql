-- CreateEnum
CREATE TYPE "KategoriDokumen" AS ENUM ('KTM', 'TRANSKRIP', 'REKOMENDASI', 'LAINNYA');

-- CreateEnum
CREATE TYPE "TipeFasilitas" AS ENUM ('RUANGAN', 'LABORATORIUM', 'ALAT', 'AULA');

-- AlterTable
ALTER TABLE "dokumen_pendukung" ADD COLUMN     "kategori" "KategoriDokumen" NOT NULL DEFAULT 'LAINNYA';

-- AlterTable
ALTER TABLE "fasilitas" ADD COLUMN     "tipe" "TipeFasilitas" NOT NULL DEFAULT 'RUANGAN';

-- AlterTable
ALTER TABLE "mahasiswa" ADD COLUMN     "semesterSekarang" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "mata_kuliah" ADD COLUMN     "semesterPaket" INTEGER;

-- AlterTable
ALTER TABLE "mitra" ADD COLUMN     "deskripsi" TEXT;

-- AlterTable
ALTER TABLE "peminjaman_fasilitas" ADD COLUMN     "organisasi" TEXT;

-- AlterTable
ALTER TABLE "pendaftaran_beasiswa" ADD COLUMN     "ipk" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "motivationLetter" TEXT,
ADD COLUMN     "semester" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "periode_akademik" ADD COLUMN     "isKrsOpen" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "presensi" ADD COLUMN     "alasanBatal" TEXT;

-- AlterTable
ALTER TABLE "program_beasiswa" ADD COLUMN     "maksimalSemester" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN     "minimalIpk" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "minimalSemester" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "nominalPerSemester" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "proposal_kegiatan" ADD COLUMN     "estimasiBiaya" INTEGER,
ADD COLUMN     "estimasiPeserta" INTEGER,
ADD COLUMN     "filePdfNama" TEXT,
ADD COLUMN     "filePdfUkuran" INTEGER,
ADD COLUMN     "organisasi" TEXT,
ADD COLUMN     "tanggalMulai" TIMESTAMP(3),
ADD COLUMN     "tanggalSelesai" TIMESTAMP(3),
ADD COLUMN     "tempat" TEXT;

-- AlterTable
ALTER TABLE "sesi_presensi" ADD COLUMN     "judulMateri" TEXT,
ADD COLUMN     "refreshIntervalSeconds" INTEGER NOT NULL DEFAULT 45;

-- CreateTable
CREATE TABLE "riwayat_nilai" (
    "id" TEXT NOT NULL,
    "mahasiswaId" TEXT NOT NULL,
    "kodeMk" TEXT NOT NULL,
    "namaMk" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "semesterAmbil" INTEGER NOT NULL,
    "periodeNama" TEXT NOT NULL,
    "nilaiHuruf" TEXT NOT NULL,
    "bobotIndeks" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_nilai_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "riwayat_nilai_mahasiswaId_kodeMk_key" ON "riwayat_nilai"("mahasiswaId", "kodeMk");

-- AddForeignKey
ALTER TABLE "riwayat_nilai" ADD CONSTRAINT "riwayat_nilai_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "mahasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
