import type { SesiPresensi } from "@prisma/client"

import { calculateAttendanceMetrics } from "@/lib/presensi-utils"
import { getKelasDiambil, getProfilMahasiswa } from "@/server/modules/akademik"
import { db } from "@/server/shared/db"
import { notFound } from "@/server/shared/errors"
import type { RingkasanPresensiDto, SesiPresensiDto } from "./types"

function toSesi(s: SesiPresensi): SesiPresensiDto {
  return {
    id: s.id,
    kelasId: s.kelasId,
    pertemuanKe: s.pertemuanKe,
    tanggal: s.tanggal.toISOString().slice(0, 10),
    judulMateri: s.judulMateri ?? "",
    waktuMulai: s.waktuMulai.toISOString(),
    waktuKadaluarsa: s.waktuKadaluarsa.toISOString(),
    isActive: s.isActive,
    refreshIntervalSeconds: s.refreshIntervalSeconds,
  }
}

/** Ringkasan kehadiran milik user pada kelas yang ia ambil di periode aktif. */
export async function getRingkasan(userId: string, kelasId?: string): Promise<RingkasanPresensiDto> {
  const [profil, semuaKelas] = await Promise.all([getProfilMahasiswa(userId), getKelasDiambil(userId)])

  const daftarKelas = kelasId ? semuaKelas.filter((k) => k.id === kelasId) : semuaKelas
  if (kelasId && daftarKelas.length === 0) {
    throw notFound("Kelas tidak ditemukan pada KRS Anda.")
  }
  const kelasIds = daftarKelas.map((k) => k.id)

  const [sesiRows, presensiRows] = await Promise.all([
    db.sesiPresensi.findMany({
      where: { kelasId: { in: kelasIds } },
      orderBy: { pertemuanKe: "asc" },
    }),
    db.presensi.findMany({
      where: { mahasiswaId: profil.id, sesi: { kelasId: { in: kelasIds } } },
    }),
  ])
  const presensiPerSesi = new Map(presensiRows.map((p) => [p.sesiId, p]))

  const kelas = daftarKelas.map((k) => {
    const sessions = sesiRows
      .filter((s) => s.kelasId === k.id)
      .map((s) => {
        const p = presensiPerSesi.get(s.id)
        return {
          sesi: toSesi(s),
          // Tanpa catatan kehadiran dianggap ALFA
          status: p?.status ?? ("ALFA" as const),
          metode: p?.metode ?? null,
          waktuScan: p?.waktuScan?.toISOString() ?? null,
        }
      })
    const metrics = calculateAttendanceMetrics(
      sessions.map((x) => ({ status: x.status })),
      sessions.length,
      k.ambangKehadiranPersen || 75
    )
    return { kelas: k, sessions, metrics }
  })

  return {
    mahasiswaId: profil.id,
    kelas,
    sesiAktif: sesiRows.filter((s) => s.isActive).map(toSesi),
  }
}
