import type { KelasDto } from "@/server/modules/akademik"

export type StatusPresensi = "HADIR" | "IZIN" | "SAKIT" | "ALFA"
export type MetodePresensi = "QR" | "MANUAL"

/** Sesi presensi. tokenQr sengaja tidak disertakan agar mahasiswa tidak bisa membacanya dari API. */
export interface SesiPresensiDto {
  id: string
  kelasId: string
  pertemuanKe: number
  tanggal: string
  judulMateri: string
  waktuMulai: string
  waktuKadaluarsa: string
  isActive: boolean
  refreshIntervalSeconds: number
}

export interface RiwayatPertemuanDto {
  sesi: SesiPresensiDto
  status: StatusPresensi
  metode: MetodePresensi | null
  waktuScan: string | null
}

export interface MetrikKehadiranDto {
  totalHadir: number
  totalIzin: number
  totalSakit: number
  totalAlfa: number
  persentaseKehadiran: number
  isMemenuhiSyarat: boolean
  statusLabel: string
}

export interface RingkasanKelasDto {
  kelas: KelasDto
  sessions: RiwayatPertemuanDto[]
  metrics: MetrikKehadiranDto
}

export interface RingkasanPresensiDto {
  mahasiswaId: string
  kelas: RingkasanKelasDto[]
  /** Sesi yang sedang dibuka pada kelas yang diambil mahasiswa. */
  sesiAktif: SesiPresensiDto[]
}
