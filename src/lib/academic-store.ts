/**
 * Academic Store & State Management
 * Modul 1 — Akademik Utama (FR-1.1 s/d FR-1.12)
 * Persisted via localStorage with cross-component reactivity
 */

"use client"

import { useState, useEffect } from "react"
import {
  calculateWeightedFinalScore,
  convertScoreToGradeLetter,
} from "./academic-utils"

// ============================================
// Types
// ============================================

export interface MataKuliahItem {
  id: string
  kode: string
  nama: string
  sks: number
  deskripsi?: string
  semesterPaket?: number
  isActive: boolean
}

export interface RuanganItem {
  id: string
  nama: string
  kapasitas: number
  lokasi: string
  isActive: boolean
}

export interface PeriodeAkademikItem {
  id: string
  nama: string // e.g. "Ganjil 2025/2026"
  semester: "Ganjil" | "Genap"
  tahunAjaran: string
  tanggalMulaiKRS: string
  tanggalTutupKRS: string
  tanggalMulaiKuliah: string
  tanggalSelesaiKuliah: string
  isActive: boolean
  isKrsOpen: boolean
}

export interface DosenItem {
  id: string
  userId: string
  nidn: string
  nama: string
  homebase: string
}

export interface MahasiswaItem {
  id: string
  userId: string
  nim: string
  nama: string
  angkatan: number
  programStudi: string
  semesterSekarang: number
  status: "AKTIF" | "CUTI" | "DO"
}

export interface KelasItem {
  id: string
  mataKuliahId: string
  dosenId: string
  ruanganId: string
  periodeId: string
  namaKelas: string // "A", "B", "C"
  hari: string // "SENIN" | "SELASA" | "RABU" | "KAMIS" | "JUMAT" | "SABTU"
  jamMulai: string // "08:00"
  jamSelesai: string // "10:00"
  kuota: number
  ambangKehadiranPersen: number // default 75
  // Embedded / joined for convenience
  mataKuliah?: MataKuliahItem
  dosen?: DosenItem
  ruangan?: RuanganItem
  periode?: PeriodeAkademikItem
  terisi?: number
  isGradeLocked?: boolean
}

export interface KrsItem {
  id: string
  mahasiswaId: string
  kelasId: string
  periodeId: string
  status: "DRAFT" | "DISETUJUI" | "DIBATALKAN"
  tanggalDaftar: string
  kelas?: KelasItem
}

export interface KomponenNilaiItem {
  id: string
  kelasId: string
  nama: string // e.g. "Tugas", "UTS", "UAS"
  bobotPersen: number // e.g. 30.0
}

export interface SkalaNilaiItem {
  id: string
  kelasId: string
  huruf: string // "A", "AB", "B", "BC", "C", "D", "E"
  skorMin: number
  skorMax: number
}

export interface NilaiMahasiswaItem {
  id: string
  krsId: string
  mahasiswaId: string
  kelasId: string
  scores: Record<string, number> // komponenId -> score (0 - 100)
  nilaiAkhirOtomatis?: number
  nilaiAkhirFinal?: number
  huruf?: string
  lockedAt?: string | null
}

export interface PastGradeItem {
  id: string
  kodeMk: string
  namaMk: string
  sks: number
  semesterAmbil: number
  periodeNama: string
  nilaiHuruf: string
  bobotIndeks: number
}

// ============================================
// Initial Mock Datasets
// ============================================

