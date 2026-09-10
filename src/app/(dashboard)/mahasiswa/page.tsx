"use client"

import { motion } from "framer-motion"
import {
  BookOpen,
  TrendingUp,
  QrCode,
  Award,
  Clock,
  MapPin,
  GraduationCap,
  Bell,
  ArrowRight,
  BarChart3,
} from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { MOCK_STATS } from "@/lib/mock-data"

const stats = MOCK_STATS.MAHASISWA

export default function MahasiswaDashboardPage() {
  return (
    <div>
      <PageHeader
        title={`Halo, Budi! 👋`}
        subtitle={`NIM ${stats.nim} · ${stats.programStudi} · Semester ${stats.semester}`}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="IPK"
          value={stats.ipk.toFixed(2)}
          icon={TrendingUp}
          description={`IPS terakhir: ${stats.ips.toFixed(2)}`}
          trend={{ value: 2.1, isPositive: true }}
          delay={0}
        />
        <StatCard
          title="Total SKS"
          value={stats.totalSKS}
          icon={BookOpen}
          description="SKS semester ini"
          iconClassName="bg-blue-100 text-blue-600"
          delay={1}
        />
        <StatCard
          title="Kehadiran"
          value={`${stats.kehadiran}%`}
          icon={QrCode}
          description="Rata-rata kehadiran"
          iconClassName="bg-amber-100 text-amber-600"
          delay={2}
        />
        <StatCard
          title="Beasiswa Aktif"
          value={stats.beasiswaAktif}
          icon={Award}
          description="Program berjalan"
          iconClassName="bg-purple-100 text-purple-600"
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jadwal Hari Ini */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border/50 shadow-card"
        >
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              📅 Jadwal Hari Ini
            </h3>
            <span className="text-xs text-muted-foreground">
              Rabu, 10 September 2026
            </span>
          </div>
          <div className="divide-y divide-border/30">
            {stats.jadwalHariIni.map((jadwal, index) => (
              <motion.div
                key={jadwal.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 + 0.3 }}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary-light flex flex-col items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-primary-700 mb-0.5" />
                  <span className="text-[10px] font-semibold text-primary-700">
                    {jadwal.jam.split(" - ")[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {jadwal.mataKuliah}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {jadwal.ruangan}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {jadwal.dosen}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {jadwal.jam}
                </span>
              </motion.div>
            ))}

            {stats.jadwalHariIni.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Tidak ada jadwal hari ini 🎉
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card rounded-2xl border border-border/50 shadow-card"
        >
          <div className="px-6 py-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">
              Aksi Cepat
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {[
              {
                label: "Scan Presensi",
                icon: QrCode,
                color: "text-primary-600",
                desc: "Scan QR Code kehadiran",
              },
              {
                label: "Lihat KRS",
                icon: BookOpen,
                color: "text-blue-600",
                desc: "Kartu Rencana Studi",
              },
              {
                label: "Lihat Nilai",
                icon: BarChart3,
                color: "text-amber-600",
                desc: "KHS & Transkrip",
              },
              {
                label: "Notifikasi",
                icon: Bell,
                color: "text-purple-600",
                desc: `${stats.notifikasiBaru} notifikasi baru`,
                badge: stats.notifikasiBaru,
              },
            ].map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <action.icon className={`w-4.5 h-4.5 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                {action.badge ? (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                    {action.badge}
                  </span>
                ) : (
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
