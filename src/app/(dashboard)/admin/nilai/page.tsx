"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
} from "lucide-react"
import { useAcademicStore, KelasItem } from "@/lib/academic-store"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { StatCard } from "@/components/ui/stat-card"

export default function RekapNilaiAdminPage() {
  const { state, activePeriode, enrichedKelas } = useAcademicStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedKelas, setSelectedKelas] = useState<KelasItem | null>(null)

  // Grade statistics per class
  const classGradeStats = enrichedKelas.map((k) => {
    const classGrades = state.nilai.filter((n) => n.kelasId === k.id)
    const totalEnrolled = k.terisi || 0

    let status: "LOCKED" | "DRAFT" | "EMPTY" = "EMPTY"
    if (classGrades.length > 0) {
      const allLocked = classGrades.every((g) => Boolean(g.lockedAt))
      status = allLocked ? "LOCKED" : "DRAFT"
    }

    // Distribution
    const dist: Record<string, number> = { A: 0, AB: 0, B: 0, BC: 0, C: 0, D: 0, E: 0 }
    for (const g of classGrades) {
      if (g.huruf && dist[g.huruf] !== undefined) {
        dist[g.huruf]++
      }
    }

    return {
      kelas: k,
      totalEnrolled,
      gradedCount: classGrades.length,
      status,
      distribution: dist,
      grades: classGrades,
    }
  })

  const totalClasses = classGradeStats.length
  const lockedCount = classGradeStats.filter((c) => c.status === "LOCKED").length
  const draftCount = classGradeStats.filter((c) => c.status === "DRAFT").length
  const emptyCount = classGradeStats.filter((c) => c.status === "EMPTY").length

  const filteredList = classGradeStats.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.kelas.mataKuliah?.nama.toLowerCase().includes(q) ||
      c.kelas.mataKuliah?.kode.toLowerCase().includes(q) ||
      c.kelas.dosen?.nama.toLowerCase().includes(q)
    )
  })

  // Detail student grades for modal
  const modalStudentList = selectedKelas
    ? state.krs
        .filter((k) => k.kelasId === selectedKelas.id && k.status === "DISETUJUI")
        .map((krs) => {
          const mhs = state.mahasiswa.find((m) => m.id === krs.mahasiswaId)
          const grade = state.nilai.find(
            (n) => n.kelasId === selectedKelas.id && n.mahasiswaId === krs.mahasiswaId
          )
          return { mhs, grade }
        })
    : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekapitulasi Nilai Akademik"
        subtitle={`Monitoring penginputan dan penguncian nilai perkuliahan untuk ${activePeriode?.nama || "Periode Aktif"}.`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Kelas"
          value={totalClasses}
          icon={FileSpreadsheet}
          description="Semester berjalan"
        />
        <StatCard
          title="Nilai Terkunci (Resmi)"
          value={lockedCount}
          icon={Lock}
          className="border-emerald-200/50"
          iconClassName="bg-emerald-50 text-emerald-700"
          trend={{
            value: Math.round((lockedCount / (totalClasses || 1)) * 100),
            isPositive: true,
          }}
        />
        <StatCard
          title="Draf Penilaian"
          value={draftCount}
          icon={Clock}
          className="border-amber-200/50"
          iconClassName="bg-amber-50 text-amber-700"
          description="Belum dikunci dosen"
        />
        <StatCard
          title="Belum Diinput"
          value={emptyCount}
          icon={Unlock}
          description="Menunggu dosen pengampu"
        />
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari mata kuliah atau nama dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Mata Kuliah & Kelas</th>
                <th className="px-6 py-4 font-semibold">Dosen Pengampu</th>
                <th className="px-6 py-4 font-semibold text-center">Peserta</th>
                <th className="px-6 py-4 font-semibold text-center">Status Nilai</th>
                <th className="px-6 py-4 font-semibold">Distribusi Huruf</th>
                <th className="px-6 py-4 font-semibold text-right">Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item, idx) => (
                <motion.tr
                  key={item.kelas.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900 bg-slate-100 text-emerald-800 border border-slate-200 h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                        {item.kelas.namaKelas}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {item.kelas.mataKuliah?.nama}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          {item.kelas.mataKuliah?.kode} • {item.kelas.mataKuliah?.sks} SKS
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900 text-xs block">
                      {item.kelas.dosen?.nama}
                    </span>
                    <span className="text-slate-400 text-2xs font-mono">
                      NIDN: {item.kelas.dosen?.nidn}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-slate-800">
                      {item.totalEnrolled} Mahasiswa
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge
                      variant={
                        item.status === "LOCKED"
                          ? "success"
                          : item.status === "DRAFT"
                          ? "warning"
                          : "neutral"
                      }
                      size="sm"
                      dot
                    >
                      {item.status === "LOCKED"
                        ? "Terkunci (Resmi)"
                        : item.status === "DRAFT"
                        ? "Draf Dosen"
                        : "Belum Diinput"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {item.gradedCount > 0 ? (
                      <div className="flex items-center gap-1.5 text-2xs font-mono">
                        <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                          A: {item.distribution.A}
                        </span>
                        <span className="bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200">
                          AB: {item.distribution.AB}
                        </span>
                        <span className="bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded border border-sky-200">
                          B: {item.distribution.B}
                        </span>
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Lain:{" "}
                          {item.distribution.BC +
                            item.distribution.C +
                            item.distribution.D +
                            item.distribution.E}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">
                        Belum ada skor
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Eye className="h-3.5 w-3.5" />}
                      onClick={() => setSelectedKelas(item.kelas)}
                    >
                      Lihat Nilai
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Nilai Mahasiswa */}
      <Modal
        isOpen={Boolean(selectedKelas)}
        onClose={() => setSelectedKelas(null)}
        maxWidth="2xl"
        title={`Rekap Nilai: ${selectedKelas?.mataKuliah?.nama} (${selectedKelas?.namaKelas})`}
        description={`Dosen Pengampu: ${selectedKelas?.dosen?.nama} • ${activePeriode?.nama}`}
        footer={
          <Button
            variant="outline"
            type="button"
            onClick={() => setSelectedKelas(null)}
          >
            Tutup
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-wider text-slate-500 font-semibold sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Mahasiswa</th>
                  <th className="px-4 py-2.5 text-center">Nilai Akhir</th>
                  <th className="px-4 py-2.5 text-center">Huruf Mutu</th>
                  <th className="px-4 py-2.5 text-center">Status KHS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modalStudentList.map(({ mhs, grade }) => (
                  <tr key={mhs?.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900">
                        {mhs?.nama}
                      </div>
                      <div className="text-slate-400 font-mono text-2xs">
                        {mhs?.nim}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center font-semibold text-slate-800">
                      {grade?.nilaiAkhirFinal ?? grade?.nilaiAkhirOtomatis ?? "-"}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {grade?.huruf ? (
                        <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {grade.huruf}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge
                        variant={grade?.lockedAt ? "success" : "neutral"}
                        size="sm"
                      >
                        {grade?.lockedAt ? "Terkunci" : "Draf"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  )
}