export const INITIAL_MATA_KULIAH: MataKuliahItem[] = [
  { id: "mk-1", kode: "IF101", nama: "Algoritma & Pemrograman", sks: 3, deskripsi: "Dasar-dasar logika pemrograman & algoritma", semesterPaket: 1, isActive: true },
  { id: "mk-2", kode: "IF201", nama: "Struktur Data & Algoritma", sks: 3, deskripsi: "Array, Linked List, Tree, Graph, Sorting & Searching", semesterPaket: 2, isActive: true },
  { id: "mk-3", kode: "IF301", nama: "Pemrograman Web", sks: 3, deskripsi: "Pengembangan aplikasi web modern fullstack", semesterPaket: 5, isActive: true },
  { id: "mk-4", kode: "IF302", nama: "Basis Data Lanjut", sks: 3, deskripsi: "Optimasi query, indexing, transaksi & NoSQL", semesterPaket: 5, isActive: true },
  { id: "mk-5", kode: "IF303", nama: "Rekayasa Perangkat Lunak", sks: 3, deskripsi: "Metodologi Agile, Scrum, perancangan arsitektur software", semesterPaket: 5, isActive: true },
  { id: "mk-6", kode: "IF401", nama: "Kecerdasan Buatan", sks: 3, deskripsi: "Machine Learning, Neural Network & Deep Learning", semesterPaket: 5, isActive: true },
  { id: "mk-7", kode: "IF405", nama: "Keamanan Informasi", sks: 3, deskripsi: "Kriptografi, penetration testing & network security", semesterPaket: 5, isActive: true },
  { id: "mk-8", kode: "KU101", nama: "Bahasa Indonesia Akademik", sks: 2, deskripsi: "Penulisan karya ilmiah dan tata bahasa baku", semesterPaket: 1, isActive: true },
  { id: "mk-9", kode: "KU102", nama: "Bahasa Inggris Komunikasi", sks: 2, deskripsi: "Technical communication and professional English", semesterPaket: 2, isActive: true },
]

export const INITIAL_RUANGAN: RuanganItem[] = [
  { id: "ruang-1", nama: "R. 101", kapasitas: 40, lokasi: "Gedung A, Lantai 1", isActive: true },
  { id: "ruang-2", nama: "R. 201", kapasitas: 45, lokasi: "Gedung A, Lantai 2", isActive: true },
  { id: "ruang-3", nama: "R. 302", kapasitas: 40, lokasi: "Gedung B, Lantai 3", isActive: true },
  { id: "ruang-4", nama: "Lab Komputer 1", kapasitas: 35, lokasi: "Gedung C, Lantai 1", isActive: true },
  { id: "ruang-5", nama: "Lab Komputer 2", kapasitas: 35, lokasi: "Gedung C, Lantai 2", isActive: true },
  { id: "ruang-6", nama: "Auditorium Utama", kapasitas: 120, lokasi: "Gedung D, Lantai 1", isActive: true },
]

export const INITIAL_PERIODE: PeriodeAkademikItem[] = [
  {
    id: "per-2025-1",
    nama: "Ganjil 2025/2026",
    semester: "Ganjil",
    tahunAjaran: "2025/2026",
    tanggalMulaiKRS: "2025-08-15",
    tanggalTutupKRS: "2025-09-30",
    tanggalMulaiKuliah: "2025-09-01",
    tanggalSelesaiKuliah: "2026-01-15",
    isActive: true,
    isKrsOpen: true,
  },
  {
    id: "per-2024-2",
    nama: "Genap 2024/2025",
    semester: "Genap",
    tahunAjaran: "2024/2025",
    tanggalMulaiKRS: "2025-01-10",
    tanggalTutupKRS: "2025-02-05",
    tanggalMulaiKuliah: "2025-02-15",
    tanggalSelesaiKuliah: "2025-06-30",
    isActive: false,
    isKrsOpen: false,
  },
]

export const INITIAL_DOSEN: DosenItem[] = [
  { id: "dos-1", userId: "usr-dosen-001", nidn: "0412038501", nama: "Dr. Ahmad Fauzi, M.Kom.", homebase: "Teknik Informatika" },
  { id: "dos-2", userId: "usr-dos-002", nidn: "0401027001", nama: "Prof. Bambang Sutrisno, Ph.D.", homebase: "Teknik Informatika" },
  { id: "dos-3", userId: "usr-dos-003", nidn: "0418088902", nama: "Nurul Hidayati, S.T., M.Cs.", homebase: "Sistem Informasi" },
  { id: "dos-4", userId: "usr-dos-004", nidn: "0422117801", nama: "Ir. Budi Hartono, M.T.", homebase: "Teknik Elektro" },
]

