"use client"

import { motion } from "framer-motion"
import {
  BookOpen,
  Users,
  QrCode,
  PenLine,
  ArrowRight,
  Clock,
  MapPin,
} from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { MOCK_STATS } from "@/lib/mock-data"

const stats = MOCK_STATS.DOSEN

export default function DosenDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard Dosen"
        subtitle="Kelola kelas, presensi, dan nilai mahasiswa Anda."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Kelas Saya"
          value={stats.kelasSaya}
          icon={BookOpen}
          description="Kelas aktif semester ini"
          delay={0}
        />
        <StatCard
          title="Total Mahasiswa"
          value={stats.totalMahasiswa}
          icon={Users}
          description="Di seluruh kelas"
          iconClassName="bg-blue-100 text-blue-600"
          delay={1}
        />
        <StatCard
          title="Sesi Presensi"
          value={stats.sesiPresensiHariIni}
          icon={QrCode}
          description="Jadwal hari ini"
          iconClassName="bg-amber-100 text-amber-600"
          delay={2}
        />
        <StatCard
          title="Input Nilai"
          value={`${stats.nilaiDiinput}/${stats.nilaiPerlu}`}
          icon={PenLine}
          description="Progress input nilai"
          iconClassName="bg-purple-100 text-purple-600"
          delay={3}
        />
      </div>

      {/* Kelas Aktif */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-2xl border border-border/50 shadow-card"
      >
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Kelas Aktif
          </h3>
          <span className="text-xs text-muted-foreground">
            Semester Ganjil 2025/2026
          </span>
        </div>
        <div className="divide-y divide-border/30">
          {stats.kelasAktif.map((kelas, index) => (
            <motion.div
              key={kelas.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 + 0.3 }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
                {kelas.kelas}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {kelas.mataKuliah}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {kelas.kode}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {kelas.jadwal}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {kelas.ruangan}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    {kelas.mahasiswa} mahasiswa
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
