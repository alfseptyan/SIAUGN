// Role dan tipe yang digunakan di seluruh aplikasi SIAKAD

export type UserRole =
  | "SUPER_ADMIN"
  | "DOSEN"
  | "MAHASISWA"
  | "DIREKTORAT_KEMAHASISWAAN"
  | "PENGELOLA_FASILITAS"
  | "MITRA_BEASISWA"

export interface SessionUser {
  id: string
  email: string
  nama: string
  role: UserRole
  avatarUrl?: string | null
}

// Label display untuk setiap role
export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin / Staff TU",
  DOSEN: "Dosen",
  MAHASISWA: "Mahasiswa",
  DIREKTORAT_KEMAHASISWAAN: "Direktorat Kemahasiswaan",
  PENGELOLA_FASILITAS: "Pengelola Fasilitas",
  MITRA_BEASISWA: "Mitra Beasiswa",
}

// Warna badge untuk setiap role
export const ROLE_COLORS: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  DOSEN: "bg-blue-100 text-blue-700",
  MAHASISWA: "bg-emerald-100 text-emerald-700",
  DIREKTORAT_KEMAHASISWAAN: "bg-amber-100 text-amber-700",
  PENGELOLA_FASILITAS: "bg-cyan-100 text-cyan-700",
  MITRA_BEASISWA: "bg-rose-100 text-rose-700",
}

// Dashboard path untuk redirect setelah login
export const ROLE_DASHBOARD: Record<UserRole, string> = {
  SUPER_ADMIN: "/admin",
  DOSEN: "/dosen",
  MAHASISWA: "/mahasiswa",
  DIREKTORAT_KEMAHASISWAAN: "/kemahasiswaan",
  PENGELOLA_FASILITAS: "/fasilitas",
  MITRA_BEASISWA: "/mitra",
}

// Menu items per role untuk sidebar
export interface MenuItem {
  label: string
  href: string
  icon: string // nama icon dari lucide-react
  badge?: number
}

export const ROLE_MENUS: Record<UserRole, MenuItem[]> = {
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { label: "Mata Kuliah", href: "/admin/mata-kuliah", icon: "BookOpen" },
    { label: "Ruangan", href: "/admin/ruangan", icon: "DoorOpen" },
    { label: "Periode Akademik", href: "/admin/periode", icon: "Calendar" },
    { label: "Manajemen Kelas", href: "/admin/kelas", icon: "GraduationCap" },
    { label: "Monitoring KRS", href: "/admin/krs", icon: "ClipboardList" },
    { label: "Rekap Nilai", href: "/admin/nilai", icon: "BarChart3" },
    { label: "Kelola Pengguna", href: "/admin/pengguna", icon: "Users" },
  ],
  DOSEN: [
    { label: "Dashboard", href: "/dosen", icon: "LayoutDashboard" },
    { label: "Kelas Saya", href: "/dosen/kelas", icon: "BookOpen" },
    { label: "Presensi", href: "/dosen/presensi", icon: "QrCode" },
    { label: "Input Nilai", href: "/dosen/nilai", icon: "PenLine" },
  ],
  MAHASISWA: [
    { label: "Dashboard", href: "/mahasiswa", icon: "LayoutDashboard" },
    { label: "KRS", href: "/mahasiswa/krs", icon: "ClipboardList" },
    { label: "Jadwal", href: "/mahasiswa/jadwal", icon: "Calendar" },
    { label: "Presensi", href: "/mahasiswa/presensi", icon: "QrCode" },
    { label: "KHS / Transkrip", href: "/mahasiswa/nilai", icon: "FileText" },
    { label: "Beasiswa", href: "/mahasiswa/beasiswa", icon: "Award" },
    { label: "Peminjaman Fasilitas", href: "/mahasiswa/fasilitas", icon: "Building2" },
    { label: "Proposal Kegiatan", href: "/mahasiswa/proposal", icon: "FileEdit" },
  ],
  DIREKTORAT_KEMAHASISWAAN: [
    { label: "Dashboard", href: "/kemahasiswaan", icon: "LayoutDashboard" },
    { label: "Review Program Beasiswa", href: "/kemahasiswaan/beasiswa", icon: "Award" },
    { label: "Approval Penerima", href: "/kemahasiswaan/approval", icon: "CheckCircle" },
    { label: "Proposal Kegiatan", href: "/kemahasiswaan/proposal", icon: "FileEdit" },
  ],
  PENGELOLA_FASILITAS: [
    { label: "Dashboard", href: "/fasilitas", icon: "LayoutDashboard" },
    { label: "Data Fasilitas", href: "/fasilitas/data", icon: "Building2" },
    { label: "Peminjaman", href: "/fasilitas/peminjaman", icon: "CalendarCheck" },
    { label: "Kalender", href: "/fasilitas/kalender", icon: "Calendar" },
  ],
  MITRA_BEASISWA: [
    { label: "Dashboard", href: "/mitra", icon: "LayoutDashboard" },
    { label: "Program Saya", href: "/mitra/program", icon: "Award" },
    { label: "Pendaftar", href: "/mitra/pendaftar", icon: "Users" },
  ],
}
