"use client"

import { motion } from "framer-motion"
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { ActivityFeed } from "@/components/ui/activity-feed"
import { MOCK_STATS, MOCK_ACTIVITIES } from "@/lib/mock-data"

const stats = MOCK_STATS.SUPER_ADMIN

export default function AdminDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Selamat datang kembali! Berikut ringkasan sistem hari ini."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Mahasiswa"
          value={stats.totalMahasiswa.toLocaleString("id-ID")}
          icon={Users}
          description="Mahasiswa aktif terdaftar"
          trend={{ value: 12, isPositive: true }}
          delay={0}
        />
        <StatCard
          title="Total Dosen"
          value={stats.totalDosen}
          icon={GraduationCap}
          iconClassName="bg-blue-100 text-blue-600"
          delay={1}
        />
        <StatCard
          title="Kelas Aktif"
          value={stats.totalKelasAktif}
          icon={BookOpen}
          description={`Periode ${stats.periodeAktif}`}
          iconClassName="bg-amber-100 text-amber-600"
          delay={2}
        />
        <StatCard
          title="KRS Terisi"
          value={`${stats.krsTerisi}%`}
          icon={Calendar}
          description="Dari total mahasiswa aktif"
          trend={{ value: 5, isPositive: true }}
          iconClassName="bg-purple-100 text-purple-600"
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-1 bg-card rounded-2xl border border-border/50 shadow-card"
        >
          <div className="px-6 py-4 border-b border-border/50">
            <h3 className="text-sm font-semibold text-foreground">
              Aksi Cepat
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {[
              {
                label: "Buka Periode Baru",
                icon: Calendar,
                color: "text-primary-600",
              },
              {
                label: "Tambah Kelas",
                icon: Plus,
                color: "text-blue-600",
              },
              {
                label: "Tambah Mata Kuliah",
                icon: BookOpen,
                color: "text-amber-600",
              },
              {
                label: "Lihat Rekap Nilai",
                icon: TrendingUp,
                color: "text-purple-600",
              },
            ].map((action) => (
              <button
                key={action.label}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left group cursor-pointer"
              >
                <action.icon className={`w-5 h-5 ${action.color}`} />
                <span className="text-sm font-medium text-foreground flex-1">
                  {action.label}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <ActivityFeed activities={MOCK_ACTIVITIES} />
        </div>
      </div>
    </div>
  )
}
