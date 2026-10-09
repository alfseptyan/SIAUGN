import type { Fasilitas, PeminjamanFasilitas } from "@prisma/client"

import { getProfilMahasiswa } from "@/server/modules/akademik"
import { db } from "@/server/shared/db"
import type {
  FasilitasDto,
  PeminjamanDto,
  ProposalDto,
  StatusPengajuanDto,
} from "./types"

const tgl = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "")
const HARI_MS = 24 * 60 * 60 * 1000

function toFasilitas(f: Fasilitas): FasilitasDto {
  return {
    id: f.id,
    nama: f.nama,
    deskripsi: f.deskripsi ?? "",
    tipe: f.tipe,
    kapasitas: f.kapasitas ?? 0,
    lokasi: f.lokasi ?? "",
    isActive: f.isActive,
    createdAt: f.createdAt.toISOString(),
  }
}

type PeminjamanRow = PeminjamanFasilitas & {
  fasilitas: { nama: string }
  mahasiswa: { nim: string; user: { nama: string } }
}

function toPeminjaman(p: PeminjamanRow): PeminjamanDto {
  return {
    id: p.id,
    mahasiswaId: p.mahasiswaId,
    namaMahasiswa: p.mahasiswa.user.nama,
    nim: p.mahasiswa.nim,
    fasilitasId: p.fasilitasId,
    namaFasilitas: p.fasilitas.nama,
    tanggal: tgl(p.tanggal),
    jamMulai: p.jamMulai,
    jamSelesai: p.jamSelesai,
    keperluan: p.keperluan ?? "",
    organisasi: p.organisasi ?? "",
    status: p.status,
    catatan: p.catatan ?? undefined,
    createdAt: p.createdAt.toISOString(),
  }
}

/** Menyamarkan data orang lain; hanya slot waktu dan statusnya yang tersisa. */
const samarkan = (p: PeminjamanDto): PeminjamanDto => ({
  ...p,
  mahasiswaId: "",
  namaMahasiswa: "pengguna lain",
  nim: "",
  keperluan: "Sudah dipesan",
  organisasi: "",
  catatan: undefined,
})

export async function getStatusPengajuan(userId: string): Promise<StatusPengajuanDto> {
  const profil = await getProfilMahasiswa(userId)
  const sejak = new Date(Date.now() - 30 * HARI_MS)

  const peminjamanInclude = {
    fasilitas: { select: { nama: true } },
    mahasiswa: { select: { nim: true, user: { select: { nama: true } } } },
  } as const

  const [fasilitasRows, jadwalRows, peminjamanRows, proposalRows] = await Promise.all([
    db.fasilitas.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } }),
    db.peminjamanFasilitas.findMany({
      where: { status: { not: "DITOLAK" }, tanggal: { gte: sejak } },
      include: peminjamanInclude,
      orderBy: [{ tanggal: "asc" }, { jamMulai: "asc" }],
    }),
    db.peminjamanFasilitas.findMany({
      where: { mahasiswaId: profil.id },
      include: peminjamanInclude,
      orderBy: { createdAt: "desc" },
    }),
    db.proposalKegiatan.findMany({
      where: { mahasiswaId: profil.id },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const proposal: ProposalDto[] = proposalRows.map((p) => ({
    id: p.id,
    mahasiswaId: p.mahasiswaId,
    namaMahasiswa: profil.nama,
    nim: profil.nim,
    organisasi: p.organisasi ?? "",
    namaAcara: p.namaAcara,
    deskripsi: p.deskripsi ?? "",
    tanggalMulai: tgl(p.tanggalMulai),
    tanggalSelesai: tgl(p.tanggalSelesai),
    tempat: p.tempat ?? "",
    estimasiBiaya: p.estimasiBiaya ?? 0,
    estimasiPeserta: p.estimasiPeserta ?? 0,
    filePdfNama: p.filePdfNama ?? "",
    filePdfUkuran: p.filePdfUkuran ?? 0,
    status: p.status,
    catatan: p.catatan ?? undefined,
    createdAt: p.createdAt.toISOString(),
  }))

  return {
    mahasiswa: { id: profil.id, nim: profil.nim, nama: profil.nama },
    fasilitas: fasilitasRows.map(toFasilitas),
    jadwalFasilitas: jadwalRows.map((r) => {
      const dto = toPeminjaman(r)
      return r.mahasiswaId === profil.id ? dto : samarkan(dto)
    }),
    peminjaman: peminjamanRows.map(toPeminjaman),
    proposal,
  }
}
