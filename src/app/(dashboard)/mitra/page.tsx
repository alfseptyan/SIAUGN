"use client"

import { motion } from "framer-motion"
import {
  Award,
  Users,
  Clock,
  FileText,
  ArrowRight,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { MOCK_STATS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const stats = MOCK_STATS.MITRA_BEASISWA

export default function MitraDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard Mitra"
        subtitle="Kelola program beasiswa dan seleksi kandidat."
      >
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-700 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          Program Baru
        </button>
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Program Saya"
          value={stats.programSaya}
          icon={Award}
          description={`${stats.programAktif} aktif, ${stats.programDraft} draft`}
          delay={0}
        />
        <StatCard
          title="Total Pendaftar"
          value={stats.totalPendaftar}
          icon={Users}
          description="Di semua program"
          iconClassName="bg-blue-100 text-blue-600"
          delay={1}
        />
        <StatCard
          title="Keputusan Pending"
          value={stats.keputusanPending}
          icon={Clock}
          description="Perlu diproses"
          iconClassName="bg-amber-100 text-amber-600"
          delay={2}
        />
        <StatCard
          title="Program Aktif"
          value={stats.programAktif}
          icon={CheckCircle}
          description="Sedang berjalan"
          iconClassName="bg-purple-100 text-purple-600"
          delay={3}
        />
      </div>

      {/* Programs Overview */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-2xl border border-border/50 shadow-card"
      >
        <div className="px-6 py-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">
            Program Beasiswa Saya
          </h3>
        </div>
        <div className="divide-y divide-border/30">
          {[
            {
              nama: "Beasiswa Unggulan Nusantara 2026",
              status: "PUBLISH",
              pendaftar: 89,
              kuota: 20,
              pending: 30,
            },
            {
              nama: "Beasiswa Riset & Inovasi",
              status: "PUBLISH",
              pendaftar: 67,
              kuota: 15,
              pending: 12,
            },
            {
              nama: "Program Magang Berbeasiswa",
              status: "DRAF",
              pendaftar: 0,
              kuota: 10,
              pending: 0,
            },
          ].map((program, index) => (
            <motion.div
              key={program.nama}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 + 0.3 }}
              className="flex items-center gap-4 px-6 py-5 hover:bg-muted/30 transition-colors group cursor-pointer"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  program.status === "PUBLISH"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {program.nama}
                  </p>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-full font-medium",
                      program.status === "PUBLISH"
                        ? "bg-success-light text-success"
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {program.status === "PUBLISH" ? "Aktif" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    {program.pendaftar} pendaftar
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="w-3.5 h-3.5" />
                    Kuota: {program.kuota}
                  </span>
                  {program.pending > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {program.pending} perlu diputuskan
                    </span>
                  )}
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
