/**
 * Seed database dari data contoh di src/lib/*-store.ts dan src/lib/mock-data.ts.
 * Idempoten: semua tulis memakai upsert dengan ID tetap, aman dijalankan berulang.
 * Jalankan: npm run db:seed
 */

import { PrismaClient, type Role } from "@prisma/client"
import bcrypt from "bcryptjs"

import { MOCK_USERS } from "../src/lib/mock-data"
import {
  INITIAL_MATA_KULIAH,
  INITIAL_RUANGAN,
  INITIAL_PERIODE,
  INITIAL_DOSEN,
  INITIAL_MAHASISWA,
  INITIAL_KELAS,
  INITIAL_KRS,
  DEFAULT_KOMPONEN_NILAI,
  DEFAULT_SKALA_NILAI,
  INITIAL_NILAI,
  PAST_GRADES_MHS1,
  type MahasiswaItem,
  type KelasItem,
  type KrsItem,
  type PastGradeItem,
} from "../src/lib/academic-store"
import {
  INITIAL_SESI_PRESENSI,
  INITIAL_PRESENSI,
  INITIAL_LOGS_PRESENSI,
  type PresensiItem,
} from "../src/lib/presensi-store"
import {
  INITIAL_MITRA,
  INITIAL_PROGRAM,
  INITIAL_PENDAFTARAN,
  type PendaftaranBeasiswaItem,
} from "../src/lib/beasiswa-store"
import {
  INITIAL_FASILITAS,
  INITIAL_PEMINJAMAN,
  INITIAL_PROPOSAL,
} from "../src/lib/layanan-store"
import {
  calculateGpaFromGrades,
  letterGradeToIndeks,
} from "../src/lib/academic-utils"

const prisma = new PrismaClient()

const d = (value: string) => new Date(value)

// ============================================
// Data tambahan khusus seed (akun uji)
// ============================================

const PASSWORD_MAHASISWA = "mhs123"
const PASSWORD_DOSEN = "dosen123"
const PASSWORD_MITRA = "mitra123"

interface SeedUser {
  id: string
  email: string
  password: string
  nama: string
  role: Role
}

/** Mahasiswa uji tambahan, masing-masing mewakili satu kondisi. */
const MAHASISWA_UJI: Array<MahasiswaItem & { email: string }> = [
  // (a) Kehadiran di bawah ambang di kelas k1
  { id: "mhs-6", userId: "usr-mhs-006", email: "uji.kehadiran@siakad.ac.id", nim: "220101006", nama: "Dimas Kehadiran", angkatan: 2022, programStudi: "Teknik Informatika", semesterSekarang: 5, status: "AKTIF" },
  // (b) Beasiswa berstatus DIPROSES, DITERIMA, dan DITOLAK
  { id: "mhs-7", userId: "usr-mhs-007", email: "uji.beasiswa@siakad.ac.id", nim: "220101007", nama: "Citra Beasiswa", angkatan: 2022, programStudi: "Teknik Informatika", semesterSekarang: 5, status: "AKTIF" },
  // (c) KRS DRAFT pada kelas yang kuotanya penuh (k7)
  { id: "mhs-8", userId: "usr-mhs-008", email: "uji.kuota@siakad.ac.id", nim: "220101008", nama: "Eko Kuota", angkatan: 2022, programStudi: "Teknik Informatika", semesterSekarang: 5, status: "AKTIF" },
]

/** Kelas dengan kuota 2 yang sudah terisi 2 KRS disetujui (mhs-2 dan mhs-3). */
const KELAS_PENUH: KelasItem = {
  id: "k7",
  mataKuliahId: "mk-9",
  dosenId: "dos-2",
  ruanganId: "ruang-1",
  periodeId: "per-2025-1",
  namaKelas: "A",
  hari: "SELASA",
  jamMulai: "13:00",
  jamSelesai: "15:00",
  kuota: 2,
  ambangKehadiranPersen: 75,
}

