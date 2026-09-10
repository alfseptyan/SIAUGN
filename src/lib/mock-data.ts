/**
 * Mock data untuk development tanpa database.
 * Data ini akan diganti dengan query Prisma di fase berikutnya.
 */

import { type UserRole } from "./constants"

// ============================================
// Mock Users untuk Login
// ============================================

export interface MockUser {
  id: string
  email: string
  password: string // plaintext untuk dev, nanti di-hash
  nama: string
  role: UserRole
  avatarUrl?: string
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "usr-admin-001",
    email: "admin@siakad.ac.id",
    password: "admin123",
    nama: "Siti Rahayu",
    role: "SUPER_ADMIN",
  },
  {
    id: "usr-dosen-001",
    email: "dosen@siakad.ac.id",
    password: "dosen123",
    nama: "Dr. Ahmad Fauzi, M.Kom.",
    role: "DOSEN",
  },
  {
    id: "usr-mhs-001",
    email: "mahasiswa@siakad.ac.id",
    password: "mhs123",
    nama: "Budi Santoso",
    role: "MAHASISWA",
  },
  {
    id: "usr-kemahasiswaan-001",
    email: "kemahasiswaan@siakad.ac.id",
    password: "kemahasiswaan123",
    nama: "Ir. Dewi Lestari, M.T.",
    role: "DIREKTORAT_KEMAHASISWAAN",
  },
  {
    id: "usr-fasilitas-001",
    email: "fasilitas@siakad.ac.id",
    password: "fasilitas123",
    nama: "Hendra Wijaya",
    role: "PENGELOLA_FASILITAS",
  },
  {
    id: "usr-mitra-001",
    email: "mitra@siakad.ac.id",
    password: "mitra123",
    nama: "PT Beasiswa Nusantara",
    role: "MITRA_BEASISWA",
  },
]

// ============================================
// Mock Dashboard Stats
// ============================================

export const MOCK_STATS = {
  SUPER_ADMIN: {
    totalMahasiswa: 1247,
    totalDosen: 85,
    totalKelasAktif: 142,
    periodeAktif: "Ganjil 2025/2026",
    krsTerisi: 89,
    mahasiswaBaru: 312,
  },
  DOSEN: {
    kelasSaya: 4,
    totalMahasiswa: 156,
    sesiPresensiHariIni: 2,
    nilaiDiinput: 78,
    nilaiPerlu: 156,
    kelasAktif: [
      {
        id: "k1",
        mataKuliah: "Pemrograman Web",
        kode: "IF301",
        kelas: "A",
        mahasiswa: 42,
        jadwal: "Senin, 08:00 - 10:00",
        ruangan: "Lab Komputer 1",
      },
      {
        id: "k2",
        mataKuliah: "Basis Data Lanjut",
        kode: "IF302",
        kelas: "B",
        mahasiswa: 38,
        jadwal: "Selasa, 10:00 - 12:00",
        ruangan: "R. 201",
      },
      {
        id: "k3",
        mataKuliah: "Kecerdasan Buatan",
        kode: "IF401",
        kelas: "A",
        mahasiswa: 40,
        jadwal: "Rabu, 13:00 - 15:00",
        ruangan: "R. 302",
      },
      {
        id: "k4",
        mataKuliah: "Rekayasa Perangkat Lunak",
        kode: "IF303",
        kelas: "A",
        mahasiswa: 36,
        jadwal: "Kamis, 08:00 - 10:00",
        ruangan: "R. 101",
      },
    ],
  },
  MAHASISWA: {
    totalSKS: 20,
    ipk: 3.67,
    ips: 3.75,
    kehadiran: 92.5,
    nim: "21102001",
    angkatan: 2021,
    semester: 7,
    programStudi: "Teknik Informatika",
    jadwalHariIni: [
      {
        id: "j1",
        mataKuliah: "Pemrograman Web",
        jam: "08:00 - 10:00",
        ruangan: "Lab Komputer 1",
        dosen: "Dr. Ahmad Fauzi, M.Kom.",
      },
      {
        id: "j2",
        mataKuliah: "Tugas Akhir",
        jam: "13:00 - 15:00",
        ruangan: "R. Bimbingan",
        dosen: "Prof. Widodo, Ph.D.",
      },
    ],
    beasiswaAktif: 1,
    notifikasiBaru: 3,
  },
  DIREKTORAT_KEMAHASISWAAN: {
    programPending: 3,
    proposalPending: 7,
    totalProgramAktif: 12,
    totalProposalBulanIni: 15,
    totalMahasiswaPenerima: 89,
  },
  PENGELOLA_FASILITAS: {
    totalFasilitas: 24,
    peminjamanPending: 5,
    peminjamanHariIni: 8,
    fasilitasTersedia: 18,
    peminjamanBulanIni: 47,
  },
  MITRA_BEASISWA: {
    programSaya: 3,
    totalPendaftar: 156,
    keputusanPending: 42,
    programAktif: 2,
    programDraft: 1,
  },
}

// ============================================
// Mock Recent Activities
// ============================================

export const MOCK_ACTIVITIES = [
  {
    id: "act-1",
    text: "Mahasiswa Budi Santoso mendaftar KRS",
    time: "5 menit yang lalu",
    type: "krs" as const,
  },
  {
    id: "act-2",
    text: "Dr. Ahmad Fauzi membuka sesi presensi kelas IF301-A",
    time: "15 menit yang lalu",
    type: "presensi" as const,
  },
  {
    id: "act-3",
    text: "Program Beasiswa Unggulan Nusantara dipublish",
    time: "1 jam yang lalu",
    type: "beasiswa" as const,
  },
  {
    id: "act-4",
    text: "Peminjaman Lab Komputer 2 disetujui",
    time: "2 jam yang lalu",
    type: "fasilitas" as const,
  },
  {
    id: "act-5",
    text: "Nilai kelas IF302-B telah dikunci oleh dosen",
    time: "3 jam yang lalu",
    type: "nilai" as const,
  },
]