export const INITIAL_MAHASISWA: MahasiswaItem[] = [
  { id: "mhs-1", userId: "usr-mhs-001", nim: "220101001", nama: "Budi Santoso", angkatan: 2022, programStudi: "Teknik Informatika", semesterSekarang: 5, status: "AKTIF" },
  { id: "mhs-2", userId: "usr-mhs-002", nim: "220101002", nama: "Annisa Putri", angkatan: 2022, programStudi: "Teknik Informatika", semesterSekarang: 5, status: "AKTIF" },
  { id: "mhs-3", userId: "usr-mhs-003", nim: "220101003", nama: "Rizky Pratama", angkatan: 2022, programStudi: "Teknik Informatika", semesterSekarang: 5, status: "AKTIF" },
  { id: "mhs-4", userId: "usr-mhs-004", nim: "220101004", nama: "Siti Nurhaliza", angkatan: 2022, programStudi: "Teknik Informatika", semesterSekarang: 5, status: "AKTIF" },
  { id: "mhs-5", userId: "usr-mhs-005", nim: "220101005", nama: "Fajar Ramadhan", angkatan: 2022, programStudi: "Teknik Informatika", semesterSekarang: 5, status: "AKTIF" },
]

export const INITIAL_KELAS: KelasItem[] = [
  {
    id: "k1",
    mataKuliahId: "mk-3",
    dosenId: "dos-1",
    ruanganId: "ruang-4",
    periodeId: "per-2025-1",
    namaKelas: "A",
    hari: "SENIN",
    jamMulai: "08:00",
    jamSelesai: "10:30",
    kuota: 40,
    ambangKehadiranPersen: 75,
  },
  {
    id: "k2",
    mataKuliahId: "mk-4",
    dosenId: "dos-1",
    ruanganId: "ruang-2",
    periodeId: "per-2025-1",
    namaKelas: "B",
    hari: "SELASA",
    jamMulai: "10:00",
    jamSelesai: "12:30",
    kuota: 40,
    ambangKehadiranPersen: 75,
  },
  {
    id: "k3",
    mataKuliahId: "mk-6",
    dosenId: "dos-1",
    ruanganId: "ruang-3",
    periodeId: "per-2025-1",
    namaKelas: "A",
    hari: "RABU",
    jamMulai: "13:00",
    jamSelesai: "15:30",
    kuota: 40,
    ambangKehadiranPersen: 80,
  },
  {
    id: "k4",
    mataKuliahId: "mk-5",
    dosenId: "dos-1",
    ruanganId: "ruang-1",
    periodeId: "per-2025-1",
    namaKelas: "A",
    hari: "KAMIS",
    jamMulai: "08:00",
    jamSelesai: "10:30",
    kuota: 40,
    ambangKehadiranPersen: 75,
  },
  {
    id: "k5",
    mataKuliahId: "mk-2",
    dosenId: "dos-3",
    ruanganId: "ruang-1",
    periodeId: "per-2025-1",
    namaKelas: "A",
    hari: "SENIN",
    jamMulai: "13:00",
    jamSelesai: "15:30",
    kuota: 40,
    ambangKehadiranPersen: 75,
  },
  {
    id: "k6",
    mataKuliahId: "mk-7",
    dosenId: "dos-2",
    ruanganId: "ruang-5",
    periodeId: "per-2025-1",
    namaKelas: "A",
    hari: "JUMAT",
    jamMulai: "08:30",
    jamSelesai: "11:00",
    kuota: 35,
    ambangKehadiranPersen: 75,
  },
]

