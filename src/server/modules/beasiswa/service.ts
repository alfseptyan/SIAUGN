import { getIpk, getProfilMahasiswa } from "@/server/modules/akademik"
import { db } from "@/server/shared/db"
import type {
  DokumenPendukungDto,
  PendaftaranBeasiswaDto,
  ProgramBeasiswaDto,
  StatusBeasiswaDto,
  StatusFinal,
} from "./types"

const tgl = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "")

/**
 * FR-3.6: mahasiswa melihat DIPROSES sampai Direktorat Kemahasiswaan memutuskan.
 * Keputusan Direktorat hanya sah bila Mitra sudah merekomendasikan; selain itu tetap DIPROSES.
 */
function statusFinalUntukMahasiswa(statusMitra: string, statusFinal: StatusFinal): StatusFinal {
  return statusMitra === "DIREKOMENDASIKAN" ? statusFinal : "DIPROSES"
}

export async function getStatusPendaftaran(userId: string): Promise<StatusBeasiswaDto> {
  const [profil, ipk] = await Promise.all([getProfilMahasiswa(userId), getIpk(userId)])

  const pendaftaranRows = await db.pendaftaranBeasiswa.findMany({
    where: { mahasiswaId: profil.id },
    include: { dokumen: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  })

  const programRows = await db.programBeasiswa.findMany({
    where: {
      OR: [{ status: "PUBLISH" }, { id: { in: pendaftaranRows.map((p) => p.programId) } }],
    },
    include: { mitra: { select: { namaOrganisasi: true } } },
    orderBy: { createdAt: "asc" },
  })

  const program: ProgramBeasiswaDto[] = programRows.map((p) => ({
    id: p.id,
    mitraId: p.mitraId,
    mitraNama: p.mitra.namaOrganisasi,
    nama: p.nama,
    deskripsi: p.deskripsi ?? "",
    kriteria: p.kriteria ?? "",
    minimalIpk: p.minimalIpk,
    minimalSemester: p.minimalSemester,
    maksimalSemester: p.maksimalSemester,
    kuota: p.kuota,
    nominalPerSemester: p.nominalPerSemester,
    periodeMulai: tgl(p.periodeMulai),
    periodeSelesai: tgl(p.periodeSelesai),
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  const pendaftaran: PendaftaranBeasiswaDto[] = pendaftaranRows.map((p) => {
    const statusFinal = statusFinalUntukMahasiswa(p.statusMitra, p.statusFinal)
    const dokumen: DokumenPendukungDto[] = p.dokumen.map((d) => ({
      id: d.id,
      namaFile: d.namaFile,
      tipeFile: d.tipeFile,
      ukuranBytes: d.ukuranBytes,
      kategori: d.kategori,
      uploadedAt: d.createdAt.toISOString(),
    }))
    return {
      id: p.id,
      programId: p.programId,
      mahasiswaId: p.mahasiswaId,
      nim: profil.nim,
      namaMahasiswa: profil.nama,
      programStudi: profil.programStudi,
      semester: p.semester,
      ipk: p.ipk,
      motivationLetter: p.motivationLetter ?? "",
      dokumen,
      statusFinal,
      catatanFinal: statusFinal === "DIPROSES" ? undefined : (p.catatanFinal ?? undefined),
      tanggalDaftar: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }
  })

  return {
    mahasiswa: {
      id: profil.id,
      nim: profil.nim,
      nama: profil.nama,
      programStudi: profil.programStudi,
      semester: profil.semesterSekarang,
      ipk,
    },
    program,
    pendaftaran,
  }
}
