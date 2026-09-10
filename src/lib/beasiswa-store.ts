/**
 * Beasiswa Store & 3-Way Workflow Engine
 * Modul 3 — Manajemen Beasiswa (FR-3.1 s/d FR-3.8)
 * 3-Way Approval: Mitra Beasiswa <-> Direktorat Kemahasiswaan <-> Mahasiswa
 * Synchronized with LocalStorage & Custom Events for Real-time Reactive Updates
 */

"use client"

import { useState, useEffect, useCallback } from "react"

// ============================================
// Types
// ============================================

export type StatusProgramBeasiswa =
  | "DRAF"
  | "MENUNGGU_REVIEW"
  | "PUBLISH"
  | "DITOLAK"
  | "DITUTUP"

export type StatusMitraType = "MENUNGGU" | "DIREKOMENDASIKAN" | "DITOLAK"
export type StatusFinalType = "DIPROSES" | "DITERIMA" | "DITOLAK"

export interface MitraItem {
  id: string
  userId: string
  namaOrganisasi: string
  kontak: string
  email: string
  alamat: string
  deskripsi?: string
}

export interface ProgramBeasiswaItem {
  id: string
  mitraId: string
  mitraNama: string
  nama: string
  deskripsi: string
  kriteria: string
  minimalIpk: number
  minimalSemester: number
  maksimalSemester: number
  kuota: number
  nominalPerSemester: number
  periodeMulai: string
  periodeSelesai: string
  status: StatusProgramBeasiswa
  catatanReview?: string
  createdAt: string
  updatedAt: string
}

export interface DokumenPendukungItem {
  id: string
  namaFile: string
  tipeFile: string
  ukuranBytes: number
  kategori: "KTM" | "TRANSKRIP" | "REKOMENDASI" | "LAINNYA"
  uploadedAt: string
}

export interface PendaftaranBeasiswaItem {
  id: string
  programId: string
  mahasiswaId: string
  nim: string
  namaMahasiswa: string
  programStudi: string
  semester: number
  ipk: number
  motivationLetter: string
  dokumen: DokumenPendukungItem[]
  statusMitra: StatusMitraType
  statusFinal: StatusFinalType
  catatanMitra?: string
  catatanFinal?: string
  tanggalDaftar: string
  updatedAt: string
}

export interface BeasiswaState {
  mitra: MitraItem[]
  program: ProgramBeasiswaItem[]
  pendaftaran: PendaftaranBeasiswaItem[]
}

// ============================================
// Initial Mock Datasets
// ============================================

export const INITIAL_MITRA: MitraItem[] = [
  {
    id: "mitra-1",
    userId: "usr-mitra-001",
    namaOrganisasi: "PT Beasiswa Nusantara",
    kontak: "0812-3456-7890",
    email: "mitra@siakad.ac.id",
    alamat: "Cyber Tower 2 Lt. 15, Jl. HR Rasuna Said, Jakarta Selatan",
    deskripsi: "Lembaga filantropi korporasi yang berfokus pada pengembangan talenta sains, teknologi, dan kepemimpinan pemuda Indonesia.",
  },
  {
    id: "mitra-2",
    userId: "usr-mitra-002",
    namaOrganisasi: "Yayasan Sains & Inovasi Bangsa",
    kontak: "0813-9876-5432",
    email: "info@sainsinovasi.or.id",
    alamat: "Menara BCA Lt. 30, Jl. MH Thamrin No. 1, Jakarta Pusat",
    deskripsi: "Mendukung percepatan riset akademik mahasiswa tingkat sarjana dalam riset kecerdasan buatan dan energi terbarukan.",
  },
]