export const INITIAL_KRS: KrsItem[] = [
  // Mahasiswa mhs-1 (Budi Santoso) mengambil k1, k2, k3, k4
  { id: "krs-1", mahasiswaId: "mhs-1", kelasId: "k1", periodeId: "per-2025-1", status: "DISETUJUI", tanggalDaftar: "2025-08-20" },
  { id: "krs-2", mahasiswaId: "mhs-1", kelasId: "k2", periodeId: "per-2025-1", status: "DISETUJUI", tanggalDaftar: "2025-08-20" },
  { id: "krs-3", mahasiswaId: "mhs-1", kelasId: "k3", periodeId: "per-2025-1", status: "DISETUJUI", tanggalDaftar: "2025-08-20" },
  { id: "krs-4", mahasiswaId: "mhs-1", kelasId: "k4", periodeId: "per-2025-1", status: "DISETUJUI", tanggalDaftar: "2025-08-20" },
  // Mahasiswa lain di kelas k1
  { id: "krs-5", mahasiswaId: "mhs-2", kelasId: "k1", periodeId: "per-2025-1", status: "DISETUJUI", tanggalDaftar: "2025-08-20" },
  { id: "krs-6", mahasiswaId: "mhs-3", kelasId: "k1", periodeId: "per-2025-1", status: "DISETUJUI", tanggalDaftar: "2025-08-21" },
  { id: "krs-7", mahasiswaId: "mhs-4", kelasId: "k1", periodeId: "per-2025-1", status: "DISETUJUI", tanggalDaftar: "2025-08-21" },
  { id: "krs-8", mahasiswaId: "mhs-5", kelasId: "k1", periodeId: "per-2025-1", status: "DISETUJUI", tanggalDaftar: "2025-08-22" },
]

export const DEFAULT_KOMPONEN_NILAI: KomponenNilaiItem[] = [
  { id: "comp-k1-1", kelasId: "k1", nama: "Tugas & Kuis", bobotPersen: 20 },
  { id: "comp-k1-2", kelasId: "k1", nama: "Praktikum", bobotPersen: 20 },
  { id: "comp-k1-3", kelasId: "k1", nama: "UTS", bobotPersen: 30 },
  { id: "comp-k1-4", kelasId: "k1", nama: "UAS / Proyek Akhir", bobotPersen: 30 },
]

export const DEFAULT_SKALA_NILAI: SkalaNilaiItem[] = [
  { id: "scale-1", kelasId: "k1", huruf: "A", skorMin: 85, skorMax: 100 },
  { id: "scale-2", kelasId: "k1", huruf: "AB", skorMin: 75, skorMax: 84.99 },
  { id: "scale-3", kelasId: "k1", huruf: "B", skorMin: 65, skorMax: 74.99 },
  { id: "scale-4", kelasId: "k1", huruf: "BC", skorMin: 55, skorMax: 64.99 },
  { id: "scale-5", kelasId: "k1", huruf: "C", skorMin: 45, skorMax: 54.99 },
  { id: "scale-6", kelasId: "k1", huruf: "D", skorMin: 35, skorMax: 44.99 },
  { id: "scale-7", kelasId: "k1", huruf: "E", skorMin: 0, skorMax: 34.99 },
]

export const INITIAL_NILAI: NilaiMahasiswaItem[] = [
  {
    id: "val-1",
    krsId: "krs-1",
    mahasiswaId: "mhs-1",
    kelasId: "k1",
    scores: { "comp-k1-1": 88, "comp-k1-2": 90, "comp-k1-3": 85, "comp-k1-4": 86 },
    nilaiAkhirOtomatis: 86.9,
    nilaiAkhirFinal: 87.0,
    huruf: "A",
    lockedAt: null, // belum dikunci agar bisa diuji oleh Dosen!
  },
  {
    id: "val-2",
    krsId: "krs-5",
    mahasiswaId: "mhs-2",
    kelasId: "k1",
    scores: { "comp-k1-1": 80, "comp-k1-2": 82, "comp-k1-3": 78, "comp-k1-4": 80 },
    nilaiAkhirOtomatis: 79.8,
    nilaiAkhirFinal: 80.0,
    huruf: "AB",
    lockedAt: null,
  },
  {
    id: "val-3",
    krsId: "krs-6",
    mahasiswaId: "mhs-3",
    kelasId: "k1",
    scores: { "comp-k1-1": 70, "comp-k1-2": 72, "comp-k1-3": 68, "comp-k1-4": 74 },
    nilaiAkhirOtomatis: 71.2,
    nilaiAkhirFinal: 71.2,
    huruf: "B",
    lockedAt: null,
  },
]

