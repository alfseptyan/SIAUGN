/**
 * Layanan Store & State Management
 * Modul 4 — Layanan Kemahasiswaan (FR-4.0 s/d FR-4.6)
 * Sub-Modul A: Peminjaman Fasilitas (Pengelola Fasilitas)
 * Sub-Modul B: Proposal Kegiatan (Direktorat Kemahasiswaan)
 * Synchronized with LocalStorage & Custom Events
 */

"use client"

import { useState, useEffect, useCallback } from "react"

// ============================================
// Types
// ============================================

export type TipeFasilitas = "RUANGAN" | "LABORATORIUM" | "ALAT" | "AULA"
export type StatusPeminjaman = "MENUNGGU" | "DISETUJUI" | "DITOLAK"
export type StatusProposal = "MENUNGGU" | "DISETUJUI" | "DITOLAK"

export interface FasilitasItem {
  id: string
  nama: string
  deskripsi: string
  tipe: TipeFasilitas
  kapasitas: number
  lokasi: string
  isActive: boolean
  createdAt: string
}

export interface PeminjamanFasilitasItem {
  id: string
  mahasiswaId: string
  namaMahasiswa: string
  nim: string
  fasilitasId: string
  namaFasilitas: string
  tanggal: string // YYYY-MM-DD
  jamMulai: string // HH:mm
  jamSelesai: string // HH:mm
  keperluan: string
  organisasi: string
  status: StatusPeminjaman
  catatan?: string
  createdAt: string
}

export interface ProposalKegiatanItem {
  id: string
  mahasiswaId: string
  namaMahasiswa: string
  nim: string
  organisasi: string
  namaAcara: string
  deskripsi: string
  tanggalMulai: string
  tanggalSelesai: string
  tempat: string
  estimasiBiaya: number
  estimasiPeserta: number
  filePdfNama: string
  filePdfUkuran: number // bytes
  status: StatusProposal
  catatan?: string
  createdAt: string
}

export interface LayananState {
  fasilitas: FasilitasItem[]
  peminjaman: PeminjamanFasilitasItem[]
  proposal: ProposalKegiatanItem[]
}

// ============================================
// Initial Mock Datasets
// ============================================

const TODAY = new Date().toISOString().split("T")[0]

export const INITIAL_FASILITAS: FasilitasItem[] = [
  {
    id: "fas-1",
    nama: "Laboratorium Komputer 1",
    deskripsi: "Lab PC lengkap dengan 40 unit komputer, proyektor, dan AC sentral. Cocok untuk praktikum pemrograman dan ujian online.",
    tipe: "LABORATORIUM",
    kapasitas: 40,
    lokasi: "Gedung F, Lantai 2, Ruang F-201",
    isActive: true,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "fas-2",
    nama: "Laboratorium Komputer 2",
    deskripsi: "Lab multimedia dengan workstation grafis dan perangkat VR. Tersedia 30 unit iMac.",
    tipe: "LABORATORIUM",
    kapasitas: 30,
    lokasi: "Gedung F, Lantai 2, Ruang F-202",
    isActive: true,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "fas-3",
    nama: "Aula Serba Guna Utama",
    deskripsi: "Aula besar untuk seminar nasional, wisuda, dan acara kampus berskala besar. Lengkap dengan sound system dan panggung.",
    tipe: "AULA",
    kapasitas: 500,
    lokasi: "Gedung Rektorat, Lantai 1",
    isActive: true,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "fas-4",
    nama: "Ruang Seminar A",
    deskripsi: "Ruang diskusi dengan meja U-shape, proyektor, whiteboard, dan fasilitas video conference.",
    tipe: "RUANGAN",
    kapasitas: 50,
    lokasi: "Gedung D, Lantai 3, Ruang D-301",
    isActive: true,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "fas-5",
    nama: "Ruang Seminar B",
    deskripsi: "Ruang seminar menengah dengan layout theater, cocok untuk workshop dan pelatihan internal.",
    tipe: "RUANGAN",
    kapasitas: 60,
    lokasi: "Gedung D, Lantai 3, Ruang D-302",
    isActive: true,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "fas-6",
    nama: "Laboratorium Jaringan & IoT",
    deskripsi: "Lab khusus praktikum jaringan komputer, keamanan siber, dan proyek IoT. Dilengkapi rack server dan perangkat Cisco.",
    tipe: "LABORATORIUM",
    kapasitas: 25,
    lokasi: "Gedung F, Lantai 3, Ruang F-301",
    isActive: true,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "fas-7",
    nama: "Ruang Rapat BEM & Ormawa",
    deskripsi: "Ruang khusus untuk rapat organisasi kemahasiswaan, kapasitas 20 orang, dilengkapi meja bundar dan proyektor portabel.",
    tipe: "RUANGAN",
    kapasitas: 20,
    lokasi: "Gedung Kemahasiswaan, Lantai 2, Ruang K-201",
    isActive: true,
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "fas-8",
    nama: "Peralatan Sound System Portabel",
    deskripsi: "Set sound system portabel (2 speaker aktif, mixer, 4 mic wireless) untuk kegiatan outdoor kampus.",
    tipe: "ALAT",
    kapasitas: 1,
    lokasi: "Gudang Logistik, Gedung Rektorat",
    isActive: true,
    createdAt: "2026-01-10T08:00:00Z",
  },
]

