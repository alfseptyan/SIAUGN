"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  DoorOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Building,
  GraduationCap,
} from "lucide-react"
import { useAcademicStore, RuanganItem } from "@/lib/academic-store"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { EmptyState } from "@/components/ui/empty-state"

export default function RuanganPage() {
  const { state, enrichedKelas, addRuangan, updateRuangan, deleteRuangan } =
    useAcademicStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRuangan, setEditingRuangan] = useState<RuanganItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RuanganItem | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    nama: "",
    kapasitas: 40,
    lokasi: "",
    isActive: true,
  })

  const openAddModal = () => {
    setEditingRuangan(null)
    setFormData({
      nama: "",
      kapasitas: 40,
      lokasi: "",
      isActive: true,
    })
    setIsModalOpen(true)
  }

  const openEditModal = (ruang: RuanganItem) => {
    setEditingRuangan(ruang)
    setFormData({
      nama: ruang.nama,
      kapasitas: ruang.kapasitas,
      lokasi: ruang.lokasi,
      isActive: ruang.isActive,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nama.trim()) return

    if (editingRuangan) {
      updateRuangan(editingRuangan.id, formData)
    } else {
      addRuangan(formData)
    }
    setIsModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteRuangan(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  const filteredList = state.ruangan.filter((r) => {
    const q = searchQuery.toLowerCase()
    return (
      r.nama.toLowerCase().includes(q) ||
      r.lokasi.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Data Ruangan"
        subtitle="Kelola ruang kuliah, kapasitas mahasiswa, dan lokasi gedung untuk penjadwalan kelas."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={openAddModal}
          >
            Tambah Ruangan
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama ruangan atau gedung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total: <span className="font-bold text-slate-900">{state.ruangan.length}</span> Ruangan Terdaftar
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={DoorOpen}
              title="Tidak ada ruangan ditemukan"
              description="Coba gunakan kata kunci lain atau daftarkan ruangan baru."
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
                  <th className="px-6 py-4 font-semibold">Nama Ruangan</th>
                  <th className="px-6 py-4 font-semibold">Gedung / Lokasi</th>
                  <th className="px-6 py-4 font-semibold text-center">Kapasitas</th>
                  <th className="px-6 py-4 font-semibold text-center">Jadwal Kelas</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((ruang, idx) => {
                  const scheduleCount = enrichedKelas.filter(
                    (k) => k.ruanganId === ruang.id
                  ).length

                  return (
                    <motion.tr
                      key={ruang.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/40">
                            <DoorOpen className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-slate-900">
                            {ruang.nama}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Building className="h-4 w-4 text-slate-400 shrink-0" />
                          <span>{ruang.lokasi || "Lokasi belum diset"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {ruang.kapasitas} Kursi
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {scheduleCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {scheduleCount} Jadwal Terisi
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Kosong / Tersedia</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant={ruang.isActive ? "success" : "danger"}
                          size="sm"
                          dot
                        >
                          {ruang.isActive ? "Siap Digunakan" : "Perbaikan / Tutup"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(ruang)}
                            title="Edit Ruangan"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(ruang)}
                            title="Hapus Ruangan"
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

      {/* Modal Add / Edit Ruangan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRuangan ? "Edit Ruangan" : "Tambah Ruangan Baru"}
        description="Data ruangan akan digunakan oleh TU saat plotting jadwal perkuliahan."
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
              {editingRuangan ? "Simpan Perubahan" : "Simpan Ruangan"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Ruangan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: R. 101 atau Lab Komputer 1"
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
                Kapasitas Kursi (Mahasiswa) *
              </label>
              <input
                type="number"
                min={5}
                max={500}
                required
                value={formData.kapasitas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kapasitas: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status Penggunaan
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
                  Aktif & Siap Digunakan
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Gedung & Lokasi Spesifik
            </label>
            <input
              type="text"
              placeholder="Contoh: Gedung A, Lantai 1, Sayap Timur"
              value={formData.lokasi}
              onChange={(e) =>
                setFormData({ ...formData, lokasi: e.target.value })
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
        title="Hapus Ruangan"
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.nama}"?`}
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
          Pastikan tidak ada jadwal kelas aktif yang sedang menggunakan ruangan ini.
        </p>
      </Modal>
    </div>
  )
}
