/** Bentuk respons modul beasiswa. Sejajar dengan tipe *Item di beasiswa-store agar UI tidak berubah. */

export type StatusProgramBeasiswa = "DRAF" | "MENUNGGU_REVIEW" | "PUBLISH" | "DITOLAK" | "DITUTUP"
export type StatusFinal = "DIPROSES" | "DITERIMA" | "DITOLAK"

export interface ProgramBeasiswaDto {
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
  createdAt: string
  updatedAt: string
}

export interface DokumenPendukungDto {
  id: string
  namaFile: string
  tipeFile: string
  ukuranBytes: number
  kategori: "KTM" | "TRANSKRIP" | "REKOMENDASI" | "LAINNYA"
  uploadedAt: string
}

/** Pendaftaran milik mahasiswa. Status/catatan Mitra tidak disertakan (FR-3.6). */
export interface PendaftaranBeasiswaDto {
  id: string
  programId: string
  mahasiswaId: string
  nim: string
  namaMahasiswa: string
  programStudi: string
  semester: number
  ipk: number
  motivationLetter: string
  dokumen: DokumenPendukungDto[]
  statusFinal: StatusFinal
  catatanFinal?: string
  tanggalDaftar: string
  updatedAt: string
}

export interface StatusBeasiswaDto {
  mahasiswa: {
    id: string
    nim: string
    nama: string
    programStudi: string
    semester: number
    ipk: number
  }
  /** Program berstatus PUBLISH ditambah program yang pernah didaftar user. */
  program: ProgramBeasiswaDto[]
  pendaftaran: PendaftaranBeasiswaDto[]
}