export const INITIAL_PEMINJAMAN: PeminjamanFasilitasItem[] = [
  {
    id: "pinjam-1",
    mahasiswaId: "mhs-1",
    namaMahasiswa: "Budi Santoso",
    nim: "220101001",
    fasilitasId: "fas-4",
    namaFasilitas: "Ruang Seminar A",
    tanggal: "2026-09-15",
    jamMulai: "09:00",
    jamSelesai: "12:00",
    keperluan: "Workshop UI/UX Design untuk anggota Himpunan Informatika",
    organisasi: "Himpunan Mahasiswa Informatika",
    status: "DISETUJUI",
    catatan: "Disetujui. Pastikan ruangan dikembalikan dalam kondisi bersih.",
    createdAt: "2026-09-08T10:00:00Z",
  },
  {
    id: "pinjam-2",
    mahasiswaId: "mhs-2",
    namaMahasiswa: "Annisa Putri",
    nim: "220101002",
    fasilitasId: "fas-1",
    namaFasilitas: "Laboratorium Komputer 1",
    tanggal: "2026-09-16",
    jamMulai: "13:00",
    jamSelesai: "16:00",
    keperluan: "Pelatihan internal pemrograman Python untuk mahasiswa baru",
    organisasi: "UKM Coding Club",
    status: "MENUNGGU",
    createdAt: "2026-09-09T14:00:00Z",
  },
  {
    id: "pinjam-3",
    mahasiswaId: "mhs-3",
    namaMahasiswa: "Rizky Pratama",
    nim: "220101003",
    fasilitasId: "fas-3",
    namaFasilitas: "Aula Serba Guna Utama",
    tanggal: "2026-09-20",
    jamMulai: "08:00",
    jamSelesai: "17:00",
    keperluan: "Seminar Nasional Teknologi Informasi 2026 (SNTI-2026)",
    organisasi: "BEM Fakultas Ilmu Komputer",
    status: "MENUNGGU",
    createdAt: "2026-09-09T09:00:00Z",
  },
  {
    id: "pinjam-4",
    mahasiswaId: "mhs-4",
    namaMahasiswa: "Siti Nurhaliza",
    nim: "220101004",
    fasilitasId: "fas-7",
    namaFasilitas: "Ruang Rapat BEM & Ormawa",
    tanggal: "2026-09-12",
    jamMulai: "15:00",
    jamSelesai: "17:00",
    keperluan: "Rapat koordinasi panitia dies natalis fakultas",
    organisasi: "BEM Fakultas Ilmu Komputer",
    status: "DISETUJUI",
    catatan: "Disetujui untuk pemakaian internal ormawa.",
    createdAt: "2026-09-07T11:00:00Z",
  },
]