export const INITIAL_PROGRAM: ProgramBeasiswaItem[] = [
  {
    id: "prog-1",
    mitraId: "mitra-1",
    mitraNama: "PT Beasiswa Nusantara",
    nama: "Beasiswa Unggulan Prestasi Nusantara 2026",
    deskripsi: "Beasiswa penuh berupa bantuan uang kuliah dan tunjangan bulanan untuk mahasiswa berprestasi akademik unggul dan aktif berorganisasi.",
    kriteria: "IPK minimal 3.25, Mahasiswa Aktif Semester 3 s/d 7, Memiliki motivasi belajar tinggi, Tidak sedang menerima beasiswa lain sejenis.",
    minimalIpk: 3.25,
    minimalSemester: 3,
    maksimalSemester: 7,
    kuota: 15,
    nominalPerSemester: 6000000,
    periodeMulai: "2026-08-01",
    periodeSelesai: "2026-10-31",
    status: "PUBLISH",
    catatanReview: "Program disetujui Direktorat Kemahasiswaan. Memenuhi standar etika dan benefit mahasiswa.",
    createdAt: "2026-08-01T08:00:00Z",
    updatedAt: "2026-08-02T10:00:00Z",
  },
  {
    id: "prog-2",
    mitraId: "mitra-1",
    mitraNama: "PT Beasiswa Nusantara",
    nama: "Beasiswa Talenta Digital & AI 2026",
    deskripsi: "Program pembiayaan proyek akhir dan pembinaan karir untuk mahasiswa rumpun informatika dan teknologi informasi.",
    kriteria: "IPK minimal 3.50, Semester 5 s/d 8, Memiliki portofolio aplikasi atau minat riset kecerdasan buatan.",
    minimalIpk: 3.50,
    minimalSemester: 5,
    maksimalSemester: 8,
    kuota: 10,
    nominalPerSemester: 7500000,
    periodeMulai: "2026-08-15",
    periodeSelesai: "2026-11-15",
    status: "PUBLISH",
    catatanReview: "Disetujui untuk dipublikasikan kepada mahasiswa Fakultas Ilmu Komputer.",
    createdAt: "2026-08-10T09:00:00Z",
    updatedAt: "2026-08-12T14:30:00Z",
  },
  {
    id: "prog-3",
    mitraId: "mitra-1",
    mitraNama: "PT Beasiswa Nusantara",
    nama: "Program Beasiswa Kepemimpinan Muda Generasi Emas",
    deskripsi: "Dukungan biaya hidup dan mentoring kepemimpinan nasional bagi aktivis organisasi kemahasiswaan.",
    kriteria: "IPK minimal 3.00, Aktif menjabat BEM / Himpunan, Semester 3 s/d 6, Bersedia mengikuti pelatihan 6 bulan.",
    minimalIpk: 3.00,
    minimalSemester: 3,
    maksimalSemester: 6,
    kuota: 20,
    nominalPerSemester: 5000000,
    periodeMulai: "2026-09-01",
    periodeSelesai: "2026-11-30",
    status: "MENUNGGU_REVIEW",
    createdAt: "2026-09-05T11:00:00Z",
    updatedAt: "2026-09-05T11:00:00Z",
  },
  {
    id: "prog-4",
    mitraId: "mitra-2",
    mitraNama: "Yayasan Sains & Inovasi Bangsa",
    nama: "Dana Hibah Skripsi Sains & Rekayasa",
    deskripsi: "Bantuan dana pengadaan instrumen riset dan publikasi jurnal terindeks bagi mahasiswa tingkat akhir.",
    kriteria: "IPK minimal 3.20, Sedang mengambil mata kuliah Skripsi / Tugas Akhir, Semester 7 atau 8.",
    minimalIpk: 3.20,
    minimalSemester: 7,
    maksimalSemester: 8,
    kuota: 8,
    nominalPerSemester: 4500000,
    periodeMulai: "2026-09-10",
    periodeSelesai: "2026-12-01",
    status: "PUBLISH",
    createdAt: "2026-09-02T13:00:00Z",
    updatedAt: "2026-09-04T08:00:00Z",
  },
]

