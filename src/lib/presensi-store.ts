/**
 * Presensi Store & State Management
 * Modul 2 — Presensi (FR-2.1 s/d FR-2.7)
 * Persisted via localStorage with real-time sync across browser tabs
 */

"use client"

import { useState, useEffect } from "react"
import {
  generateRandomToken,
  validateScannedQr,
  calculateAttendanceMetrics,
} from "./presensi-utils"

// ============================================
// Types
// ============================================

export type StatusPresensiType = "HADIR" | "IZIN" | "SAKIT" | "ALFA"
export type MetodePresensiType = "QR" | "MANUAL"

export interface SesiPresensiItem {
  id: string
  kelasId: string
  pertemuanKe: number
  tanggal: string
  judulMateri: string
  tokenQr: string
  waktuMulai: string
  waktuKadaluarsa: string
  isActive: boolean
  refreshIntervalSeconds: number
}

export interface PresensiItem {
  id: string
  sesiId: string
  kelasId: string
  mahasiswaId: string
  waktuScan: string | null
  status: StatusPresensiType
  metode: MetodePresensiType
  dibatalkanOleh?: string | null
  alasanBatal?: string | null
}

export interface LogPresensiItem {
  id: string
  presensiId: string
  sesiId: string
  mahasiswaId: string
  mahasiswaNama: string
  aksi: "DIBATALKAN_CURANG" | "DIUBAH_MANUAL" | "PULIHKAN"
  statusLama: string
  statusBaru: string
  alasan: string
  dilakukanOleh: string // nama dosen / user
  timestamp: string
}

// ============================================
// Initial Mock Datasets
// ============================================

const PAST_DATE_1 = "2025-09-08"
const PAST_DATE_2 = "2025-09-15"
const PAST_DATE_3 = "2025-09-22"
const PAST_DATE_4 = "2025-09-29"
const PAST_DATE_5 = "2025-10-06"
const TODAY_DATE = new Date().toISOString().split("T")[0]

export const INITIAL_SESI_PRESENSI: SesiPresensiItem[] = [
  {
    id: "sesi-k1-1",
    kelasId: "k1",
    pertemuanKe: 1,
    tanggal: PAST_DATE_1,
    judulMateri: "Kontrak Kuliah & Pengenalan Next.js Modern",
    tokenQr: "EXP001",
    waktuMulai: `${PAST_DATE_1}T08:00:00Z`,
    waktuKadaluarsa: `${PAST_DATE_1}T10:30:00Z`,
    isActive: false,
    refreshIntervalSeconds: 45,
  },
  {
    id: "sesi-k1-2",
    kelasId: "k1",
    pertemuanKe: 2,
    tanggal: PAST_DATE_2,
    judulMateri: "TypeScript & React 19 Fundamental",
    tokenQr: "EXP002",
    waktuMulai: `${PAST_DATE_2}T08:00:00Z`,
    waktuKadaluarsa: `${PAST_DATE_2}T10:30:00Z`,
    isActive: false,
    refreshIntervalSeconds: 45,
  },
  {
    id: "sesi-k1-3",
    kelasId: "k1",
    pertemuanKe: 3,
    tanggal: PAST_DATE_3,
    judulMateri: "Tailwind CSS Design System & UI Components",
    tokenQr: "EXP003",
    waktuMulai: `${PAST_DATE_3}T08:00:00Z`,
    waktuKadaluarsa: `${PAST_DATE_3}T10:30:00Z`,
    isActive: false,
    refreshIntervalSeconds: 45,
  },
  {
    id: "sesi-k1-4",
    kelasId: "k1",
    pertemuanKe: 4,
    tanggal: PAST_DATE_4,
    judulMateri: "Next.js App Router & Server Components",
    tokenQr: "EXP004",
    waktuMulai: `${PAST_DATE_4}T08:00:00Z`,
    waktuKadaluarsa: `${PAST_DATE_4}T10:30:00Z`,
    isActive: false,
    refreshIntervalSeconds: 45,
  },
  {
    id: "sesi-k1-5",
    kelasId: "k1",
    pertemuanKe: 5,
    tanggal: PAST_DATE_5,
    judulMateri: "State Management & Data Fetching",
    tokenQr: "EXP005",
    waktuMulai: `${PAST_DATE_5}T08:00:00Z`,
    waktuKadaluarsa: `${PAST_DATE_5}T10:30:00Z`,
    isActive: false,
    refreshIntervalSeconds: 45,
  },
  {
    id: "sesi-k1-active",
    kelasId: "k1",
    pertemuanKe: 6,
    tanggal: TODAY_DATE,
    judulMateri: "Autentikasi & Real-time QR Code Presensi",
    tokenQr: "QR789A",
    waktuMulai: new Date().toISOString(),
    waktuKadaluarsa: new Date(Date.now() + 60000).toISOString(),
    isActive: true,
    refreshIntervalSeconds: 45,
  },
]