// Riwayat nilai semester sebelumnya untuk Budi Santoso (mhs-1)
export const PAST_GRADES_MHS1: PastGradeItem[] = [
  // Semester 1
  { id: "pg-1", kodeMk: "IF101", namaMk: "Algoritma & Pemrograman", sks: 3, semesterAmbil: 1, periodeNama: "Ganjil 2022/2023", nilaiHuruf: "A", bobotIndeks: 4.0 },
  { id: "pg-2", kodeMk: "KU101", namaMk: "Bahasa Indonesia Akademik", sks: 2, semesterAmbil: 1, periodeNama: "Ganjil 2022/2023", nilaiHuruf: "A", bobotIndeks: 4.0 },
  { id: "pg-3", kodeMk: "MA101", namaMk: "Kalkulus I", sks: 3, semesterAmbil: 1, periodeNama: "Ganjil 2022/2023", nilaiHuruf: "AB", bobotIndeks: 3.5 },
  { id: "pg-4", kodeMk: "FI101", namaMk: "Fisika Dasar", sks: 3, semesterAmbil: 1, periodeNama: "Ganjil 2022/2023", nilaiHuruf: "B", bobotIndeks: 3.0 },
  { id: "pg-5", kodeMk: "IF102", namaMk: "Pengantar Teknologi Informasi", sks: 2, semesterAmbil: 1, periodeNama: "Ganjil 2022/2023", nilaiHuruf: "A", bobotIndeks: 4.0 },
  // Semester 2
  { id: "pg-6", kodeMk: "IF201", namaMk: "Struktur Data & Algoritma", sks: 3, semesterAmbil: 2, periodeNama: "Genap 2022/2023", nilaiHuruf: "A", bobotIndeks: 4.0 },
  { id: "pg-7", kodeMk: "MA102", namaMk: "Matematika Diskrit", sks: 3, semesterAmbil: 2, periodeNama: "Genap 2022/2023", nilaiHuruf: "A", bobotIndeks: 4.0 },
  { id: "pg-8", kodeMk: "KU102", namaMk: "Bahasa Inggris Komunikasi", sks: 2, semesterAmbil: 2, periodeNama: "Genap 2022/2023", nilaiHuruf: "A", bobotIndeks: 4.0 },
  { id: "pg-9", kodeMk: "IF202", namaMk: "Arsitektur & Organisasi Komputer", sks: 3, semesterAmbil: 2, periodeNama: "Genap 2022/2023", nilaiHuruf: "AB", bobotIndeks: 3.5 },
  // Semester 3
  { id: "pg-10", kodeMk: "IF203", namaMk: "Basis Data Dasar", sks: 3, semesterAmbil: 3, periodeNama: "Ganjil 2023/2024", nilaiHuruf: "A", bobotIndeks: 4.0 },
  { id: "pg-11", kodeMk: "IF204", namaMk: "Sistem Operasi", sks: 3, semesterAmbil: 3, periodeNama: "Ganjil 2023/2024", nilaiHuruf: "A", bobotIndeks: 4.0 },
  { id: "pg-12", kodeMk: "IF205", namaMk: "Jaringan Komputer", sks: 3, semesterAmbil: 3, periodeNama: "Ganjil 2023/2024", nilaiHuruf: "AB", bobotIndeks: 3.5 },
  // Semester 4
  { id: "pg-13", kodeMk: "IF206", namaMk: "Pemrograman Berorientasi Objek", sks: 3, semesterAmbil: 4, periodeNama: "Genap 2023/2024", nilaiHuruf: "A", bobotIndeks: 4.0 },
  { id: "pg-14", kodeMk: "IF207", namaMk: "Analisis & Perancangan Sistem", sks: 3, semesterAmbil: 4, periodeNama: "Genap 2023/2024", nilaiHuruf: "A", bobotIndeks: 4.0 },
  { id: "pg-15", kodeMk: "MA201", namaMk: "Probabilitas & Statistika", sks: 3, semesterAmbil: 4, periodeNama: "Genap 2023/2024", nilaiHuruf: "AB", bobotIndeks: 3.5 },
]

// ============================================
// LocalStorage Persistence Keys
// ============================================

const STORAGE_KEY = "siakad_academic_db_v2"
const SYNC_EVENT = "siakad_academic_sync"