const KRS_UJI: KrsItem[] = [
  // (a) Dimas mengikuti k1
  { id: "krs-uji-1", mahasiswaId: "mhs-6", kelasId: "k1", periodeId: "per-2025-1", status: "DISETUJUI", tanggalDaftar: "2025-08-22" },
  // (c) k7 penuh oleh mhs-2 dan mhs-3; Eko masih DRAFT
  { id: "krs-uji-2", mahasiswaId: "mhs-2", kelasId: "k7", periodeId: "per-2025-1", status: "DISETUJUI", tanggalDaftar: "2025-08-23" },
  { id: "krs-uji-3", mahasiswaId: "mhs-3", kelasId: "k7", periodeId: "per-2025-1", status: "DISETUJUI", tanggalDaftar: "2025-08-23" },
  { id: "krs-uji-4", mahasiswaId: "mhs-8", kelasId: "k7", periodeId: "per-2025-1", status: "DRAFT", tanggalDaftar: "2025-08-24" },
]

/** Dimas hadir 2 dari 5 pertemuan di k1 (40%, ambang 75%). */
const PRESENSI_UJI: PresensiItem[] = ["sesi-k1-1", "sesi-k1-2", "sesi-k1-3", "sesi-k1-4", "sesi-k1-5"].map((sesiId, i) => {
      const hadir = i < 2
      const sesi = INITIAL_SESI_PRESENSI.find((s) => s.id === sesiId)!
      return {
        id: `pres-uji-${i + 1}`,
        sesiId,
        kelasId: "k1",
        mahasiswaId: "mhs-6",
        waktuScan: hadir ? `${sesi.tanggal}T08:07:00Z` : null,
        status: hadir ? "HADIR" : "ALFA",
        metode: hadir ? "QR" : "MANUAL",
      } satisfies PresensiItem
    })

/** Pola nilai riwayat (urut sesuai PAST_GRADES_MHS1) untuk mahasiswa selain Budi. */
const POLA_NILAI: Record<string, string[]> = {
  "mhs-2": ["A", "A", "A", "A", "A", "A", "A", "A", "AB", "A", "A", "A", "A", "A", "AB"],
  "mhs-3": ["AB", "B", "AB", "B", "AB", "B", "AB", "AB", "B", "AB", "B", "B", "AB", "B", "BC"],
  "mhs-4": ["A", "AB", "A", "AB", "A", "A", "AB", "A", "AB", "A", "AB", "A", "A", "AB", "AB"],
  "mhs-5": ["B", "BC", "B", "C", "B", "BC", "B", "B", "BC", "B", "C", "BC", "B", "BC", "C"],
  "mhs-6": ["B", "B", "BC", "B", "B", "BC", "B", "B", "B", "BC", "B", "B", "B", "BC", "B"],
  "mhs-7": ["A", "AB", "A", "AB", "A", "A", "AB", "A", "AB", "A", "A", "AB", "A", "A", "AB"],
  "mhs-8": ["AB", "AB", "B", "AB", "AB", "B", "AB", "AB", "AB", "B", "AB", "AB", "AB", "B", "AB"],
}

function buatRiwayatNilai(mahasiswaId: string): PastGradeItem[] {
  if (mahasiswaId === "mhs-1") return PAST_GRADES_MHS1
  const pola = POLA_NILAI[mahasiswaId]
  if (!pola) return []
  return PAST_GRADES_MHS1.map((g, i) => ({
    ...g,
    id: `pg-${mahasiswaId}-${i + 1}`,
    nilaiHuruf: pola[i],
    bobotIndeks: letterGradeToIndeks(pola[i]),
  }))
}

function hitungIpk(mahasiswaId: string): number {
  const riwayat = buatRiwayatNilai(mahasiswaId)
  return calculateGpaFromGrades(
    riwayat.map((g) => ({ sks: g.sks, huruf: g.nilaiHuruf }))
  ).gpa
}

