"use client"

import { motion } from "framer-motion"
import {
  Award,
  FileEdit,
  Users,
  CheckCircle,
  ArrowRight,
  Clock,
  AlertCircle,
} from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { MOCK_STATS } from "@/lib/mock-data"

import Link from "next/link"

const stats = MOCK_STATS.DIREKTORAT_KEMAHASISWAAN

export default function KemahasiswaanDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard Kemahasiswaan"
        subtitle="Kelola review beasiswa dan proposal kegiatan mahasiswa."
      >
        <div className="flex items-center gap-2">
          <Link
            href="/kemahasiswaan/beasiswa"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-700 transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            Review Beasiswa
          </Link>
          <Link
            href="/kemahasiswaan/approval"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approval Penerima
          </Link>
        </div>
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Program Beasiswa Pending"
          value={stats.programPending}
          icon={Award}
          description="Menunggu review"
          iconClassName="bg-amber-100 text-amber-600"
          delay={0}
        />
        <StatCard
          title="Proposal Pending"
          value={stats.proposalPending}
          icon={FileEdit}
          description="Menunggu persetujuan"
          iconClassName="bg-blue-100 text-blue-600"
          delay={1}
        />
        <StatCard
          title="Program Beasiswa Aktif"
          value={stats.totalProgramAktif}
          icon={CheckCircle}
          delay={2}
        />
        <StatCard
          title="Mahasiswa Penerima"
          value={stats.totalMahasiswaPenerima}
          icon={Users}
          description="Total penerima beasiswa aktif"
          iconClassName="bg-purple-100 text-purple-600"
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Reviews - Beasiswa */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card rounded-2xl border border-border/50 shadow-card"
        >
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              🏅 Review Program Beasiswa
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
              {stats.programPending} pending
            </span>
          </div>
          <div className="divide-y divide-border/30">
            {[
              {
                nama: "Program Beasiswa Kepemimpinan Muda 2026",
                mitra: "PT Beasiswa Nusantara",
                tanggal: "Hari ini",
              },
              {
                nama: "Beasiswa Unggulan Prestasi Nusantara",
                mitra: "PT Beasiswa Nusantara",
                tanggal: "Kemarin",
              },
              {
                nama: "Dana Hibah Skripsi Sains & Rekayasa",
                mitra: "Yayasan Sains & Inovasi Bangsa",
                tanggal: "3 hari lalu",
              },
            ].map((program, index) => (
              <Link
                key={program.nama}
                href="/kemahasiswaan/beasiswa"
                className="flex items-center gap-3 px-6 py-4 hover:bg-muted/30 transition-colors group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {program.nama}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {program.mitra} · Diajukan {program.tanggal}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Pending Reviews - Proposal */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card rounded-2xl border border-border/50 shadow-card"
        >
          <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              📋 Proposal Kegiatan Masuk
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
              {stats.proposalPending} pending
            </span>
          </div>
          <div className="divide-y divide-border/30">
            {[
              {
                nama: "Seminar Nasional IT 2026",
                pengaju: "Himpunan Informatika",
                tanggal: "9 Sep 2026",
              },
              {
                nama: "Workshop UI/UX Design",
                pengaju: "UKM Digital Creative",
                tanggal: "8 Sep 2026",
              },
              {
                nama: "Hackathon Internal",
                pengaju: "BEM Fakultas",
                tanggal: "7 Sep 2026",
              },
              {
                nama: "Lomba Programming",
                pengaju: "Himpunan Informatika",
                tanggal: "6 Sep 2026",
              },
            ].map((proposal, index) => (
              <motion.div
                key={proposal.nama}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 + 0.35 }}
                className="flex items-center gap-3 px-6 py-4 hover:bg-muted/30 transition-colors group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Clock className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {proposal.nama}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {proposal.pengaju} · {proposal.tanggal}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