export const INITIAL_PROPOSAL: ProposalKegiatanItem[] = [
  {
    id: "prop-1",
    mahasiswaId: "mhs-1",
    namaMahasiswa: "Budi Santoso",
    nim: "220101001",
    organisasi: "Himpunan Mahasiswa Informatika",
    namaAcara: "Seminar Nasional Teknologi Informasi 2026 (SNTI-2026)",
    deskripsi: "Seminar nasional dengan tema 'Peran AI dalam Transformasi Pendidikan Tinggi'. Mengundang 3 keynote speaker dari industri dan akademisi, sesi panel diskusi, dan workshop hands-on.",
    tanggalMulai: "2026-10-15",
    tanggalSelesai: "2026-10-16",
    tempat: "Aula Serba Guna Utama, Kampus",
    estimasiBiaya: 25000000,
    estimasiPeserta: 300,
    filePdfNama: "Proposal_SNTI_2026_Himpunan_Informatika.pdf",
    filePdfUkuran: 2400000,
    status: "MENUNGGU",
    createdAt: "2026-09-05T10:00:00Z",
  },
  {
    id: "prop-2",
    mahasiswaId: "mhs-2",
    namaMahasiswa: "Annisa Putri",
    nim: "220101002",
    organisasi: "UKM Coding Club",
    namaAcara: "Hackathon Internal Kampus 2026",
    deskripsi: "Kompetisi hackathon 24 jam untuk seluruh mahasiswa. Tema: Solusi Digital untuk Pelayanan Publik Daerah Terpencil. Hadiah total Rp 10 juta.",
    tanggalMulai: "2026-10-22",
    tanggalSelesai: "2026-10-23",
    tempat: "Laboratorium Komputer 1 & 2",
    estimasiBiaya: 15000000,
    estimasiPeserta: 80,
    filePdfNama: "Proposal_Hackathon_2026_CodingClub.pdf",
    filePdfUkuran: 1800000,
    status: "MENUNGGU",
    createdAt: "2026-09-06T14:00:00Z",
  },
  {
    id: "prop-3",
    mahasiswaId: "mhs-3",
    namaMahasiswa: "Rizky Pratama",
    nim: "220101003",
    organisasi: "BEM Fakultas Ilmu Komputer",
    namaAcara: "Workshop Persiapan Karir & Interview Skills",
    deskripsi: "Workshop intensif 1 hari untuk mahasiswa tingkat akhir, membahas penyusunan CV, portfolio digital, dan simulasi interview teknis bersama HRD perusahaan mitra.",
    tanggalMulai: "2026-11-05",
    tanggalSelesai: "2026-11-05",
    tempat: "Ruang Seminar B",
    estimasiBiaya: 8000000,
    estimasiPeserta: 50,
    filePdfNama: "Proposal_Workshop_Karir_BEM_FASILKOM.pdf",
    filePdfUkuran: 1200000,
    status: "DISETUJUI",
    catatan: "Disetujui oleh Direktorat Kemahasiswaan. Anggaran dicairkan melalui BEM Fakultas sesuai prosedur. SK No. 227/KEMAHASISWAAN/2026.",
    createdAt: "2026-08-20T11:00:00Z",
  },
]

// ============================================
// Storage & Event Management
// ============================================

const STORAGE_KEY = "siakad_layanan_state_v1"
const EVENT_NAME = "siakad_layanan_update"

function loadInitialState(): LayananState {
  if (typeof window === "undefined") {
    return {
      fasilitas: INITIAL_FASILITAS,
      peminjaman: INITIAL_PEMINJAMAN,
      proposal: INITIAL_PROPOSAL,
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.warn("Failed to read layanan state from localStorage:", e)
  }

  const initial: LayananState = {
    fasilitas: INITIAL_FASILITAS,
    peminjaman: INITIAL_PEMINJAMAN,
    proposal: INITIAL_PROPOSAL,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  } catch (e) {
    // ignore
  }
  return initial
}

function saveState(state: LayananState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }))
  } catch (e) {
    console.error("Failed to save layanan state:", e)
  }
}

// ============================================
// Schedule Conflict Detection (FR-4.2)
// ============================================