interface AcademicState {
  mataKuliah: MataKuliahItem[]
  ruangan: RuanganItem[]
  periode: PeriodeAkademikItem[]
  dosen: DosenItem[]
  mahasiswa: MahasiswaItem[]
  kelas: KelasItem[]
  krs: KrsItem[]
  komponenNilai: Record<string, KomponenNilaiItem[]> // kelasId -> KomponenNilaiItem[]
  skalaNilai: Record<string, SkalaNilaiItem[]> // kelasId -> SkalaNilaiItem[]
  nilai: NilaiMahasiswaItem[]
}

function getInitialState(): AcademicState {
  return {
    mataKuliah: INITIAL_MATA_KULIAH,
    ruangan: INITIAL_RUANGAN,
    periode: INITIAL_PERIODE,
    dosen: INITIAL_DOSEN,
    mahasiswa: INITIAL_MAHASISWA,
    kelas: INITIAL_KELAS,
    krs: INITIAL_KRS,
    komponenNilai: {
      k1: DEFAULT_KOMPONEN_NILAI,
    },
    skalaNilai: {
      k1: DEFAULT_SKALA_NILAI,
    },
    nilai: INITIAL_NILAI,
  }
}

// Helper to safely load from LocalStorage
function loadState(): AcademicState {
  if (typeof window === "undefined") return getInitialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = getInitialState()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    return JSON.parse(raw)
  } catch {
    return getInitialState()
  }
}

// Helper to save to LocalStorage and trigger event
function saveState(state: AcademicState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    window.dispatchEvent(new CustomEvent(SYNC_EVENT))
  } catch (err) {
    console.error("Gagal menyimpan academic state:", err)
  }
}

// ============================================
// Hook: useAcademicStore
// ============================================