export const INITIAL_PENDAFTARAN: PendaftaranBeasiswaItem[] = [
  {
    id: "pend-1",
    programId: "prog-1",
    mahasiswaId: "mhs-2",
    nim: "220101002",
    namaMahasiswa: "Annisa Putri",
    programStudi: "Teknik Informatika",
    semester: 5,
    ipk: 3.85,
    motivationLetter: "Saya bertekad memperdalam studi di bidang kecerdasan komputasi dan mengembangkan solusi analitik untuk pelayanan publik di daerah terpencil.",
    dokumen: [
      { id: "dok-1", namaFile: "KTM_Annisa_Putri.pdf", tipeFile: "application/pdf", ukuranBytes: 420000, kategori: "KTM", uploadedAt: "2026-08-10T10:00:00Z" },
      { id: "dok-2", namaFile: "Transkrip_Akademik_Annisa.pdf", tipeFile: "application/pdf", ukuranBytes: 850000, kategori: "TRANSKRIP", uploadedAt: "2026-08-10T10:05:00Z" },
      { id: "dok-3", namaFile: "Surat_Rekomendasi_Dekan.pdf", tipeFile: "application/pdf", ukuranBytes: 560000, kategori: "REKOMENDASI", uploadedAt: "2026-08-10T10:10:00Z" },
    ],
    statusMitra: "DIREKOMENDASIKAN",
    statusFinal: "DIPROSES", // Rule FR-3.6: Mahasiswa sees DIPROSES until Kemahasiswaan final approval
    catatanMitra: "Kandidat memiliki capaian akademik luar biasa dan proposal motivasi yang terstruktur.",
    tanggalDaftar: "2026-08-10T10:15:00Z",
    updatedAt: "2026-08-20T14:00:00Z",
  },
  {
    id: "pend-2",
    programId: "prog-1",
    mahasiswaId: "mhs-3",
    nim: "220101003",
    namaMahasiswa: "Rizky Pratama",
    programStudi: "Teknik Informatika",
    semester: 5,
    ipk: 3.42,
    motivationLetter: "Ingin meringankan beban orang tua sekaligus fokus memperluas kontribusi di proyek software open source kampus.",
    dokumen: [
      { id: "dok-4", namaFile: "KTM_Rizky.pdf", tipeFile: "application/pdf", ukuranBytes: 380000, kategori: "KTM", uploadedAt: "2026-08-12T09:00:00Z" },
      { id: "dok-5", namaFile: "Transkrip_Rizky.pdf", tipeFile: "application/pdf", ukuranBytes: 780000, kategori: "TRANSKRIP", uploadedAt: "2026-08-12T09:02:00Z" },
    ],
    statusMitra: "MENUNGGU",
    statusFinal: "DIPROSES",
    tanggalDaftar: "2026-08-12T09:15:00Z",
    updatedAt: "2026-08-12T09:15:00Z",
  },
  {
    id: "pend-3",
    programId: "prog-1",
    mahasiswaId: "mhs-4",
    nim: "220101004",
    namaMahasiswa: "Siti Nurhaliza",
    programStudi: "Teknik Informatika",
    semester: 5,
    ipk: 3.68,
    motivationLetter: "Berencana melakukan riset implementasi machine learning pada pemetaan lahan pertanian cerdas.",
    dokumen: [
      { id: "dok-6", namaFile: "KTM_Siti.pdf", tipeFile: "application/pdf", ukuranBytes: 410000, kategori: "KTM", uploadedAt: "2026-08-14T11:00:00Z" },
      { id: "dok-7", namaFile: "Transkrip_Siti.pdf", tipeFile: "application/pdf", ukuranBytes: 810000, kategori: "TRANSKRIP", uploadedAt: "2026-08-14T11:05:00Z" },
    ],
    statusMitra: "DIREKOMENDASIKAN",
    statusFinal: "DITERIMA", // Already received Kemahasiswaan approval
    catatanMitra: "Direkomendasikan prioritas utama mitra.",
    catatanFinal: "Disetujui oleh Direktur Kemahasiswaan. SK No. 442/KEMAHASISWAAN/2026 diterbitkan.",
    tanggalDaftar: "2026-08-14T11:20:00Z",
    updatedAt: "2026-08-25T16:00:00Z",
  },
]

// ============================================
// Storage & Event Management
// ============================================

const STORAGE_KEY = "siakad_beasiswa_state_v1"
const EVENT_NAME = "siakad_beasiswa_update"

function loadInitialState(): BeasiswaState {
  if (typeof window === "undefined") {
    return {
      mitra: INITIAL_MITRA,
      program: INITIAL_PROGRAM,
      pendaftaran: INITIAL_PENDAFTARAN,
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.warn("Failed to read beasiswa state from localStorage:", e)
  }

  const initial: BeasiswaState = {
    mitra: INITIAL_MITRA,
    program: INITIAL_PROGRAM,
    pendaftaran: INITIAL_PENDAFTARAN,
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  } catch (e) {
    // ignore
  }
  return initial
}

function saveState(state: BeasiswaState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: state }))
  } catch (e) {
    console.error("Failed to save beasiswa state:", e)
  }
}

// ============================================
// Custom Hook: useBeasiswaStore
// ============================================

