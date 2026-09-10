"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  GraduationCap,
} from "lucide-react"
import { useAcademicStore, MataKuliahItem } from "@/lib/academic-store"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { EmptyState } from "@/components/ui/empty-state"

export default function MataKuliahPage() {
  const { state, enrichedKelas, addMataKuliah, updateMataKuliah, deleteMataKuliah } =
    useAcademicStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterSks, setFilterSks] = useState<string>("ALL")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMk, setEditingMk] = useState<MataKuliahItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MataKuliahItem | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    sks: 3,
    deskripsi: "",
    semesterPaket: 1,
    isActive: true,
  })

  const openAddModal = () => {
    setEditingMk(null)
    setFormData({
      kode: "",
      nama: "",
      sks: 3,
      deskripsi: "",
      semesterPaket: 1,
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (mk: MataKuliahItem) => {
    setEditingMk(mk)
    setFormData({
      kode: mk.kode,
      nama: mk.nama,
      sks: mk.sks,
      deskripsi: mk.deskripsi || "",
      semesterPaket: mk.semesterPaket || 1,
      isActive: mk.isActive,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.kode.trim() || !formData.nama.trim()) return

    if (editingMk) {
      updateMataKuliah(editingMk.id, formData)
    } else {
      addMataKuliah(formData)
    }
    setIsModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteMataKuliah(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  // Filter Mata Kuliah
  const filteredList = state.mataKuliah.filter((mk) => {
    const matchesSearch =
      mk.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mk.nama.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSks = filterSks === "ALL" || mk.sks === Number(filterSks)
    return matchesSearch && matchesSks
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Data Mata Kuliah"
        subtitle="Kelola katalog mata kuliah, kode resmi, dan bobot SKS program studi."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={openAddModal}
          >
            Tambah Mata Kuliah
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama matkul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Filter SKS:
          </span>
          <select
            value={filterSks}
            onChange={(e) => setFilterSks(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">Semua SKS</option>
            <option value="2">2 SKS</option>
            <option value="3">3 SKS</option>
            <option value="4">4 SKS</option>
            <option value="6">6 SKS</option>
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={BookOpen}
              title="Tidak ada mata kuliah ditemukan"
              description="Coba ubah kata kunci pencarian atau tambahkan mata kuliah baru."
              action={
                <Button variant="outline" size="sm" onClick={openAddModal}>
                  Tambah Baru
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Kode</th>
                  <th className="px-6 py-4 font-semibold">Nama Mata Kuliah</th>
                  <th className="px-6 py-4 font-semibold text-center">SKS</th>
                  <th className="px-6 py-4 font-semibold text-center">Semester</th>
                  <th className="px-6 py-4 font-semibold text-center">Kelas Aktif</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((mk, idx) => {
                  const classCount = enrichedKelas.filter(
                    (k) => k.mataKuliahId === mk.id
                  ).length

                  return (
                    <motion.tr
                      key={mk.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                          {mk.kode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{mk.nama}</p>
                          {mk.deskripsi && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {mk.deskripsi}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                          {mk.sks} SKS
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600 font-medium">
                        Semester {mk.semesterPaket || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {classCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {classCount} Kelas
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">0 Kelas</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant={mk.isActive ? "success" : "neutral"}
                          size="sm"
                          dot
                        >
                          {mk.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(mk)}
                            title="Edit Mata Kuliah"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(mk)}
                            title="Hapus Mata Kuliah"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMk ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}
        description="Pastikan kode mata kuliah unik dan bobot SKS sesuai kurikulum akademik."
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
              {editingMk ? "Simpan Perubahan" : "Tambah Mata Kuliah"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kode Mata Kuliah *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: IF301"
                value={formData.kode}
                onChange={(e) =>
                  setFormData({ ...formData, kode: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Bobot SKS *
              </label>
              <select
                value={formData.sks}
                onChange={(e) =>
                  setFormData({ ...formData, sks: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value={1}>1 SKS</option>
                <option value={2}>2 SKS</option>
                <option value={3}>3 SKS</option>
                <option value={4}>4 SKS</option>
                <option value={6}>6 SKS (Tugas Akhir / Skripsi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Mata Kuliah *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pemrograman Web Lanjut"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester Paket Rekomendasi
              </label>
              <select
                value={formData.semesterPaket}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    semesterPaket: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Mata Kuliah
              </label>
              <label className="flex items-center gap-2.5 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Aktif & Dapat Ditawarkan di KRS
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Deskripsi Silabus / Catatan
            </label>
            <textarea
              rows={3}
              placeholder="Deskripsi ringkas capaian pembelajaran..."
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData({ ...formData, deskripsi: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Mata Kuliah"
        description={`Apakah Anda yakin ingin menghapus mata kuliah "${deleteTarget?.nama}" (${deleteTarget?.kode})?`}
        footer={
          <>
            <Button
              variant="outline"
              type="button"
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </Button>
            <Button variant="danger" type="button" onClick={handleDeleteConfirm}>
              Hapus Permanen
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Mata kuliah yang dihapus tidak akan muncul lagi di daftar penawaran kelas.
        </p>
      </Modal>
    </div>
  )
}
