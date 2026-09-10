"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Plus,
  Edit2,
  CheckCircle2,
  Clock,
  Unlock,
  Lock,
  CalendarCheck,
  AlertCircle,
} from "lucide-react"
import { useAcademicStore, PeriodeAkademikItem } from "@/lib/academic-store"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { formatDate } from "@/lib/utils"

export default function PeriodePage() {
  const {
    state,
    activePeriode,
    addPeriode,
    updatePeriode,
    setActivePeriode,
    toggleKrsWindow,
  } = useAcademicStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPeriode, setEditingPeriode] = useState<PeriodeAkademikItem | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    semester: "Ganjil" as "Ganjil" | "Genap",
    tahunAjaran: "2025/2026",
    nama: "Ganjil 2025/2026",
    tanggalMulaiKRS: "2025-08-15",
    tanggalTutupKRS: "2025-09-30",
    tanggalMulaiKuliah: "2025-09-01",
    tanggalSelesaiKuliah: "2026-01-15",
    isActive: false,
    isKrsOpen: true,
  })

  const openAddModal = () => {
    setEditingPeriode(null)
    setFormData({
      semester: "Ganjil",
      tahunAjaran: "2025/2026",
      nama: "Ganjil 2025/2026",
      tanggalMulaiKRS: new Date().toISOString().split("T")[0],
      tanggalTutupKRS: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      tanggalMulaiKuliah: new Date().toISOString().split("T")[0],
      tanggalSelesaiKuliah: new Date(Date.now() + 120 * 86400000).toISOString().split("T")[0],
      isActive: false,
      isKrsOpen: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (p: PeriodeAkademikItem) => {
    setEditingPeriode(p)
    setFormData({
      semester: p.semester,
      tahunAjaran: p.tahunAjaran,
      nama: p.nama,
      tanggalMulaiKRS: p.tanggalMulaiKRS,
      tanggalTutupKRS: p.tanggalTutupKRS,
      tanggalMulaiKuliah: p.tanggalMulaiKuliah,
      tanggalSelesaiKuliah: p.tanggalSelesaiKuliah,
      isActive: p.isActive,
      isKrsOpen: p.isKrsOpen,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nama.trim()) return

    if (editingPeriode) {
      updatePeriode(editingPeriode.id, formData)
    } else {
      addPeriode(formData)
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Periode Akademik & Jendela KRS"
        subtitle="Kelola status semester aktif dan kontrol buka/tutup jendela KRS mahasiswa (FR-1.2)."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={openAddModal}
          >
            Buat Periode Baru
          </Button>
        }
      />

      {/* Active Period Highlight Card */}
      {activePeriode && (
        <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Subtle decoration circles */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-emerald-500/10 pointer-events-none blur-xl" />
          <div className="absolute left-1/3 bottom-0 -mb-10 w-40 h-40 rounded-full bg-teal-500/10 pointer-events-none blur-xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold tracking-wider uppercase">
                  Periode Aktif Saat Ini
                </span>
                <span className="text-xs text-slate-300">
                  Semester {activePeriode.semester} • TA {activePeriode.tahunAjaran}
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                {activePeriode.nama}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>
                    Jendela KRS:{" "}
                    <strong className="text-white">
                      {formatDate(activePeriode.tanggalMulaiKRS)} -{" "}
                      {formatDate(activePeriode.tanggalTutupKRS)}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarCheck className="h-3.5 w-3.5 text-teal-400" />
                  <span>
                    Masa Kuliah:{" "}
                    <strong className="text-white">
                      {formatDate(activePeriode.tanggalMulaiKuliah)} -{" "}
                      {formatDate(activePeriode.tanggalSelesaiKuliah)}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* KRS Window Control Button */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15">
              <div className="space-y-0.5 text-right">
                <div className="text-xs font-medium text-slate-300">
                  Status Jendela KRS
                </div>
                <div className="text-sm font-bold flex items-center justify-end gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      activePeriode.isKrsOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                    }`}
                  />
                  <span>
                    {activePeriode.isKrsOpen
                      ? "Sedang Terbuka (Bisa Ambil/Batal)"
                      : "Ditutup (Read-Only)"}
                  </span>
                </div>
              </div>

              <Button
                variant={activePeriode.isKrsOpen ? "danger" : "success"}
                size="sm"
                leftIcon={
                  activePeriode.isKrsOpen ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <Unlock className="h-3.5 w-3.5" />
                  )
                }
                onClick={() =>
                  toggleKrsWindow(activePeriode.id, !activePeriode.isKrsOpen)
                }
              >
                {activePeriode.isKrsOpen ? "Tutup KRS Sekarang" : "Buka KRS Sekarang"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table of Periods */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-sm">
            Riwayat Seluruh Periode Akademik
          </h3>
          <span className="text-xs text-slate-500">
            {state.periode.length} Periode Tersimpan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Periode</th>
                <th className="px-6 py-4 font-semibold text-center">Semester / TA</th>
                <th className="px-6 py-4 font-semibold">Jadwal Pengisian KRS</th>
                <th className="px-6 py-4 font-semibold">Masa Perkuliahan</th>
                <th className="px-6 py-4 font-semibold text-center">Jendela KRS</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.periode.map((p, idx) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          p.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">
                          {p.nama}
                        </span>
                        {p.isActive && (
                          <span className="ml-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-slate-700">
                      {p.semester}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {p.tahunAjaran}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    <div>Mulai: {formatDate(p.tanggalMulaiKRS)}</div>
                    <div>Tutup: {formatDate(p.tanggalTutupKRS)}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    <div>{formatDate(p.tanggalMulaiKuliah)} s/d</div>
                    <div>{formatDate(p.tanggalSelesaiKuliah)}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge
                      variant={p.isKrsOpen ? "success" : "neutral"}
                      size="sm"
                      dot
                    >
                      {p.isKrsOpen ? "KRS Terbuka" : "KRS Tutup"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge
                      variant={p.isActive ? "success" : "neutral"}
                      size="sm"
                    >
                      {p.isActive ? "Sedang Berjalan" : "Arsip"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!p.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActivePeriode(p.id)}
                        >
                          Set Aktif
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        title="Edit Periode"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Periode */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPeriode ? "Edit Periode Akademik" : "Buat Periode Akademik Baru"}
        description="Atur kalender akademik dan jendela tanggal pengisian KRS mahasiswa."
        footer={
          <>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button variant="primary" type="button" onClick={handleSubmit}>
              {editingPeriode ? "Simpan Perubahan" : "Simpan Periode"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => {
                  const sem = e.target.value as "Ganjil" | "Genap"
                  setFormData({
                    ...formData,
                    semester: sem,
                    nama: `${sem} ${formData.tahunAjaran}`,
                  })
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tahun Ajaran *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 2025/2026"
                value={formData.tahunAjaran}
                onChange={(e) => {
                  const ta = e.target.value
                  setFormData({
                    ...formData,
                    tahunAjaran: ta,
                    nama: `${formData.semester} ${ta}`,
                  })
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Periode Akademik *
            </label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/50 space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-emerald-700" />
              Jendela Waktu Pengisian KRS (FR-1.2)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tanggal Mulai KRS
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggalMulaiKRS}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggalMulaiKRS: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tanggal Tutup KRS
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggalTutupKRS}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggalTutupKRS: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tanggal Mulai Perkuliahan
              </label>
              <input
                type="date"
                required
                value={formData.tanggalMulaiKuliah}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalMulaiKuliah: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tanggal Selesai Perkuliahan
              </label>
              <input
                type="date"
                required
                value={formData.tanggalSelesaiKuliah}
                onChange={(e) =>
                  setFormData({ ...formData, tanggalSelesaiKuliah: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
