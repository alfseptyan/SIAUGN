/** Bentuk respons modul akademik. Sengaja sejajar dengan tipe *Item di academic-store agar UI tidak berubah. */

export interface MataKuliahDto {
  id: string
  kode: string
  nama: string
  sks: number
  deskripsi?: string
  semesterPaket?: number
  isActive: boolean
}

export interface RuanganDto {
  id: string
  nama: string
  kapasitas: number
  lokasi: string
  isActive: boolean
}

export interface DosenDto {
  id: string
  userId: string
  nidn: string
  nama: string
  homebase: string
}

export interface PeriodeDto {
  id: string
  nama: string
  semester: "Ganjil" | "Genap"
  tahunAjaran: string
  tanggalMulaiKRS: string
  tanggalTutupKRS: string
  tanggalMulaiKuliah: string
  tanggalSelesaiKuliah: string
  isActive: boolean
  isKrsOpen: boolean
}

export interface KelasDto {
  id: string
  mataKuliahId: string
  dosenId: string
  ruanganId: string
  periodeId: string
  namaKelas: string
  hari: string
  jamMulai: string
  jamSelesai: string
  kuota: number
  ambangKehadiranPersen: number
  mataKuliah: MataKuliahDto
  dosen: DosenDto
  ruangan: RuanganDto
  periode: PeriodeDto
  terisi: number
}

export interface KrsDto {
  id: string
  mahasiswaId: string
  kelasId: string
  periodeId: string
  status: "DRAFT" | "DISETUJUI" | "DIBATALKAN"
  tanggalDaftar: string
}

export interface ProfilMahasiswa {
  id: string
  userId: string
  nim: string
  nama: string
  angkatan: number
  programStudi: string
  semesterSekarang: number
  status: "AKTIF" | "CUTI" | "DO" | "LULUS"
}

export interface StatusKrsDto {
  mahasiswa: ProfilMahasiswa
  periode: PeriodeDto | null
  maxSks: number
  totalSks: number
  krs: KrsDto[]
  /** Katalog kelas periode aktif (dengan kuota terisi) untuk penyusunan KRS. */
  kelasTersedia: KelasDto[]
}

export interface JadwalDto {
  periode: PeriodeDto | null
  kelas: KelasDto[]
}

export interface RiwayatNilaiDto {
  id: string
  kodeMk: string
  namaMk: string
  sks: number
  semesterAmbil: number
  periodeNama: string
  nilaiHuruf: string
  bobotIndeks: number
}

export interface KhsMataKuliahDto {
  id: string
  kodeMk: string
  namaMk: string
  sks: number
  namaKelas: string
  dosen: string
  /** null bila nilai belum dikunci dosen, atau untuk riwayat semester lalu (tidak disimpan). */
  nilaiAkhir: number | null
  nilaiHuruf: string | null
  bobotIndeks: number
  isLocked: boolean
}

export interface NilaiIndeksDto {
  gpa: number
  totalSks: number
  totalBobotSks: number
}

export interface KhsDto {
  mahasiswa: ProfilMahasiswa
  semesterBerjalan: KhsMataKuliahDto[]
  riwayat: RiwayatNilaiDto[]
  khs: {
    semester: number
    semesterTersedia: number[]
    mataKuliah: KhsMataKuliahDto[]
    ips: NilaiIndeksDto
  }
  ipk: NilaiIndeksDto
  predikat: string
}
