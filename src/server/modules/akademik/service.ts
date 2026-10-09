import type { Prisma } from "@prisma/client"

import {
  calculateGpaFromGrades,
  getPredikatKelulusan,
  letterGradeToIndeks,
} from "@/lib/academic-utils"
import { db } from "@/server/shared/db"
import { notFound } from "@/server/shared/errors"
import type {
  JadwalDto,
  KelasDto,
  KhsDto,
  KhsMataKuliahDto,
  KrsDto,
  PeriodeDto,
  ProfilMahasiswa,
  RiwayatNilaiDto,
  StatusKrsDto,
} from "./types"

const MAKS_SKS = 24

const tgl = (d: Date) => d.toISOString().slice(0, 10)

const kelasInclude = {
  mataKuliah: true,
  ruangan: true,
  periode: true,
  dosen: { include: { user: { select: { nama: true } } } },
  _count: { select: { krs: { where: { status: "DISETUJUI" } } } },
} satisfies Prisma.KelasInclude

type KelasRow = Prisma.KelasGetPayload<{ include: typeof kelasInclude }>
type PeriodeRow = Prisma.PeriodeAkademikGetPayload<object>

function toPeriode(p: PeriodeRow): PeriodeDto {
  return {
    id: p.id,
    nama: p.nama,
    semester: p.semester as PeriodeDto["semester"],
    tahunAjaran: p.tahunAjaran,
    tanggalMulaiKRS: tgl(p.tanggalMulaiKRS),
    tanggalTutupKRS: tgl(p.tanggalTutupKRS),
    tanggalMulaiKuliah: tgl(p.tanggalMulai),
    tanggalSelesaiKuliah: tgl(p.tanggalSelesai),
    isActive: p.isActive,
    isKrsOpen: p.isKrsOpen,
  }
}

function toKelas(k: KelasRow): KelasDto {
  return {
    id: k.id,
    mataKuliahId: k.mataKuliahId,
    dosenId: k.dosenId,
    ruanganId: k.ruanganId,
    periodeId: k.periodeId,
    namaKelas: k.namaKelas,
    hari: k.hari,
    jamMulai: k.jamMulai,
    jamSelesai: k.jamSelesai,
    kuota: k.kuota,
    ambangKehadiranPersen: k.ambangKehadiranPersen,
    mataKuliah: {
      id: k.mataKuliah.id,
      kode: k.mataKuliah.kode,
      nama: k.mataKuliah.nama,
      sks: k.mataKuliah.sks,
      deskripsi: k.mataKuliah.deskripsi ?? undefined,
      semesterPaket: k.mataKuliah.semesterPaket ?? undefined,
      isActive: k.mataKuliah.isActive,
    },
    dosen: {
      id: k.dosen.id,
      userId: k.dosen.userId,
      nidn: k.dosen.nidn,
      nama: k.dosen.user.nama,
      homebase: k.dosen.homebase ?? "",
    },
    ruangan: {
      id: k.ruangan.id,
      nama: k.ruangan.nama,
      kapasitas: k.ruangan.kapasitas,
      lokasi: k.ruangan.lokasi ?? "",
      isActive: k.ruangan.isActive,
    },
    periode: toPeriode(k.periode),
    terisi: k._count.krs,
  }
}

/** Profil mahasiswa milik userId. Melempar 404 bila user bukan mahasiswa. */
export async function getProfilMahasiswa(userId: string): Promise<ProfilMahasiswa> {
  const m = await db.mahasiswa.findUnique({
    where: { userId },
    include: { user: { select: { nama: true } } },
  })
  if (!m) throw notFound("Data mahasiswa tidak ditemukan.")
  return {
    id: m.id,
    userId: m.userId,
    nim: m.nim,
    nama: m.user.nama,
    angkatan: m.angkatan,
    programStudi: m.programStudi ?? "",
    semesterSekarang: m.semesterSekarang,
    status: m.status,
  }
}

async function getPeriodeAktifRow() {
  return (
    (await db.periodeAkademik.findFirst({ where: { isActive: true } })) ??
    (await db.periodeAkademik.findFirst({ orderBy: { tanggalMulai: "desc" } }))
  )
}

/** Kelas yang diambil mahasiswa (KRS DISETUJUI) pada periode aktif. */
export async function getKelasDiambil(userId: string): Promise<KelasDto[]> {
  const profil = await getProfilMahasiswa(userId)
  const periode = await getPeriodeAktifRow()
  if (!periode) return []
  const rows = await db.kRS.findMany({
    where: { mahasiswaId: profil.id, status: "DISETUJUI", kelas: { periodeId: periode.id } },
    include: { kelas: { include: kelasInclude } },
    orderBy: { createdAt: "asc" },
  })
  return rows.map((r) => toKelas(r.kelas))
}