/** Pendaftaran beasiswa untuk Citra (mhs-7): DIPROSES, DITERIMA, DITOLAK. */
function buatPendaftaranUji(): PendaftaranBeasiswaItem[] {
  const ipk = hitungIpk("mhs-7")
  const dasar = {
    mahasiswaId: "mhs-7",
    nim: "220101007",
    namaMahasiswa: "Citra Beasiswa",
    programStudi: "Teknik Informatika",
    semester: 5,
    ipk,
  }
  const dok = (id: string, namaFile: string, kategori: "KTM" | "TRANSKRIP") => ({
    id,
    namaFile,
    tipeFile: "application/pdf",
    ukuranBytes: 400000,
    kategori,
    uploadedAt: "2026-08-18T09:00:00Z",
  })
  return [
    {
      ...dasar,
      id: "pend-uji-1",
      programId: "prog-1",
      motivationLetter: "Ingin melanjutkan studi dengan fokus pada pengembangan perangkat lunak untuk kebutuhan sosial.",
      dokumen: [dok("dok-uji-1", "KTM_Citra.pdf", "KTM"), dok("dok-uji-2", "Transkrip_Citra.pdf", "TRANSKRIP")],
      statusMitra: "MENUNGGU",
      statusFinal: "DIPROSES",
      tanggalDaftar: "2026-08-18T09:30:00Z",
      updatedAt: "2026-08-18T09:30:00Z",
    },
    {
      ...dasar,
      id: "pend-uji-2",
      programId: "prog-2",
      motivationLetter: "Memiliki portofolio aplikasi berbasis AI dan ingin mengembangkannya menjadi proyek akhir.",
      dokumen: [dok("dok-uji-3", "KTM_Citra_AI.pdf", "KTM"), dok("dok-uji-4", "Transkrip_Citra_AI.pdf", "TRANSKRIP")],
      statusMitra: "DIREKOMENDASIKAN",
      statusFinal: "DITERIMA",
      catatanMitra: "Portofolio kuat dan relevan dengan fokus program.",
      catatanFinal: "Disetujui oleh Direktur Kemahasiswaan.",
      tanggalDaftar: "2026-08-19T10:00:00Z",
      updatedAt: "2026-08-28T15:00:00Z",
    },
    {
      ...dasar,
      id: "pend-uji-3",
      programId: "prog-4",
      motivationLetter: "Tertarik pada riset sains dan rekayasa sejak semester awal.",
      dokumen: [dok("dok-uji-5", "KTM_Citra_Hibah.pdf", "KTM")],
      statusMitra: "DIREKOMENDASIKAN",
      statusFinal: "DITOLAK",
      catatanMitra: "Direkomendasikan, menunggu keputusan Direktorat.",
      catatanFinal: "Ditolak Direktorat: semester belum memenuhi ketentuan program.",
      tanggalDaftar: "2026-09-05T08:00:00Z",
      updatedAt: "2026-09-07T11:00:00Z",
    },
  ]
}

// ============================================
// Seed
// ============================================

async function seedUsers() {
  const users = new Map<string, SeedUser>()

  for (const u of MOCK_USERS) {
    users.set(u.id, { id: u.id, email: u.email, password: u.password, nama: u.nama, role: u.role })
  }

  const tambah = (user: SeedUser) => {
    if (!users.has(user.id)) users.set(user.id, user)
  }

  for (const m of [...INITIAL_MAHASISWA, ...MAHASISWA_UJI]) {
    const email = "email" in m ? String(m.email) : `${m.userId.replace("usr-", "")}@siakad.ac.id`
    tambah({ id: m.userId, email, password: PASSWORD_MAHASISWA, nama: m.nama, role: "MAHASISWA" })
  }
  for (const dsn of INITIAL_DOSEN) {
    tambah({ id: dsn.userId, email: `${dsn.userId.replace("usr-", "")}@siakad.ac.id`, password: PASSWORD_DOSEN, nama: dsn.nama, role: "DOSEN" })
  }
  for (const mitra of INITIAL_MITRA) {
    tambah({ id: mitra.userId, email: mitra.email, password: PASSWORD_MITRA, nama: mitra.namaOrganisasi, role: "MITRA_BEASISWA" })
  }

  for (const u of users.values()) {
    const password = await bcrypt.hash(u.password, 10)
    const data = { email: u.email, password, nama: u.nama, role: u.role, isActive: true }
    await prisma.user.upsert({ where: { id: u.id }, update: data, create: { id: u.id, ...data } })
  }
  console.log(`  users: ${users.size}`)
}

