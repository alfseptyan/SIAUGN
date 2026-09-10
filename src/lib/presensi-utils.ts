/**
 * Presensi Utilities & Validation Engine
 * Modul 2 — Presensi (FR-2.1 s/d FR-2.7)
 */

export interface QrPayload {
  sesiId: string
  kelasId: string
  pertemuanKe: number
  token: string
  timestamp: number
}

/**
 * Generate token acak alfanumerik 6 digit untuk input alternatif jika kamera bermasalah.
 * Contoh: "X7K9P2"
 */
export function generateRandomToken(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // hindari karakter ambigu seperti 0, O, 1, I
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Membuat payload string JSON untuk di-encode ke QR Code
 */
export function createQrPayload(
  sesiId: string,
  kelasId: string,
  pertemuanKe: number,
  token: string
): string {
  const data: QrPayload = {
    sesiId,
    kelasId,
    pertemuanKe,
    token,
    timestamp: Date.now(),
  }
  return JSON.stringify(data)
}

/**
 * Validasi payload QR yang dipindai mahasiswa (FR-2.2)
 */
export function validateScannedQr(
  rawText: string,
  activeSession: {
    id: string
    tokenQr: string
    waktuKadaluarsa: string
    isActive: boolean
  } | null
): {
  isValid: boolean
  message: string
  data?: QrPayload
} {
  if (!activeSession || !activeSession.isActive) {
    return {
      isValid: false,
      message: "Sesi presensi perkuliahan ini telah ditutup oleh dosen.",
    }
  }

  // Cek waktu kadaluarsa sesi
  const now = Date.now()
  const expiryTime = new Date(activeSession.waktuKadaluarsa).getTime()
  if (now > expiryTime) {
    return {
      isValid: false,
      message: "Token QR Code telah kadaluarsa! Silakan scan ulang kode terbaru di layar proyektor.",
    }
  }

  // Parse payload QR
  try {
    const payload: QrPayload = JSON.parse(rawText)

    if (payload.sesiId !== activeSession.id) {
      return {
        isValid: false,
        message: "QR Code ini berasal dari sesi kelas yang berbeda.",
      }
    }

    if (payload.token !== activeSession.tokenQr) {
      return {
        isValid: false,
        message: "Token QR sudah berganti / kadaluarsa. Harap scan token terbaru.",
      }
    }

    return {
      isValid: true,
      message: "Validasi berhasil.",
      data: payload,
    }
  } catch {
    // Jika format bukan JSON, cek apakah ini input token 6 karakter langsung
    const cleanToken = rawText.trim().toUpperCase()
    if (cleanToken === activeSession.tokenQr) {
      return {
        isValid: true,
        message: "Validasi token manual berhasil.",
        data: {
          sesiId: activeSession.id,
          kelasId: "",
          pertemuanKe: 0,
          token: cleanToken,
          timestamp: Date.now(),
        },
      }
    }

    return {
      isValid: false,
      message: "Format QR Code tidak valid atau token salah.",
    }
  }
}

/**
 * Kalkulasi persentase dan statistik kehadiran mahasiswa (FR-2.6)
 */
export function calculateAttendanceMetrics(
  presensiList: Array<{ status: "HADIR" | "IZIN" | "SAKIT" | "ALFA" }>,
  totalPertemuanDigelar: number,
  ambangBatasPersen = 75
): {
  totalHadir: number
  totalIzin: number
  totalSakit: number
  totalAlfa: number
  persentaseKehadiran: number
  isMemenuhiSyarat: boolean
  statusLabel: string
} {
  let hadir = 0
  let izin = 0
  let sakit = 0
  let alfa = 0

  for (const p of presensiList) {
    if (p.status === "HADIR") hadir++
    else if (p.status === "IZIN") izin++
    else if (p.status === "SAKIT") sakit++
    else if (p.status === "ALFA") alfa++
  }

  const baseTotal = Math.max(totalPertemuanDigelar, hadir + izin + sakit + alfa, 1)
  const rate = Math.round((hadir / baseTotal) * 100)
  const isMemenuhiSyarat = rate >= ambangBatasPersen

  let statusLabel = "Aman (Memenuhi Syarat UAS)"
  if (!isMemenuhiSyarat) {
    statusLabel = `Di Bawah Ambang ${ambangBatasPersen}% (Terancam Tidak Boleh UAS)`
  }

  return {
    totalHadir: hadir,
    totalIzin: izin,
    totalSakit: sakit,
    totalAlfa: alfa,
    persentaseKehadiran: rate,
    isMemenuhiSyarat,
    statusLabel,
  }
}

/**
 * Helper untuk format ekspor CSV rekap presensi (FR-2.7)
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const processRow = (row: (string | number)[]) =>
    row
      .map((val) => {
        const text = String(val ?? "").replace(/"/g, '""')
        return `"${text}"`
      })
      .join(",")

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map(processRow)].join("\n")

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