export function useBeasiswaStore() {
  const [state, setState] = useState<BeasiswaState>(loadInitialState)

  useEffect(() => {
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

  // ----------------------------------------------------
  // Mitra Workflow: Create, Edit, Delete, Submit Review
  // ----------------------------------------------------

  const createProgram = useCallback(
    (data: Omit<ProgramBeasiswaItem, "id" | "createdAt" | "updatedAt">) => {
      const newProgram: ProgramBeasiswaItem = {
        ...data,
        id: `prog-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updated: BeasiswaState = {
        ...state,
        program: [newProgram, ...state.program],
      }
      saveState(updated)
      setState(updated)
      return newProgram
    },
    [state]
  )

  const updateProgram = useCallback(
    (id: string, updates: Partial<ProgramBeasiswaItem>) => {
      const updatedProgram = state.program.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
      const updated: BeasiswaState = { ...state, program: updatedProgram }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  const deleteProgram = useCallback(
    (id: string) => {
      const updatedProgram = state.program.filter((p) => p.id !== id)
      const updatedPendaftaran = state.pendaftaran.filter((pend) => pend.programId !== id)
      const updated: BeasiswaState = {
        ...state,
        program: updatedProgram,
        pendaftaran: updatedPendaftaran,
      }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  // Mitra submits program for Kemahasiswaan review (FR-3.1)
  const submitProgramReview = useCallback(
    (id: string) => {
      const updatedProgram = state.program.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "MENUNGGU_REVIEW" as StatusProgramBeasiswa,
              catatanReview: undefined,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
      const updated: BeasiswaState = { ...state, program: updatedProgram }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  // ----------------------------------------------------
  // Kemahasiswaan Workflow: Review & Publish/Reject Program (FR-3.2)
  // ----------------------------------------------------

  const approveProgramByKemahasiswaan = useCallback(
    (id: string, catatan?: string) => {
      const updatedProgram = state.program.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "PUBLISH" as StatusProgramBeasiswa,
              catatanReview: catatan || "Disetujui dan dipublikasikan oleh Direktorat Kemahasiswaan.",
              updatedAt: new Date().toISOString(),
            }
          : p
      )
      const updated: BeasiswaState = { ...state, program: updatedProgram }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  const rejectProgramByKemahasiswaan = useCallback(
    (id: string, catatan: string) => {
      const updatedProgram = state.program.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "DITOLAK" as StatusProgramBeasiswa,
              catatanReview: catatan,
              updatedAt: new Date().toISOString(),
            }
          : p
      )
      const updated: BeasiswaState = { ...state, program: updatedProgram }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  // ----------------------------------------------------
  // Mahasiswa Workflow: Pendaftaran Beasiswa (FR-3.3)
  // ----------------------------------------------------

  const applyBeasiswa = useCallback(
    (payload: {
      programId: string
      mahasiswaId: string
      nim: string
      namaMahasiswa: string
      programStudi: string
      semester: number
      ipk: number
      motivationLetter: string
      dokumen: DokumenPendukungItem[]
    }) => {
      // Check if already applied
      const existing = state.pendaftaran.find(
        (p) => p.programId === payload.programId && p.mahasiswaId === payload.mahasiswaId
      )
      if (existing) {
        throw new Error("Anda sudah pernah mendaftar program beasiswa ini.")
      }

      const newPendaftaran: PendaftaranBeasiswaItem = {
        id: `pend-${Date.now()}`,
        programId: payload.programId,
        mahasiswaId: payload.mahasiswaId,
        nim: payload.nim,
        namaMahasiswa: payload.namaMahasiswa,
        programStudi: payload.programStudi,
        semester: payload.semester,
        ipk: payload.ipk,
        motivationLetter: payload.motivationLetter,
        dokumen: payload.dokumen,
        statusMitra: "MENUNGGU",
        statusFinal: "DIPROSES", // Rule FR-3.6: Mahasiswa sees DIPROSES
        tanggalDaftar: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updated: BeasiswaState = {
        ...state,
        pendaftaran: [newPendaftaran, ...state.pendaftaran],
      }
      saveState(updated)
      setState(updated)
      return newPendaftaran
    },
    [state]
  )

  // ----------------------------------------------------
  // Mitra Selection Workflow: Rekomendasi / Tolak (FR-3.4)
  // ----------------------------------------------------

  const decideApplicantByMitra = useCallback(
    (
      pendaftaranId: string,
      decision: "DIREKOMENDASIKAN" | "DITOLAK",
      catatan?: string
    ) => {
      const updatedPendaftaran = state.pendaftaran.map((p) => {
        if (p.id !== pendaftaranId) return p

        return {
          ...p,
          statusMitra: decision,
          // CRITICAL FR-3.6: statusFinal remains "DIPROSES" until Kemahasiswaan decides!
          // Mahasiswa must NOT see internal mitra rejection or recommendation yet.
          statusFinal: "DIPROSES" as StatusFinalType,
          catatanMitra: catatan || (decision === "DIREKOMENDASIKAN" ? "Direkomendasikan oleh Mitra Beasiswa." : "Tidak lolos tahap seleksi berkas mitra."),
          updatedAt: new Date().toISOString(),
        }
      })

      const updated: BeasiswaState = { ...state, pendaftaran: updatedPendaftaran }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  // ----------------------------------------------------
  // Kemahasiswaan Final Approval Workflow (FR-3.5 & FR-3.6)
  // ----------------------------------------------------

  const finalApprovalByKemahasiswaan = useCallback(
    (
      pendaftaranId: string,
      decision: "DITERIMA" | "DITOLAK",
      catatan?: string
    ) => {
      const updatedPendaftaran = state.pendaftaran.map((p) => {
        if (p.id !== pendaftaranId) return p

        return {
          ...p,
          statusFinal: decision,
          catatanFinal:
            catatan ||
            (decision === "DITERIMA"
              ? "Selamat! Berkas dan rekomendasi Anda disetujui resmi oleh Direktorat Kemahasiswaan."
              : "Mohon maaf, Anda belum dapat disetujui sebagai penerima beasiswa pada periode ini."),
          updatedAt: new Date().toISOString(),
        }
      })

      const updated: BeasiswaState = { ...state, pendaftaran: updatedPendaftaran }
      saveState(updated)
      setState(updated)
    },
    [state]
  )

  // Batch final approval for all recommended applicants of a program
  const batchFinalApprovalByKemahasiswaan = useCallback(
    (programId: string) => {
      const program = state.program.find((p) => p.id === programId)
      if (!program) return

      let count = 0
      const updatedPendaftaran = state.pendaftaran.map((p) => {
        if (p.programId === programId && p.statusMitra === "DIREKOMENDASIKAN" && p.statusFinal === "DIPROSES") {
          count++
          return {
            ...p,
            statusFinal: "DITERIMA" as StatusFinalType,
            catatanFinal: `Disetujui serentak dalam SK Penetapan Penerima Beasiswa Kemahasiswaan (${new Date().toLocaleDateString("id-ID")}).`,
            updatedAt: new Date().toISOString(),
          }
        }
        return p
      })

      const updated: BeasiswaState = { ...state, pendaftaran: updatedPendaftaran }
      saveState(updated)
      setState(updated)
      return count
    },
    [state]
  )

  // Reset demo state helper
  const resetToBeasiswaDefault = useCallback(() => {
    const initial: BeasiswaState = {
      mitra: INITIAL_MITRA,
      program: INITIAL_PROGRAM,
      pendaftaran: INITIAL_PENDAFTARAN,
    }
    saveState(initial)
    setState(initial)
  }, [])

  return {
    state,
    createProgram,
    updateProgram,
    deleteProgram,
    submitProgramReview,
    approveProgramByKemahasiswaan,
    rejectProgramByKemahasiswaan,
    applyBeasiswa,
    decideApplicantByMitra,
    finalApprovalByKemahasiswaan,
    batchFinalApprovalByKemahasiswaan,
    resetToBeasiswaDefault,
  }
}

// ============================================
// Helper Formatting & Eligibility Utilities
// ============================================

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function checkEligibility(
  program: ProgramBeasiswaItem,
  mahasiswaIpk: number,
  mahasiswaSemester: number
): { isEligible: boolean; reasons: string[] } {
  const reasons: string[] = []

  if (mahasiswaIpk < program.minimalIpk) {
    reasons.push(
      `IPK Anda (${mahasiswaIpk.toFixed(2)}) kurang dari syarat minimal (${program.minimalIpk.toFixed(2)})`
    )
  }

  if (mahasiswaSemester < program.minimalSemester) {
    reasons.push(
      `Semester Anda (${mahasiswaSemester}) belum memenuhi syarat minimal (Semester ${program.minimalSemester})`
    )
  } else if (mahasiswaSemester > program.maksimalSemester) {
    reasons.push(
      `Semester Anda (${mahasiswaSemester}) melebihi batas maksimal (Semester ${program.maksimalSemester})`
    )
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
  }
}