export const INITIAL_PRESENSI: PresensiItem[] = [
  // Pertemuan 1
  { id: "pres-1-1", sesiId: "sesi-k1-1", kelasId: "k1", mahasiswaId: "mhs-1", waktuScan: `${PAST_DATE_1}T08:05:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-1-2", sesiId: "sesi-k1-1", kelasId: "k1", mahasiswaId: "mhs-2", waktuScan: `${PAST_DATE_1}T08:06:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-1-3", sesiId: "sesi-k1-1", kelasId: "k1", mahasiswaId: "mhs-3", waktuScan: `${PAST_DATE_1}T08:10:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-1-4", sesiId: "sesi-k1-1", kelasId: "k1", mahasiswaId: "mhs-4", waktuScan: null, status: "IZIN", metode: "MANUAL" },
  { id: "pres-1-5", sesiId: "sesi-k1-1", kelasId: "k1", mahasiswaId: "mhs-5", waktuScan: null, status: "ALFA", metode: "MANUAL" },

  // Pertemuan 2
  { id: "pres-2-1", sesiId: "sesi-k1-2", kelasId: "k1", mahasiswaId: "mhs-1", waktuScan: `${PAST_DATE_2}T08:03:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-2-2", sesiId: "sesi-k1-2", kelasId: "k1", mahasiswaId: "mhs-2", waktuScan: `${PAST_DATE_2}T08:04:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-2-3", sesiId: "sesi-k1-2", kelasId: "k1", mahasiswaId: "mhs-3", waktuScan: null, status: "SAKIT", metode: "MANUAL" },
  { id: "pres-2-4", sesiId: "sesi-k1-2", kelasId: "k1", mahasiswaId: "mhs-4", waktuScan: `${PAST_DATE_2}T08:12:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-2-5", sesiId: "sesi-k1-2", kelasId: "k1", mahasiswaId: "mhs-5", waktuScan: null, status: "ALFA", metode: "MANUAL" },

  // Pertemuan 3
  { id: "pres-3-1", sesiId: "sesi-k1-3", kelasId: "k1", mahasiswaId: "mhs-1", waktuScan: `${PAST_DATE_3}T08:02:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-3-2", sesiId: "sesi-k1-3", kelasId: "k1", mahasiswaId: "mhs-2", waktuScan: `${PAST_DATE_3}T08:05:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-3-3", sesiId: "sesi-k1-3", kelasId: "k1", mahasiswaId: "mhs-3", waktuScan: `${PAST_DATE_3}T08:07:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-3-4", sesiId: "sesi-k1-3", kelasId: "k1", mahasiswaId: "mhs-4", waktuScan: `${PAST_DATE_3}T08:09:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-3-5", sesiId: "sesi-k1-3", kelasId: "k1", mahasiswaId: "mhs-5", waktuScan: null, status: "ALFA", metode: "MANUAL" },

  // Pertemuan 4
  { id: "pres-4-1", sesiId: "sesi-k1-4", kelasId: "k1", mahasiswaId: "mhs-1", waktuScan: `${PAST_DATE_4}T08:04:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-4-2", sesiId: "sesi-k1-4", kelasId: "k1", mahasiswaId: "mhs-2", waktuScan: `${PAST_DATE_4}T08:06:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-4-3", sesiId: "sesi-k1-4", kelasId: "k1", mahasiswaId: "mhs-3", waktuScan: null, status: "IZIN", metode: "MANUAL" },
  { id: "pres-4-4", sesiId: "sesi-k1-4", kelasId: "k1", mahasiswaId: "mhs-4", waktuScan: `${PAST_DATE_4}T08:11:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-4-5", sesiId: "sesi-k1-4", kelasId: "k1", mahasiswaId: "mhs-5", waktuScan: null, status: "ALFA", metode: "MANUAL" },

  // Pertemuan 5
  { id: "pres-5-1", sesiId: "sesi-k1-5", kelasId: "k1", mahasiswaId: "mhs-1", waktuScan: `${PAST_DATE_5}T08:01:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-5-2", sesiId: "sesi-k1-5", kelasId: "k1", mahasiswaId: "mhs-2", waktuScan: `${PAST_DATE_5}T08:05:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-5-3", sesiId: "sesi-k1-5", kelasId: "k1", mahasiswaId: "mhs-3", waktuScan: `${PAST_DATE_5}T08:08:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-5-4", sesiId: "sesi-k1-5", kelasId: "k1", mahasiswaId: "mhs-4", waktuScan: `${PAST_DATE_5}T08:09:00Z`, status: "HADIR", metode: "QR" },
  { id: "pres-5-5", sesiId: "sesi-k1-5", kelasId: "k1", mahasiswaId: "mhs-5", waktuScan: null, status: "ALFA", metode: "MANUAL" },
]

export const INITIAL_LOGS_PRESENSI: LogPresensiItem[] = [
  {
    id: "log-1",
    presensiId: "pres-4-3",
    sesiId: "sesi-k1-4",
    mahasiswaId: "mhs-3",
    mahasiswaNama: "Rizky Pratama",
    aksi: "DIUBAH_MANUAL",
    statusLama: "ALFA",
    statusBaru: "IZIN",
    alasan: "Surat izin dispensasi lomba universitas diserahkan ke dosen.",
    dilakukanOleh: "Dr. Ahmad Fauzi, M.Kom.",
    timestamp: `${PAST_DATE_4}T11:00:00Z`,
  },
]

// ============================================
// LocalStorage Persistence
// ============================================

const STORAGE_KEY = "siakad_presensi_db_v1"
const SYNC_EVENT = "siakad_presensi_sync"

interface PresensiState {
  sesi: SesiPresensiItem[]
  presensi: PresensiItem[]
  logs: LogPresensiItem[]
}

function getInitialState(): PresensiState {
  return {
    sesi: INITIAL_SESI_PRESENSI,
    presensi: INITIAL_PRESENSI,
    logs: INITIAL_LOGS_PRESENSI,
  }
}

function loadState(): PresensiState {
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

function saveState(state: PresensiState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    window.dispatchEvent(new CustomEvent(SYNC_EVENT))
  } catch (err) {
    console.error("Gagal menyimpan presensi state:", err)
  }
}

// ============================================
// Hook: usePresensiStore
// ============================================

export function usePresensiStore() {
  const [state, setState] = useState<PresensiState>(loadState)

  useEffect(() => {
    const handleSync = () => setState(loadState())
    window.addEventListener(SYNC_EVENT, handleSync)
    window.addEventListener("storage", handleSync)
    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync)
      window.removeEventListener("storage", handleSync)
    }
  }, [])

  // ==========================================
  // Actions: Dosen Sesi (FR-2.1)
  // ==========================================
  const openNewSesi = (
    kelasId: string,
    pertemuanKe: number,
    judulMateri: string,
    refreshInterval = 45
  ): SesiPresensiItem => {
    const token = generateRandomToken(6)
    const now = new Date()
    const expiry = new Date(now.getTime() + refreshInterval * 1000)

    // Tutup sesi aktif lain di kelas yang sama
    const updatedSesi = state.sesi.map((s) =>
      s.kelasId === kelasId ? { ...s, isActive: false } : s
    )

    const newSesi: SesiPresensiItem = {
      id: `sesi-${Date.now()}`,
      kelasId,
      pertemuanKe,
      tanggal: now.toISOString().split("T")[0],
      judulMateri: judulMateri || `Pertemuan Ke-${pertemuanKe}`,
      tokenQr: token,
      waktuMulai: now.toISOString(),
      waktuKadaluarsa: expiry.toISOString(),
      isActive: true,
      refreshIntervalSeconds: refreshInterval,
    }

    const updated = {
      ...state,
      sesi: [...updatedSesi, newSesi],
    }
    saveState(updated)
    setState(updated)
    return newSesi
  }

  const refreshTokenSesi = (sesiId: string): string => {
    const newToken = generateRandomToken(6)
    const now = new Date()
    const currentSesi = state.sesi.find((s) => s.id === sesiId)
    const interval = currentSesi?.refreshIntervalSeconds || 45
    const expiry = new Date(now.getTime() + interval * 1000)

    const updated = {
      ...state,
      sesi: state.sesi.map((s) =>
        s.id === sesiId
          ? {
              ...s,
              tokenQr: newToken,
              waktuKadaluarsa: expiry.toISOString(),
            }
          : s
      ),
    }
    saveState(updated)
    setState(updated)
    return newToken
  }

  const closeSesi = (sesiId: string) => {
    const updated = {
      ...state,
      sesi: state.sesi.map((s) =>
        s.id === sesiId ? { ...s, isActive: false } : s
      ),
    }
    saveState(updated)
    setState(updated)
  }

  // ==========================================
  // Actions: Mahasiswa Scan QR (FR-2.2)
  // ==========================================
  const recordMahasiswaPresensi = (
    sesiId: string,
    mahasiswaId: string,
    rawQrOrToken: string
  ): { success: boolean; message: string } => {
    const activeSesi = state.sesi.find((s) => s.id === sesiId)
    if (!activeSesi || !activeSesi.isActive) {
      return { success: false, message: "Sesi presensi perkuliahan ini sudah ditutup." }
    }

    // Validasi token QR
    const validation = validateScannedQr(rawQrOrToken, activeSesi)
    if (!validation.isValid) {
      return { success: false, message: validation.message }
    }

    // Cek apakah mahasiswa sudah presensi pada sesi ini
    const existing = state.presensi.find(
      (p) => p.sesiId === sesiId && p.mahasiswaId === mahasiswaId
    )

    if (existing && existing.status === "HADIR") {
      return { success: false, message: "Anda sudah tercatat HADIR pada pertemuan ini!" }
    }

    const nowIso = new Date().toISOString()
    let updatedPresensiList = [...state.presensi]

    if (existing) {
      updatedPresensiList = updatedPresensiList.map((p) =>
        p.id === existing.id
          ? {
              ...p,
              status: "HADIR" as const,
              metode: "QR" as const,
              waktuScan: nowIso,
              dibatalkanOleh: null,
              alasanBatal: null,
            }
          : p
      )
    } else {
      updatedPresensiList.push({
        id: `pres-${Date.now()}`,
        sesiId,
        kelasId: activeSesi.kelasId,
        mahasiswaId,
        waktuScan: nowIso,
        status: "HADIR",
        metode: "QR",
      })
    }

    const updated = { ...state, presensi: updatedPresensiList }
    saveState(updated)
    setState(updated)
    return { success: true, message: "Presensi berhasil dicatat! Status: HADIR (via QR Code)" }
  }

  // ==========================================
  // Actions: Presensi Manual Dosen (FR-2.3)
  // ==========================================
  const markManualPresensi = (
    sesiId: string,
    mahasiswaId: string,
    status: StatusPresensiType,
    dilakukanOleh = "Dosen Pengampu"
  ) => {
    const sesi = state.sesi.find((s) => s.id === sesiId)
    if (!sesi) return

    const existingIndex = state.presensi.findIndex(
      (p) => p.sesiId === sesiId && p.mahasiswaId === mahasiswaId
    )

    let updatedList = [...state.presensi]
    let oldStatus = "ALFA"

    if (existingIndex >= 0) {
      oldStatus = updatedList[existingIndex].status
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        status,
        metode: "MANUAL",
        waktuScan: status === "HADIR" ? new Date().toISOString() : null,
      }
    } else {
      updatedList.push({
        id: `pres-${Date.now()}`,
        sesiId,
        kelasId: sesi.kelasId,
        mahasiswaId,
        waktuScan: status === "HADIR" ? new Date().toISOString() : null,
        status,
        metode: "MANUAL",
      })
    }

    const updated = { ...state, presensi: updatedList }
    saveState(updated)
    setState(updated)
  }

  // ==========================================
  // Actions: Pembatalan Kehadiran Curang & Audit Log (FR-2.4 & FR-2.5)
  // ==========================================
  const cancelPresensiCurang = (
    sesiId: string,
    mahasiswaId: string,
    mahasiswaNama: string,
    alasan: string,
    dilakukanOleh: string
  ) => {
    const sesi = state.sesi.find((s) => s.id === sesiId)
    if (!sesi) return

    const existing = state.presensi.find(
      (p) => p.sesiId === sesiId && p.mahasiswaId === mahasiswaId
    )
    if (!existing) return

    const oldStatus = existing.status

    // Ubah status jadi ALFA dan tandai pembatalan
    const updatedPresensi = state.presensi.map((p) =>
      p.id === existing.id
        ? {
            ...p,
            status: "ALFA" as const,
            dibatalkanOleh: dilakukanOleh,
            alasanBatal: alasan,
          }
        : p
    )

    // Catat ke log audit
    const newLog: LogPresensiItem = {
      id: `log-${Date.now()}`,
      presensiId: existing.id,
      sesiId,
      mahasiswaId,
      mahasiswaNama,
      aksi: "DIBATALKAN_CURANG",
      statusLama: oldStatus,
      statusBaru: "ALFA",
      alasan,
      dilakukanOleh,
      timestamp: new Date().toISOString(),
    }

    const updated = {
      ...state,
      presensi: updatedPresensi,
      logs: [newLog, ...state.logs],
    }
    saveState(updated)
    setState(updated)
  }

  return {
    state,
    openNewSesi,
    refreshTokenSesi,
    closeSesi,
    recordMahasiswaPresensi,
    markManualPresensi,
    cancelPresensiCurang,
  }
}