export function checkBentrokPeminjaman(
  peminjaman: PeminjamanFasilitasItem[],
  fasilitasId: string,
  tanggal: string,
  jamMulai: string,
  jamSelesai: string,
  excludeId?: string
): { isBentrok: boolean; conflictWith?: PeminjamanFasilitasItem } {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }

  const newStart = toMinutes(jamMulai)
  const newEnd = toMinutes(jamSelesai)

  for (const p of peminjaman) {
    if (p.id === excludeId) continue
    if (p.fasilitasId !== fasilitasId) continue
    if (p.tanggal !== tanggal) continue
    if (p.status === "DITOLAK") continue // Rejected ones don't block

    const existStart = toMinutes(p.jamMulai)
    const existEnd = toMinutes(p.jamSelesai)

    // Check overlap: two intervals overlap if start1 < end2 AND start2 < end1
    if (newStart < existEnd && existStart < newEnd) {
      return { isBentrok: true, conflictWith: p }
    }
  }

  return { isBentrok: false }
}

const DEFAULT_STATE: LayananState = {
  fasilitas: INITIAL_FASILITAS,
  peminjaman: INITIAL_PEMINJAMAN,
  proposal: INITIAL_PROPOSAL,
}

// ============================================
// Custom Hook: useLayananStore
// ============================================