async function seedAkademik() {
  for (const mk of INITIAL_MATA_KULIAH) {
    const { id, ...data } = mk
    await prisma.mataKuliah.upsert({ where: { id }, update: data, create: { id, ...data } })
  }
  for (const r of INITIAL_RUANGAN) {
    const { id, ...data } = r
    await prisma.ruangan.upsert({ where: { id }, update: data, create: { id, ...data } })
  }
  for (const p of INITIAL_PERIODE) {
    const data = {
      nama: p.nama,
      semester: p.semester,
      tahunAjaran: p.tahunAjaran,
      tanggalMulaiKRS: d(p.tanggalMulaiKRS),
      tanggalTutupKRS: d(p.tanggalTutupKRS),
      tanggalMulai: d(p.tanggalMulaiKuliah),
      tanggalSelesai: d(p.tanggalSelesaiKuliah),
      isActive: p.isActive,
      isKrsOpen: p.isKrsOpen,
    }
    await prisma.periodeAkademik.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data } })
  }
  for (const dsn of INITIAL_DOSEN) {
    const data = { userId: dsn.userId, nidn: dsn.nidn, homebase: dsn.homebase }
    await prisma.dosen.upsert({ where: { id: dsn.id }, update: data, create: { id: dsn.id, ...data } })
  }
  for (const m of [...INITIAL_MAHASISWA, ...MAHASISWA_UJI]) {
    const data = {
      userId: m.userId,
      nim: m.nim,
      angkatan: m.angkatan,
      status: m.status,
      programStudi: m.programStudi,
      semesterSekarang: m.semesterSekarang,
    }
    await prisma.mahasiswa.upsert({ where: { id: m.id }, update: data, create: { id: m.id, ...data } })
  }
  for (const k of [...INITIAL_KELAS, KELAS_PENUH]) {
    const data = {
      mataKuliahId: k.mataKuliahId,
      dosenId: k.dosenId,
      ruanganId: k.ruanganId,
      periodeId: k.periodeId,
      namaKelas: k.namaKelas,
      hari: k.hari as "SENIN" | "SELASA" | "RABU" | "KAMIS" | "JUMAT" | "SABTU",
      jamMulai: k.jamMulai,
      jamSelesai: k.jamSelesai,
      kuota: k.kuota,
      ambangKehadiranPersen: k.ambangKehadiranPersen,
    }
    await prisma.kelas.upsert({ where: { id: k.id }, update: data, create: { id: k.id, ...data } })
  }
  for (const krs of [...INITIAL_KRS, ...KRS_UJI]) {
    const data = {
      mahasiswaId: krs.mahasiswaId,
      kelasId: krs.kelasId,
      status: krs.status,
    }
    await prisma.kRS.upsert({
      where: { id: krs.id },
      update: data,
      create: { id: krs.id, ...data, createdAt: d(krs.tanggalDaftar) },
    })
  }
  for (const c of DEFAULT_KOMPONEN_NILAI) {
    const { id, ...data } = c
    await prisma.komponenNilai.upsert({ where: { id }, update: data, create: { id, ...data } })
  }
  for (const s of DEFAULT_SKALA_NILAI) {
    const { id, ...data } = s
    await prisma.skalaNilai.upsert({ where: { id }, update: data, create: { id, ...data } })
  }
  for (const n of INITIAL_NILAI) {
    const data = {
      krsId: n.krsId,
      nilaiAkhirOtomatis: n.nilaiAkhirOtomatis ?? null,
      nilaiAkhirFinal: n.nilaiAkhirFinal ?? null,
      huruf: n.huruf ?? null,
      lockedAt: n.lockedAt ? d(n.lockedAt) : null,
    }
    await prisma.nilai.upsert({ where: { id: n.id }, update: data, create: { id: n.id, ...data } })
    for (const [komponenId, skor] of Object.entries(n.scores)) {
      await prisma.nilaiKomponen.upsert({
        where: { krsId_komponenId: { krsId: n.krsId, komponenId } },
        update: { skor },
        create: { krsId: n.krsId, komponenId, skor },
      })
    }
  }
  for (const m of [...INITIAL_MAHASISWA, ...MAHASISWA_UJI]) {
    for (const g of buatRiwayatNilai(m.id)) {
      const data = {
        namaMk: g.namaMk,
        sks: g.sks,
        semesterAmbil: g.semesterAmbil,
        periodeNama: g.periodeNama,
        nilaiHuruf: g.nilaiHuruf,
        bobotIndeks: g.bobotIndeks,
      }
      await prisma.riwayatNilai.upsert({
        where: { mahasiswaId_kodeMk: { mahasiswaId: m.id, kodeMk: g.kodeMk } },
        update: data,
        create: { id: g.id, mahasiswaId: m.id, kodeMk: g.kodeMk, ...data },
      })
    }
  }
  console.log("  akademik: ok")
}

