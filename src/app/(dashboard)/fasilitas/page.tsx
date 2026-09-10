"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Building2,
  CalendarCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Calendar,
  XCircle,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { useLayananStore, getStatusPeminjamanVariant } from "@/lib/layanan-store"

export default function FasilitasDashboardPage() {
  const { state } = useLayananStore()

  const totalFasilitas = state.fasilitas.length
  const fasilitasAktif = state.fasilitas.filter((f) => f.isActive).length
  const pendingCount = state.peminjaman.filter((p) => p.status === "MENUNGGU").length
  const approvedCount = state.peminjaman.filter((p) => p.status === "DISETUJUI").length
  const totalPeminjaman = state.peminjaman.length

  const latestPending = state.peminjaman
    .filter((p) => p.status === "MENUNGGU")
    .slice(0, 5)

  return (
    <div>
      <PageHeader
        title="Dashboard Pengelola Fasilitas"
        subtitle="Kelola data fasilitas kampus dan tinjau permintaan peminjaman dari mahasiswa."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 mt-6">
        {[
          {
            title: "Total Fasilitas",
            value: totalFasilitas,
            desc: `${fasilitasAktif} aktif tersedia`,
            icon: <Building2 className="w-5 h-5" />,
            iconBg: "bg-emerald-100 text-emerald-600",
            href: "/fasilitas/data",
          },
          {
            title: "Menunggu Approval",
            value: pendingCount,
            desc: "Permintaan baru masuk",
            icon: <AlertCircle className="w-5 h-5" />,
            iconBg: "bg-amber-100 text-amber-600",
            href: "/fasilitas/peminjaman",
          },
          {
            title: "Peminjaman Disetujui",
            value: approvedCount,
            desc: "Sudah dikonfirmasi",
            icon: <CheckCircle2 className="w-5 h-5" />,
            iconBg: "bg-sky-100 text-sky-600",
            href: "/fasilitas/peminjaman",
          },
          {
            title: "Total Permintaan",
            value: totalPeminjaman,
            desc: "Seluruh riwayat",
            icon: <CalendarCheck className="w-5 h-5" />,
            iconBg: "bg-purple-100 text-purple-600",
            href: "/fasilitas/kalender",
          },
        ].map((stat, i) => (
          <Link key={stat.title} href={stat.href}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card rounded-2xl border border-border/50 p-5 shadow-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}>{stat.icon}</div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">{stat.title}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Data Fasilitas", href: "/fasilitas/data", icon: <Building2 className="w-4 h-4" />, desc: "CRUD master data" },
          { label: "Antrean Peminjaman", href: "/fasilitas/peminjaman", icon: <CalendarCheck className="w-4 h-4" />, desc: "Review & approval" },
          { label: "Kalender Ketersediaan", href: "/fasilitas/kalender", icon: <Calendar className="w-4 h-4" />, desc: "Jadwal visual" },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border/50 shadow-card hover:border-primary/40 transition-all cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">{link.icon}</div>
            <div>
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{link.label}</span>
              <span className="text-[11px] text-muted-foreground block">{link.desc}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Pending Approvals Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-2xl border border-border/50 shadow-card"
      >
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">🔔 Antrean Peminjaman Terbaru</h3>
          <Link href="/fasilitas/peminjaman" className="text-xs font-semibold text-primary hover:underline cursor-pointer">
            Lihat Semua →
          </Link>
        </div>
        <div className="divide-y divide-border/30">
          {latestPending.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-sm font-semibold">Tidak ada peminjaman yang menunggu.</p>
            </div>
          )}
          {latestPending.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 + 0.3 }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{item.namaFasilitas}</p>
                  <Badge variant="warning" size="sm">Menunggu</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
                  <span>👤 {item.namaMahasiswa}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{item.tanggal}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.jamMulai} - {item.jamSelesai}</span>
                </div>
              </div>
              <Link href="/fasilitas/peminjaman" className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer">
                Tinjau
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
