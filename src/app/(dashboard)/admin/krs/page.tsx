"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  ClipboardList,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  BookOpen,
  Calendar,
} from "lucide-react"
import { useAcademicStore, MahasiswaItem } from "@/lib/academic-store"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { StatCard } from "@/components/ui/stat-card"

export default function MonitoringKrsPage() {
  const { state, activePeriode, enrichedKelas } = useAcademicStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMhs, setSelectedMhs] = useState<MahasiswaItem | null>(null)

  // Students with KRS stats
  const mhsKrsStats = state.mahasiswa.map((mhs) => {
    const studentKrs = state.krs.filter(
      (k) => k.mahasiswaId === mhs.id && k.status === "DISETUJUI"
    )
    const enrolledClasses = studentKrs
      .map((k) => enrichedKelas.find((ek) => ek.id === k.kelasId))
      .filter(Boolean)

    const totalSks = enrolledClasses.reduce(
      (acc, c) => acc + (c?.mataKuliah?.sks || 0),
      0
    )

    return {
      mhs,
      enrolledClasses,
      totalSks,
      courseCount: enrolledClasses.length,
      hasEnrolled: enrolledClasses.length > 0,
    }
  })

  const totalMhs = mhsKrsStats.length
  const completedCount = mhsKrsStats.filter((s) => s.totalSks >= 18).length
  const partialCount = mhsKrsStats.filter(
    (s) => s.totalSks > 0 && s.totalSks < 18
  ).length
  const zeroCount = mhsKrsStats.filter((s) => s.totalSks === 0).length

  // Filtered List
  const filteredList = mhsKrsStats.filter((s) => {
    const q = searchQuery.toLowerCase()
    return (
      s.mhs.nama.toLowerCase().includes(q) ||
      s.mhs.nim.toLowerCase().includes(q) ||
      s.mhs.programStudi.toLowerCase().includes(q)
    )
  })

  // Enrolled courses for selected student modal
  const selectedStudentClasses = selectedMhs
    ? mhsKrsStats.find((s) => s.mhs.id === selectedMhs.id)?.enrolledClasses || []
    : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring KRS Mahasiswa"
        subtitle={`Pemantauan real-time pengisian kartu rencana studi mahasiswa untuk ${activePeriode?.nama || "Periode Aktif"}.`}
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mahasiswa Aktif"
          value={totalMhs}
          icon={Users}
          description="Terdaftar semester berjalan"
        />
        <StatCard
          title="KRS Selesai (≥ 18 SKS)"
          value={completedCount}
          icon={CheckCircle2}
          className="border-emerald-200/50"
          iconClassName="bg-emerald-50 text-emerald-700"
          trend={{
            value: Math.round((completedCount / (totalMhs || 1)) * 100),
            isPositive: true,
          }}
        />
        <StatCard
          title="KRS Parsial (< 18 SKS)"
          value={partialCount}
          icon={Clock}
          description="Masih dalam penyusunan"
        />
        <StatCard
          title="Belum Mengisi KRS"
          value={zeroCount}
          icon={ClipboardList}
          className="border-amber-200/50"
          iconClassName="bg-amber-50 text-amber-700"
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau program studi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Mahasiswa</th>
                <th className="px-6 py-4 font-semibold">Program Studi</th>
                <th className="px-6 py-4 font-semibold text-center">Mata Kuliah</th>
                <th className="px-6 py-4 font-semibold text-center">Total SKS</th>
                <th className="px-6 py-4 font-semibold text-center">Status KRS</th>
                <th className="px-6 py-4 font-semibold text-right">Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item, idx) => (
                <motion.tr
                  key={item.mhs.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center shrink-0">
                        {item.mhs.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.mhs.nama}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          NIM: {item.mhs.nim}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-800 font-medium text-xs">
                      {item.mhs.programStudi}
                    </span>
                    <span className="block text-slate-400 text-xs">
                      Angkatan {item.mhs.angkatan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-slate-800">
                      {item.courseCount} Matkul
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block font-bold text-xs px-2.5 py-1 rounded-full ${
                        item.totalSks >= 18
                          ? "bg-emerald-100 text-emerald-800"
                          : item.totalSks > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.totalSks} / 24 SKS
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge
                      variant={
                        item.totalSks >= 18
                          ? "success"
                          : item.totalSks > 0
                          ? "warning"
                          : "neutral"
                      }
                      size="sm"
                      dot
                    >
                      {item.totalSks >= 18
                        ? "Lengkap Disetujui"
                        : item.totalSks > 0
                        ? "Pengisian Parsial"
                        : "Belum Mengisi"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="h-3.5 w-3.5" />}
                      onClick={() => setSelectedMhs(item.mhs)}
                    >
                      Lihat KRS
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail KRS Mahasiswa */}
      <Modal
        isOpen={Boolean(selectedMhs)}
        onClose={() => setSelectedMhs(null)}
        maxWidth="2xl"
        title={`Rincian KRS: ${selectedMhs?.nama}`}
        description={`NIM: ${selectedMhs?.nim} • Program Studi: ${selectedMhs?.programStudi} • ${activePeriode?.nama}`}
        footer={
          <Button
            variant="outline"
            type="button"
            onClick={() => setSelectedMhs(null)}
          >
            Tutup
          </Button>
        }
      >
        {selectedStudentClasses.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            Mahasiswa ini belum mengambil mata kuliah di KRS periode ini.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {selectedStudentClasses.map((k, i) => (
                <div
                  key={k?.id || i}
                  className="py-3 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {k?.mataKuliah?.kode}
                      </span>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {k?.mataKuliah?.nama} (Kelas {k?.namaKelas})
                      </h4>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>Dosen: {k?.dosen?.nama}</span>
                      <span>•</span>
                      <span>Ruang: {k?.ruangan?.nama}</span>
                      <span>•</span>
                      <span>
                        {k?.hari}, {k?.jamMulai} - {k?.jamSelesai}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg shrink-0">
                    {k?.mataKuliah?.sks} SKS
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between font-bold text-sm text-slate-900">
              <span>Total Beban Studi:</span>
              <span className="text-emerald-700 font-extrabold text-base">
                {selectedStudentClasses.reduce(
                  (sum, c) => sum + (c?.mataKuliah?.sks || 0),
                  0
                )}{" "}
                SKS
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