async function seedPresensi() {
  for (const s of INITIAL_SESI_PRESENSI) {
    const data = {
      kelasId: s.kelasId,
      pertemuanKe: s.pertemuanKe,
      tanggal: d(s.tanggal),
      judulMateri: s.judulMateri,
      tokenQr: s.tokenQr,
      refreshIntervalSeconds: s.refreshIntervalSeconds,
      waktuMulai: d(s.waktuMulai),
      waktuKadaluarsa: d(s.waktuKadaluarsa),
      isActive: s.isActive,
    }
    await prisma.sesiPresensi.upsert({ where: { id: s.id }, update: data, create: { id: s.id, ...data } })
  }
  for (const p of [...INITIAL_PRESENSI, ...PRESENSI_UJI]) {
    const data = {
      sesiId: p.sesiId,
      mahasiswaId: p.mahasiswaId,
      waktuScan: p.waktuScan ? d(p.waktuScan) : null,
      status: p.status,
      metode: p.metode,
      dibatalkanOleh: p.dibatalkanOleh ?? null,
      alasanBatal: p.alasanBatal ?? null,
    }
    await prisma.presensi.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data } })
  }
  for (const log of INITIAL_LOGS_PRESENSI) {
    const pelaku = INITIAL_DOSEN.find((x) => x.nama === log.dilakukanOleh)
    const data = {
      presensiId: log.presensiId,
      aksi: log.aksi,
      statusLama: log.statusLama,
      statusBaru: log.statusBaru,
      alasan: log.alasan,
      dilakukanOleh: pelaku?.userId ?? log.dilakukanOleh,
      createdAt: d(log.timestamp),
    }
    await prisma.logPresensi.upsert({ where: { id: log.id }, update: data, create: { id: log.id, ...data } })
  }
  console.log("  presensi: ok")
}

