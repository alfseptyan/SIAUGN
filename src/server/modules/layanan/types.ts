/** Bentuk respons modul layanan. Sejajar dengan tipe *Item di layanan-store agar UI tidak berubah. */

export type TipeFasilitas = "RUANGAN" | "LABORATORIUM" | "ALAT" | "AULA"
export type StatusPengajuan = "MENUNGGU" | "DISETUJUI" | "DITOLAK"

export interface FasilitasDto {
  id: string
  nama: string
  deskripsi: string
  tipe: TipeFasilitas
  kapasitas: number
  lokasi: string
  isActive: boolean
  createdAt: string
}

export interface PeminjamanDto {
  id: string
  mahasiswaId: string
  namaMahasiswa: string
  nim: string
  fasilitasId: string
  namaFasilitas: string
  tanggal: string
  jamMulai: string
  jamSelesai: string
  keperluan: string
  organisasi: string
  status: StatusPengajuan
  catatan?: string
  createdAt: string
}

export interface ProposalDto {
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
  filePdfUkuran: number
  status: StatusPengajuan
  catatan?: string
  createdAt: string
}

export interface StatusPengajuanDto {
  mahasiswa: { id: string; nim: string; nama: string }
  fasilitas: FasilitasDto[]
  /**
   * Slot terpakai (selain DITOLAK) untuk kalender dan cek bentrok.
   * Milik orang lain disamarkan: tanpa nama, keperluan, dan organisasi asli.
   */
  jadwalFasilitas: PeminjamanDto[]
  peminjaman: PeminjamanDto[]
  proposal: ProposalDto[]
}