export async function getStatusKrs(userId: string): Promise<StatusKrsDto> {
  const mahasiswa = await getProfilMahasiswa(userId)
  const periode = await getPeriodeAktifRow()
  if (!periode) {
    return { mahasiswa, periode: null, maxSks: MAKS_SKS, totalSks: 0, krs: [], kelasTersedia: [] }
  }

  const [krsRows, kelasRows] = await Promise.all([
    db.kRS.findMany({
      where: { mahasiswaId: mahasiswa.id, kelas: { periodeId: periode.id } },
      include: { kelas: { select: { periodeId: true, mataKuliah: { select: { sks: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    db.kelas.findMany({
      where: { periodeId: periode.id },
      include: kelasInclude,
      orderBy: [{ mataKuliah: { kode: "asc" } }, { namaKelas: "asc" }],
    }),
  ])

  const krs: KrsDto[] = krsRows.map((r) => ({
    id: r.id,
    mahasiswaId: r.mahasiswaId,
    kelasId: r.kelasId,
    periodeId: r.kelas.periodeId,
    status: r.status,
    tanggalDaftar: tgl(r.createdAt),
  }))
  const totalSks = krsRows
    .filter((r) => r.status === "DISETUJUI")
    .reduce((sum, r) => sum + r.kelas.mataKuliah.sks, 0)

  return {
    mahasiswa,
    periode: toPeriode(periode),
    maxSks: MAKS_SKS,
    totalSks,
    krs,
    kelasTersedia: kelasRows.map(toKelas),
  }
}

export async function getJadwal(userId: string): Promise<JadwalDto> {
  const periode = await getPeriodeAktifRow()
  return {
    periode: periode ? toPeriode(periode) : null,
    kelas: await getKelasDiambil(userId),
  }
}

async function getRiwayat(mahasiswaId: string): Promise<RiwayatNilaiDto[]> {
  const rows = await db.riwayatNilai.findMany({
    where: { mahasiswaId },
    orderBy: [{ semesterAmbil: "asc" }, { kodeMk: "asc" }],
  })
  return rows.map((r) => ({
    id: r.id,
    kodeMk: r.kodeMk,
    namaMk: r.namaMk,
    sks: r.sks,
    semesterAmbil: r.semesterAmbil,
    periodeNama: r.periodeNama,
    nilaiHuruf: r.nilaiHuruf,
    bobotIndeks: r.bobotIndeks,
  }))
}

async function getSemesterBerjalan(mahasiswaId: string): Promise<KhsMataKuliahDto[]> {
  const periode = await getPeriodeAktifRow()
  if (!periode) return []
  const rows = await db.kRS.findMany({
    where: { mahasiswaId, status: "DISETUJUI", kelas: { periodeId: periode.id } },
    include: {
      nilai: true,
      kelas: { include: { mataKuliah: true, dosen: { include: { user: { select: { nama: true } } } } } },
    },
    orderBy: { createdAt: "asc" },
  })
  return rows.map((r) => {
    // Nilai hanya tampil setelah dikunci dosen
    const isLocked = Boolean(r.nilai?.lockedAt)
    const huruf = isLocked ? (r.nilai?.huruf ?? null) : null
    return {
      id: r.id,
      kodeMk: r.kelas.mataKuliah.kode,
      namaMk: r.kelas.mataKuliah.nama,
      sks: r.kelas.mataKuliah.sks,
      namaKelas: r.kelas.namaKelas,
      dosen: r.kelas.dosen.user.nama,
      nilaiAkhir: isLocked ? (r.nilai?.nilaiAkhirFinal ?? r.nilai?.nilaiAkhirOtomatis ?? null) : null,
      nilaiHuruf: huruf,
      bobotIndeks: huruf ? letterGradeToIndeks(huruf) : 0,
      isLocked,
    }
  })
}

const hitungIpk = (riwayat: RiwayatNilaiDto[], berjalan: KhsMataKuliahDto[]) =>
  calculateGpaFromGrades([
    ...riwayat.map((c) => ({ sks: c.sks, huruf: c.nilaiHuruf })),
    ...berjalan.filter((c) => c.isLocked).map((c) => ({ sks: c.sks, huruf: c.nilaiHuruf })),
  ])

/** IPK kumulatif (riwayat + semester berjalan yang sudah dikunci). */
export async function getIpk(userId: string): Promise<number> {
  const profil = await getProfilMahasiswa(userId)
  const [riwayat, berjalan] = await Promise.all([getRiwayat(profil.id), getSemesterBerjalan(profil.id)])
  return hitungIpk(riwayat, berjalan).gpa
}

export async function getKhs(userId: string, semester?: number): Promise<KhsDto> {
  const mahasiswa = await getProfilMahasiswa(userId)
  const [riwayat, semesterBerjalan] = await Promise.all([
    getRiwayat(mahasiswa.id),
    getSemesterBerjalan(mahasiswa.id),
  ])

  const dipilih = semester ?? mahasiswa.semesterSekarang
  const mataKuliah: KhsMataKuliahDto[] =
    dipilih === mahasiswa.semesterSekarang
      ? semesterBerjalan
      : riwayat
          .filter((c) => c.semesterAmbil === dipilih)
          .map((c) => ({
            id: c.id,
            kodeMk: c.kodeMk,
            namaMk: c.namaMk,
            sks: c.sks,
            namaKelas: "A",
            dosen: "-",
            nilaiAkhir: null,
            nilaiHuruf: c.nilaiHuruf,
            bobotIndeks: c.bobotIndeks,
            isLocked: true,
          }))

  const ips = calculateGpaFromGrades(
    mataKuliah.filter((c) => c.isLocked && c.nilaiHuruf).map((c) => ({ sks: c.sks, huruf: c.nilaiHuruf }))
  )
  const ipk = hitungIpk(riwayat, semesterBerjalan)
  const semesterTersedia = [
    ...new Set([...riwayat.map((c) => c.semesterAmbil), mahasiswa.semesterSekarang]),
  ].sort((a, b) => a - b)

  return {
    mahasiswa,
    semesterBerjalan,
    riwayat,
    khs: { semester: dipilih, semesterTersedia, mataKuliah, ips },
    ipk,
    predikat: getPredikatKelulusan(ipk.gpa),
  }
}