export function useLayananStore() {
  const [state, setState] = useState<LayananState>(DEFAULT_STATE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setState(loadInitialState())

    const handleUpdate = () => {
      setState(loadInitialState())
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setState(loadInitialState())
      }
    }

    window.addEventListener(EVENT_NAME, handleUpdate)
    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate)
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  // -----------------------------------------------
  // Fasilitas CRUD (FR-4.0)
  // -----------------------------------------------

  const createFasilitas = useCallback(
    (data: Omit<FasilitasItem, "id" | "createdAt">) => {
      const newItem: FasilitasItem = {
        ...data,
        id: `fas-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      const updated: LayananState = { ...state, fasilitas: [newItem, ...state.fasilitas] }
      saveState(updated)
      setState(updated)
      return newItem
    },
    [state]
  )

  const updateFasilitas = useCallback(
    (id: string, updates: Partial<FasilitasItem>) => {
      const updatedList = state.fasilitas.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      )
      const updated: LayananState = { ...state, fasilitas: updatedList }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  const deleteFasilitas = useCallback(
    (id: string) => {
      const updatedFas = state.fasilitas.filter((f) => f.id !== id)
      const updatedPinjam = state.peminjaman.filter((p) => p.fasilitasId !== id)
      const updated: LayananState = { ...state, fasilitas: updatedFas, peminjaman: updatedPinjam }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  // -----------------------------------------------
  // Peminjaman Fasilitas (FR-4.1 ~ FR-4.3)
  // -----------------------------------------------

  const submitPeminjaman = useCallback(
    (payload: {
      mahasiswaId: string
      namaMahasiswa: string
      nim: string
      fasilitasId: string
      tanggal: string
      jamMulai: string
      jamSelesai: string
      keperluan: string
      organisasi: string
    }) => {
      const fasilitas = state.fasilitas.find((f) => f.id === payload.fasilitasId)
      if (!fasilitas) throw new Error("Fasilitas tidak ditemukan.")

      // Check collision (FR-4.2)
      const conflict = checkBentrokPeminjaman(
        state.peminjaman,
        payload.fasilitasId,
        payload.tanggal,
        payload.jamMulai,
        payload.jamSelesai
      )
      if (conflict.isBentrok) {
        throw new Error(
          `Jadwal bentrok dengan peminjaman "${conflict.conflictWith?.keperluan}" oleh ${conflict.conflictWith?.namaMahasiswa} (${conflict.conflictWith?.jamMulai} - ${conflict.conflictWith?.jamSelesai}).`
        )
      }

      const newItem: PeminjamanFasilitasItem = {
        id: `pinjam-${Date.now()}`,
        mahasiswaId: payload.mahasiswaId,
        namaMahasiswa: payload.namaMahasiswa,
        nim: payload.nim,
        fasilitasId: payload.fasilitasId,
        namaFasilitas: fasilitas.nama,
        tanggal: payload.tanggal,
        jamMulai: payload.jamMulai,
        jamSelesai: payload.jamSelesai,
        keperluan: payload.keperluan,
        organisasi: payload.organisasi,
        status: "MENUNGGU",
        createdAt: new Date().toISOString(),
      }

      const updated: LayananState = { ...state, peminjaman: [newItem, ...state.peminjaman] }
      saveState(updated)
      setState(updated)
      return newItem
    },
    [state]
  )

  const approvePeminjaman = useCallback(
    (id: string, catatan?: string) => {
      const updatedList = state.peminjaman.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "DISETUJUI" as StatusPeminjaman,
              catatan: catatan || "Disetujui oleh Pengelola Fasilitas.",
            }
          : p
      )
      const updated: LayananState = { ...state, peminjaman: updatedList }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  const rejectPeminjaman = useCallback(
    (id: string, catatan: string) => {
      const updatedList = state.peminjaman.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "DITOLAK" as StatusPeminjaman,
              catatan,
            }
          : p
      )
      const updated: LayananState = { ...state, peminjaman: updatedList }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  // -----------------------------------------------
  // Proposal Kegiatan (FR-4.4 ~ FR-4.5)
  // -----------------------------------------------

  const submitProposal = useCallback(
    (payload: Omit<ProposalKegiatanItem, "id" | "status" | "catatan" | "createdAt">) => {
      const newItem: ProposalKegiatanItem = {
        ...payload,
        id: `prop-${Date.now()}`,
        status: "MENUNGGU",
        createdAt: new Date().toISOString(),
      }
      const updated: LayananState = { ...state, proposal: [newItem, ...state.proposal] }
      saveState(updated)
      setState(updated)
      return newItem
    },
    [state]
  )

  const approveProposal = useCallback(
    (id: string, catatan?: string) => {
      const updatedList = state.proposal.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "DISETUJUI" as StatusProposal,
              catatan: catatan || "Disetujui oleh Direktorat Kemahasiswaan.",
            }
          : p
      )
      const updated: LayananState = { ...state, proposal: updatedList }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  const rejectProposal = useCallback(
    (id: string, catatan: string) => {
      const updatedList = state.proposal.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "DITOLAK" as StatusProposal,
              catatan,
            }
          : p
      )
      const updated: LayananState = { ...state, proposal: updatedList }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  return {
    state,
    mounted,
    createFasilitas,
    updateFasilitas,
    deleteFasilitas,
    submitPeminjaman,
    approvePeminjaman,
    rejectPeminjaman,
    submitProposal,
    approveProposal,
    rejectProposal,
  }
}

// ============================================
// Formatting Helpers
// ============================================

export function formatRupiahLayanan(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getTipeBadgeVariant(tipe: TipeFasilitas): "success" | "info" | "purple" | "warning" {
  switch (tipe) {
    case "LABORATORIUM":
      return "info"
    case "AULA":
      return "purple"
    case "ALAT":
      return "warning"
    case "RUANGAN":
    default:
      return "success"
  }
}

export function getStatusPeminjamanVariant(status: StatusPeminjaman): "success" | "warning" | "danger" {
  switch (status) {
    case "DISETUJUI":
      return "success"
    case "DITOLAK":
      return "danger"
    case "MENUNGGU":
    default:
      return "warning"
  }
}

export function getStatusProposalVariant(status: StatusProposal): "success" | "warning" | "danger" {
  switch (status) {
    case "DISETUJUI":
      return "success"
    case "DITOLAK":
      return "danger"
    case "MENUNGGU":
    default:
      return "warning"
  }
}

/**
 * Generate time slots for a day (07:00 to 21:00 in 1-hour intervals)
 */
export function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = 7; h <= 21; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`)
  }
  return slots
}

/**
 * Get bookings for a specific facility on a specific date
 */
export function getBookingsForDate(
  peminjaman: PeminjamanFasilitasItem[],
  fasilitasId: string,
  tanggal: string
): PeminjamanFasilitasItem[] {
  return peminjaman.filter(
    (p) => p.fasilitasId === fasilitasId && p.tanggal === tanggal && p.status !== "DITOLAK"
  )
}

/**
 * Check if a time slot is occupied
 */
export function isSlotOccupied(
  bookings: PeminjamanFasilitasItem[],
  slotHour: number
): PeminjamanFasilitasItem | null {
  for (const b of bookings) {
    const [startH] = b.jamMulai.split(":").map(Number)
    const [endH] = b.jamSelesai.split(":").map(Number)
    if (slotHour >= startH && slotHour < endH) {
      return b
    }
  }
  return null
}