async function seedBeasiswa() {
  for (const m of INITIAL_MITRA) {
    const data = { userId: m.userId, namaOrganisasi: m.namaOrganisasi, kontak: m.kontak, alamat: m.alamat, deskripsi: m.deskripsi ?? null }
    await prisma.mitra.upsert({ where: { id: m.id }, update: data, create: { id: m.id, ...data } })
  }
  for (const p of INITIAL_PROGRAM) {
    const data = {
      mitraId: p.mitraId,
      nama: p.nama,
      deskripsi: p.deskripsi,
      kriteria: p.kriteria,
      minimalIpk: p.minimalIpk,
      minimalSemester: p.minimalSemester,
      maksimalSemester: p.maksimalSemester,
      nominalPerSemester: p.nominalPerSemester,
      kuota: p.kuota,
      periodeMulai: d(p.periodeMulai),
      periodeSelesai: d(p.periodeSelesai),
      status: p.status,
      catatanReview: p.catatanReview ?? null,
    }
    await prisma.programBeasiswa.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data, createdAt: d(p.createdAt) } })
  }
  for (const p of [...INITIAL_PENDAFTARAN, ...buatPendaftaranUji()]) {
    const data = {
      mahasiswaId: p.mahasiswaId,
      programId: p.programId,
      semester: p.semester,
      ipk: p.ipk,
      motivationLetter: p.motivationLetter,
      statusMitra: p.statusMitra,
      statusFinal: p.statusFinal,
      catatanMitra: p.catatanMitra ?? null,
      catatanFinal: p.catatanFinal ?? null,
    }
    await prisma.pendaftaranBeasiswa.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data, createdAt: d(p.tanggalDaftar) },
    })
    for (const dok of p.dokumen) {
      const dataDok = {
        pendaftaranId: p.id,
        namaFile: dok.namaFile,
        tipeFile: dok.tipeFile,
        kategori: dok.kategori,
        ukuranBytes: dok.ukuranBytes,
        path: `/uploads/seed/${dok.namaFile}`,
      }
      await prisma.dokumenPendukung.upsert({
        where: { id: dok.id },
        update: dataDok,
        create: { id: dok.id, ...dataDok, createdAt: d(dok.uploadedAt) },
      })
    }
  }
  console.log("  beasiswa: ok")
}

async function seedLayanan() {
  for (const f of INITIAL_FASILITAS) {
    const data = {
      nama: f.nama,
      deskripsi: f.deskripsi,
      tipe: f.tipe,
      kapasitas: f.kapasitas,
      lokasi: f.lokasi,
      isActive: f.isActive,
    }
    await prisma.fasilitas.upsert({ where: { id: f.id }, update: data, create: { id: f.id, ...data, createdAt: d(f.createdAt) } })
  }
  for (const p of INITIAL_PEMINJAMAN) {
    const data = {
      mahasiswaId: p.mahasiswaId,
      fasilitasId: p.fasilitasId,
      tanggal: d(p.tanggal),
      jamMulai: p.jamMulai,
      jamSelesai: p.jamSelesai,
      keperluan: p.keperluan,
      organisasi: p.organisasi,
      status: p.status,
      catatan: p.catatan ?? null,
    }
    await prisma.peminjamanFasilitas.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data, createdAt: d(p.createdAt) } })
  }
  for (const p of INITIAL_PROPOSAL) {
    const data = {
      mahasiswaId: p.mahasiswaId,
      organisasi: p.organisasi,
      namaAcara: p.namaAcara,
      deskripsi: p.deskripsi,
      tanggalMulai: d(p.tanggalMulai),
      tanggalSelesai: d(p.tanggalSelesai),
      tempat: p.tempat,
      estimasiBiaya: p.estimasiBiaya,
      estimasiPeserta: p.estimasiPeserta,
      filePdf: `/uploads/seed/${p.filePdfNama}`,
      filePdfNama: p.filePdfNama,
      filePdfUkuran: p.filePdfUkuran,
      status: p.status,
      catatan: p.catatan ?? null,
    }
    await prisma.proposalKegiatan.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data, createdAt: d(p.createdAt) } })
  }
  console.log("  layanan: ok")
}

async function main() {
  console.log("Seeding database...")
  await seedUsers()
  await seedAkademik()
  await seedPresensi()
  await seedBeasiswa()
  await seedLayanan()
  console.log("Selesai.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
