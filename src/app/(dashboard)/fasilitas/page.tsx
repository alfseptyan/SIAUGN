"use client"

import { motion } from "framer-motion"
import {
  Building2,
  CalendarCheck,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  MapPin,
} from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { MOCK_STATS } from "@/lib/mock-data"

const stats = MOCK_STATS.PENGELOLA_FASILITAS

export default function FasilitasDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard Fasilitas"
        subtitle="Kelola data fasilitas dan peminjaman."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Fasilitas"
          value={stats.totalFasilitas}
          icon={Building2}
          description={`${stats.fasilitasTersedia} tersedia`}
          delay={0}
        />
        <StatCard
          title="Peminjaman Pending"
          value={stats.peminjamanPending}
          icon={AlertCircle}
          description="Menunggu persetujuan"
          iconClassName="bg-amber-100 text-amber-600"
          delay={1}
        />
        <StatCard
          title="Peminjaman Hari Ini"
          value={stats.peminjamanHariIni}
          icon={CalendarCheck}
          iconClassName="bg-blue-100 text-blue-600"
          delay={2}
        />
        <StatCard
          title="Bulan Ini"
          value={stats.peminjamanBulanIni}
          icon={CheckCircle}
          description="Total peminjaman"
          iconClassName="bg-purple-100 text-purple-600"
          delay={3}
        />
      </div>

      {/* Pending Approvals */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-2xl border border-border/50 shadow-card"
      >
        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            🔔 Antrean Peminjaman
          </h3>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
            {stats.peminjamanPending} pending
          </span>
        </div>
        <div className="divide-y divide-border/30">
          {[
            {
              fasilitas: "Lab Komputer 2",
              pemohon: "Budi Santoso",
              tanggal: "12 Sep 2026",
              jam: "08:00 - 12:00",
              keperluan: "Praktikum Pemrograman Web",
            },
            {
              fasilitas: "Aula Utama",
              pemohon: "Himpunan Informatika",
              tanggal: "15 Sep 2026",
              jam: "13:00 - 17:00",
              keperluan: "Seminar Nasional IT",
            },
            {
              fasilitas: "Ruang Rapat Lt. 3",
              pemohon: "BEM Fakultas",
              tanggal: "11 Sep 2026",
              jam: "10:00 - 12:00",
              keperluan: "Rapat Koordinasi",
            },
            {
              fasilitas: "Lab Multimedia",
              pemohon: "UKM Digital Creative",
              tanggal: "13 Sep 2026",
              jam: "14:00 - 17:00",
              keperluan: "Workshop Desain",
            },
            {
              fasilitas: "Lapangan Basket",
              pemohon: "UKM Basket",
              tanggal: "14 Sep 2026",
              jam: "16:00 - 18:00",
              keperluan: "Latihan Rutin",
            },
          ].map((item, index) => (
            <motion.div
              key={item.fasilitas + item.tanggal}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 + 0.3 }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {item.fasilitas}
                  </p>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                    Menunggu
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    👤 {item.pemohon}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    {item.tanggal}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {item.jam}
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