export function useAcademicStore() {
  const [state, setState] = useState<AcademicState>(loadState)

  useEffect(() => {
    // Sync across components / tabs
    const handleSync = () => {
      setState(loadState())
    }
    window.addEventListener(SYNC_EVENT, handleSync)
    window.addEventListener("storage", handleSync)
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync)
      window.removeEventListener("storage", handleSync)
    }
  }, [])

  const activePeriode = state.periode.find((p) => p.isActive) || state.periode[0]

  // Enriched Kelas with counts and relations
  const enrichedKelas: KelasItem[] = state.kelas.map((k) => {
    const mk = state.mataKuliah.find((m) => m.id === k.mataKuliahId)
    const dos = state.dosen.find((d) => d.id === k.dosenId)
    const ru = state.ruangan.find((r) => r.id === k.ruanganId)
    const per = state.periode.find((p) => p.id === k.periodeId)
    const terisiCount = state.krs.filter(
      (entry) => entry.kelasId === k.id && entry.status === "DISETUJUI"
    ).length

    // Check if grades locked for this class
    const grades = state.nilai.filter((n) => n.kelasId === k.id)
    const isLocked = grades.length > 0 && grades.every((n) => Boolean(n.lockedAt))

    return {
      ...k,
      mataKuliah: mk,
      dosen: dos,
      ruangan: ru,
      periode: per,
      terisi: terisiCount,
      isGradeLocked: isLocked,
    }
  })

  // ==========================================
  // Actions: Mata Kuliah (FR-1.1)
  // ==========================================
  const addMataKuliah = (data: Omit<MataKuliahItem, "id">) => {
    const newItem: MataKuliahItem = {
      ...data,
      id: `mk-${Date.now()}`,
    }
    const updated = { ...state, mataKuliah: [...state.mataKuliah, newItem] }
    saveState(updated)
    setState(updated)
    return newItem
  }

  const updateMataKuliah = (id: string, data: Partial<MataKuliahItem>) => {
    const updated = {
      ...state,
      mataKuliah: state.mataKuliah.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }
    saveState(updated)
    setState(updated)
  }

  const deleteMataKuliah = (id: string) => {
    const updated = {
      ...state,
      mataKuliah: state.mataKuliah.filter((m) => m.id !== id),
    }
    saveState(updated)
    setState(updated)
  }

  // ==========================================
  // Actions: Ruangan (FR-1.1)
  // ==========================================
  const addRuangan = (data: Omit<RuanganItem, "id">) => {
    const newItem: RuanganItem = {
      ...data,
      id: `ruang-${Date.now()}`,
    }
    const updated = { ...state, ruangan: [...state.ruangan, newItem] }
    saveState(updated)
    setState(updated)
    return newItem
  }

  const updateRuangan = (id: string, data: Partial<RuanganItem>) => {
    const updated = {
      ...state,
      ruangan: state.ruangan.map((r) => (r.id === id ? { ...r, ...data } : r)),
    }
    saveState(updated)
    setState(updated)
  }

  const deleteRuangan = (id: string) => {
    const updated = {
      ...state,
      ruangan: state.ruangan.filter((r) => r.id !== id),
    }
    saveState(updated)
    setState(updated)
  }

  // ==========================================
  // Actions: Periode Akademik (FR-1.2)
  // ==========================================
  const addPeriode = (data: Omit<PeriodeAkademikItem, "id">) => {
    const newItem: PeriodeAkademikItem = {
      ...data,
      id: `per-${Date.now()}`,
    }
    const updated = { ...state, periode: [...state.periode, newItem] }
    saveState(updated)
    setState(updated)
    return newItem
  }

  const updatePeriode = (id: string, data: Partial<PeriodeAkademikItem>) => {
    const updated = {
      ...state,
      periode: state.periode.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }
    saveState(updated)
    setState(updated)
  }

  const setActivePeriode = (id: string) => {
    const updated = {
      ...state,
      periode: state.periode.map((p) => ({
        ...p,
        isActive: p.id === id,
      })),
    }
    saveState(updated)
    setState(updated)
  }

  const toggleKrsWindow = (id: string, isOpen: boolean) => {
    const updated = {
      ...state,
      periode: state.periode.map((p) => (p.id === id ? { ...p, isKrsOpen: isOpen } : p)),
    }
    saveState(updated)
    setState(updated)
  }

  // ==========================================
  // Actions: Kelas (FR-1.3)
  // ==========================================
  const addKelas = (data: Omit<KelasItem, "id">) => {
    const newItem: KelasItem = {
      ...data,
      id: `k-${Date.now()}`,
    }
    const updated = { ...state, kelas: [...state.kelas, newItem] }
    saveState(updated)
    setState(updated)
    return newItem
  }

  const updateKelas = (id: string, data: Partial<KelasItem>) => {
    const updated = {
      ...state,
      kelas: state.kelas.map((k) => (k.id === id ? { ...k, ...data } : k)),
    }
    saveState(updated)
    setState(updated)
  }

  const deleteKelas = (id: string) => {
    const updated = {
      ...state,
      kelas: state.kelas.filter((k) => k.id !== id),
      krs: state.krs.filter((krs) => krs.kelasId !== id),
    }
    saveState(updated)
    setState(updated)
  }

  // ==========================================
  // Actions: Mahasiswa KRS (FR-1.4, FR-1.5)
  // ==========================================
  const enrollKrs = (mahasiswaId: string, kelasId: string) => {
    const existing = state.krs.find(
      (k) => k.mahasiswaId === mahasiswaId && k.kelasId === kelasId
    )
    if (existing) {
      if (existing.status === "DIBATALKAN") {
        const updated = {
          ...state,
          krs: state.krs.map((k) =>
            k.id === existing.id ? { ...k, status: "DISETUJUI" as const } : k
          ),
        }
        saveState(updated)
        setState(updated)
      }
      return
    }

    const newItem: KrsItem = {
      id: `krs-${Date.now()}`,
      mahasiswaId,
      kelasId,
      periodeId: activePeriode?.id || "per-2025-1",
      status: "DISETUJUI",
      tanggalDaftar: new Date().toISOString().split("T")[0],
    }

    const updated = { ...state, krs: [...state.krs, newItem] }
    saveState(updated)
    setState(updated)
  }

  const dropKrs = (krsId: string) => {
    const updated = {
      ...state,
      krs: state.krs.filter((k) => k.id !== krsId),
    }
    saveState(updated)
    setState(updated)
  }

  // ==========================================
  // Actions: Dosen Setup Komponen & Skala (FR-1.6, FR-1.7)
  // ==========================================
  const getKomponenByKelas = (kelasId: string): KomponenNilaiItem[] => {
    return state.komponenNilai[kelasId] || DEFAULT_KOMPONEN_NILAI
  }

  const saveKomponenNilai = (kelasId: string, list: KomponenNilaiItem[]) => {
    const updated = {
      ...state,
      komponenNilai: {
        ...state.komponenNilai,
        [kelasId]: list,
      },
    }
    saveState(updated)
    setState(updated)
  }

  const getSkalaByKelas = (kelasId: string): SkalaNilaiItem[] => {
    return state.skalaNilai[kelasId] || DEFAULT_SKALA_NILAI
  }

  const saveSkalaNilai = (kelasId: string, list: SkalaNilaiItem[]) => {
    const updated = {
      ...state,
      skalaNilai: {
        ...state.skalaNilai,
        [kelasId]: list,
      },
    }
    saveState(updated)
    setState(updated)
  }

  // ==========================================
  // Actions: Dosen Input & Kunci Nilai (FR-1.8, 1.9, 1.10)
  // ==========================================
  const saveNilaiMahasiswa = (
    kelasId: string,
    mahasiswaId: string,
    scores: Record<string, number>,
    adjustedFinal?: number
  ) => {
    const comps = getKomponenByKelas(kelasId)
    const scales = getSkalaByKelas(kelasId)

    const autoScore = calculateWeightedFinalScore(scores, comps)
    const finalScore = adjustedFinal !== undefined ? adjustedFinal : autoScore
    const gradeLetter = convertScoreToGradeLetter(finalScore, scales)

    // Find existing
    const existingIndex = state.nilai.findIndex(
      (n) => n.kelasId === kelasId && n.mahasiswaId === mahasiswaId
    )

    let updatedNilai = [...state.nilai]
    if (existingIndex >= 0) {
      updatedNilai[existingIndex] = {
        ...updatedNilai[existingIndex],
        scores,
        nilaiAkhirOtomatis: autoScore,
        nilaiAkhirFinal: finalScore,
        huruf: gradeLetter,
      }
    } else {
      const targetKrs = state.krs.find(
        (k) => k.kelasId === kelasId && k.mahasiswaId === mahasiswaId
      )
      updatedNilai.push({
        id: `val-${Date.now()}`,
        krsId: targetKrs?.id || `krs-${Date.now()}`,
        mahasiswaId,
        kelasId,
        scores,
        nilaiAkhirOtomatis: autoScore,
        nilaiAkhirFinal: finalScore,
        huruf: gradeLetter,
        lockedAt: null,
      })
    }

    const updated = { ...state, nilai: updatedNilai }
    saveState(updated)
    setState(updated)
  }

  const lockGradesForKelas = (kelasId: string) => {
    const nowStr = new Date().toISOString()
    const updated = {
      ...state,
      nilai: state.nilai.map((n) =>
        n.kelasId === kelasId ? { ...n, lockedAt: nowStr } : n
      ),
    }
    saveState(updated)
    setState(updated)
  }

  const unlockGradesForKelas = (kelasId: string) => {
    const updated = {
      ...state,
      nilai: state.nilai.map((n) =>
        n.kelasId === kelasId ? { ...n, lockedAt: null } : n
      ),
    }
    saveState(updated)
    setState(updated)
  }

  const resetToDefault = () => {
    const initial = getInitialState()
    saveState(initial)
    setState(initial)
  }

  return {
    state,
    activePeriode,
    enrichedKelas,
    // Mata Kuliah
    addMataKuliah,
    updateMataKuliah,
    deleteMataKuliah,
    // Ruangan
    addRuangan,
    updateRuangan,
    deleteRuangan,
    // Periode
    addPeriode,
    updatePeriode,
    setActivePeriode,
    toggleKrsWindow,
    // Kelas
    addKelas,
    updateKelas,
    deleteKelas,
    // KRS
    enrollKrs,
    dropKrs,
    // Setup Dosen
    getKomponenByKelas,
    saveKomponenNilai,
    getSkalaByKelas,
    saveSkalaNilai,
    // Penilaian
    saveNilaiMahasiswa,
    lockGradesForKelas,
    unlockGradesForKelas,
    resetToDefault,
  }
}
