"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  DoorOpen,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
} from "lucide-react"
import { useAcademicStore, KelasItem } from "@/lib/academic-store"
import { checkKelasConflict } from "@/lib/academic-utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { EmptyState } from "@/components/ui/empty-state"

const HARI_OPTIONS = [
  "SENIN",
  "SELASA",
  "RABU",
  "KAMIS",
  "JUMAT",
  "SABTU",
]

export default function ManajemenKelasPage() {
  const {
    state,
    activePeriode,
    enrichedKelas,
    addKelas,
    updateKelas,
    deleteKelas,
  } = useAcademicStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterHari, setFilterHari] = useState("ALL")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingKelas, setEditingKelas] = useState<KelasItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<KelasItem | null>(null)
  const [rosterKelas, setRosterKelas] = useState<KelasItem | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    mataKuliahId: "",
    dosenId: "",
    ruanganId: "",
    periodeId: "",
    namaKelas: "A",
    hari: "SENIN",
    jamMulai: "08:00",
    jamSelesai: "10:30",
    kuota: 40,
    ambangKehadiranPersen: 75,
  })

  // Open Add Modal
  const openAddModal = () => {
    setEditingKelas(null)
    setFormData({
      mataKuliahId: state.mataKuliah[0]?.id || "",
      dosenId: state.dosen[0]?.id || "",
      ruanganId: state.ruangan[0]?.id || "",
      periodeId: activePeriode?.id || state.periode[0]?.id || "",
      namaKelas: "A",
      hari: "SENIN",
      jamMulai: "08:00",
      jamSelesai: "10:30",
      kuota: 40,
      ambangKehadiranPersen: 75,
    })
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const openEditModal = (k: KelasItem) => {
    setEditingKelas(k)
    setFormData({
      mataKuliahId: k.mataKuliahId,
      dosenId: k.dosenId,
      ruanganId: k.ruanganId,
      periodeId: k.periodeId,
      namaKelas: k.namaKelas,
      hari: k.hari,
      jamMulai: k.jamMulai,
      jamSelesai: k.jamSelesai,
      kuota: k.kuota,
      ambangKehadiranPersen: k.ambangKehadiranPersen,
    })
    setIsModalOpen(true)
  }

  // Real-time Conflict Detector (FR-1.3)
  const conflictResult = useMemo(() => {
    if (!formData.ruanganId || !formData.dosenId || !formData.hari) {
      return { hasConflict: false }
    }

    return checkKelasConflict(
      {
        id: editingKelas?.id,
        ruanganId: formData.ruanganId,
        dosenId: formData.dosenId,
        hari: formData.hari,
        jamMulai: formData.jamMulai,
        jamSelesai: formData.jamSelesai,
      },
      enrichedKelas
    )
  }, [formData, editingKelas, enrichedKelas])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (conflictResult.hasConflict) return

    if (editingKelas) {
      updateKelas(editingKelas.id, formData)
    } else {
      addKelas(formData)
    }
    setIsModalOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteKelas(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  // Filtered List
  const filteredKelas = enrichedKelas.filter((k) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      k.mataKuliah?.nama.toLowerCase().includes(q) ||
      k.mataKuliah?.kode.toLowerCase().includes(q) ||
      k.dosen?.nama.toLowerCase().includes(q) ||
      k.ruangan?.nama.toLowerCase().includes(q)

    const matchesHari = filterHari === "ALL" || k.hari === filterHari
    return matchesSearch && matchesHari
  })

  // Students enrolled in selected roster class
  const enrolledStudents = useMemo(() => {
    if (!rosterKelas) return []
    const approvedKrs = state.krs.filter(
      (entry) => entry.kelasId === rosterKelas.id && entry.status === "DISETUJUI"
    )
    return approvedKrs
      .map((entry) => state.mahasiswa.find((m) => m.id === entry.mahasiswaId))
      .filter(Boolean)
  }, [rosterKelas, state.krs, state.mahasiswa])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Kelas & Penjadwalan"
        subtitle="Plotting kelas perkuliahan semester aktif dengan sistem deteksi bentrok ruangan & dosen otomatis (FR-1.3)."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={openAddModal}
          >
            Buat Kelas Baru
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari matkul, dosen, atau ruangan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
            Hari:
          </span>
          <select
            value={filterHari}
            onChange={(e) => setFilterHari(e.target.value)}
            className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">Semua Hari</option>
            {HARI_OPTIONS.map((hari) => (
              <option key={hari} value={hari}>
                {hari}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Class Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
        {filteredKelas.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={GraduationCap}
              title="Belum ada kelas perkuliahan"
              description="Buat kelas baru dan tentukan jadwal serta dosen pengampu."
              action={
                <Button variant="outline" size="sm" onClick={openAddModal}>
                  Buat Kelas
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Mata Kuliah & Kelas</th>
                  <th className="px-6 py-4 font-semibold">Dosen Pengampu</th>
                  <th className="px-6 py-4 font-semibold">Jadwal Perkuliahan</th>
                  <th className="px-6 py-4 font-semibold">Ruangan</th>
                  <th className="px-6 py-4 font-semibold text-center">Kuota Mahasiswa</th>
                  <th className="px-6 py-4 font-semibold text-center">Ambang Kehadiran</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKelas.map((k, idx) => {
                  const terisi = k.terisi || 0
                  const isFull = terisi >= k.kuota
                  const percentFilled = Math.min(
                    Math.round((terisi / k.kuota) * 100),
                    100
                  )

                  return (
                    <motion.tr
                      key={k.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-slate-900 bg-slate-100 text-emerald-800 border border-slate-200 h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                            {k.namaKelas}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {k.mataKuliah?.nama}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                              {k.mataKuliah?.kode} • {k.mataKuliah?.sks} SKS
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-800">
                          {k.dosen?.nama}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          NIDN: {k.dosen?.nidn}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs">
                          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{k.hari}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>
                            {k.jamMulai} - {k.jamSelesai}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800 text-xs">
                          <DoorOpen className="h-3.5 w-3.5 text-teal-600" />
                          <span>{k.ruangan?.nama}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {k.ruangan?.lokasi}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-block text-left w-32">
                          <div className="flex items-center justify-between text-xs font-semibold mb-1">
                            <span
                              className={
                                isFull ? "text-rose-600" : "text-emerald-700"
                              }
                            >
                              {terisi} / {k.kuota}
                            </span>
                            <span className="text-slate-400 text-2xs">
                              {percentFilled}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isFull ? "bg-rose-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${percentFilled}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                          Min. {k.ambangKehadiranPersen}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRosterKelas(k)}
                            title="Lihat Daftar Peserta"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                          >
                            <Users className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(k)}
                            title="Edit Kelas"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(k)}
                            title="Hapus Kelas"
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

      {/* Modal Add / Edit Kelas with Conflict Detector */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="2xl"
        title={editingKelas ? "Edit Kelas Perkuliahan" : "Buat Kelas Perkuliahan Baru"}
        description="Sistem akan otomatis mengecek bentrok jadwal ruangan dan dosen pengampu secara real-time."
        footer={
          <>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              type="button"
              disabled={conflictResult.hasConflict}
              onClick={handleSubmit}
            >
              {editingKelas ? "Simpan Perubahan" : "Buat Kelas"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Conflict Alert Banner */}
          {conflictResult.hasConflict ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5 shadow-xs"
            >
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-rose-900">
                  Terdeteksi Bentrok Jadwal!
                </strong>
                <span>{conflictResult.message}</span>
              </div>
            </motion.div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Jadwal aman: Tidak ada bentrok ruangan maupun dosen pengampu.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Mata Kuliah *
              </label>
              <select
                required
                value={formData.mataKuliahId}
                onChange={(e) =>
                  setFormData({ ...formData, mataKuliahId: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {state.mataKuliah.map((mk) => (
                  <option key={mk.id} value={mk.id}>
                    {mk.kode} - {mk.nama} ({mk.sks} SKS)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama / Seksi Kelas *
              </label>
              <input
                type="text"
                required
                placeholder="A / B / C"
                value={formData.namaKelas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    namaKelas: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Dosen Pengampu *
              </label>
              <select
                required
                value={formData.dosenId}
                onChange={(e) =>
                  setFormData({ ...formData, dosenId: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {state.dosen.map((dos) => (
                  <option key={dos.id} value={dos.id}>
                    {dos.nama} ({dos.homebase})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ruangan Perkuliahan *
              </label>
              <select
                required
                value={formData.ruanganId}
                onChange={(e) =>
                  setFormData({ ...formData, ruanganId: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                {state.ruangan.map((ru) => (
                  <option key={ru.id} value={ru.id}>
                    {ru.nama} (Kapasitas: {ru.kapasitas} Kursi)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time & Schedule */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Slot Waktu & Jadwal Perkuliahan
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Hari *
                </label>
                <select
                  value={formData.hari}
                  onChange={(e) =>
                    setFormData({ ...formData, hari: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {HARI_OPTIONS.map((hari) => (
                    <option key={hari} value={hari}>
                      {hari}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Jam Mulai *
                </label>
                <input
                  type="time"
                  required
                  value={formData.jamMulai}
                  onChange={(e) =>
                    setFormData({ ...formData, jamMulai: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Jam Selesai *
                </label>
                <input
                  type="time"
                  required
                  value={formData.jamSelesai}
                  onChange={(e) =>
                    setFormData({ ...formData, jamSelesai: e.target.value })
                  }
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kuota Maksimal Mahasiswa *
              </label>
              <input
                type="number"
                min={5}
                max={150}
                required
                value={formData.kuota}
                onChange={(e) =>
                  setFormData({ ...formData, kuota: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ambang Kehadiran Minimum (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={formData.ambangKehadiranPersen}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ambangKehadiranPersen: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Daftar Mahasiswa Terdaftar */}
      <Modal
        isOpen={Boolean(rosterKelas)}
        onClose={() => setRosterKelas(null)}
        maxWidth="xl"
        title={`Daftar Peserta: ${rosterKelas?.mataKuliah?.nama} (${rosterKelas?.namaKelas})`}
        description={`Total ${enrolledStudents.length} mahasiswa terdaftar resmi melalui pengisian KRS.`}
        footer={
          <Button
            variant="outline"
            type="button"
            onClick={() => setRosterKelas(null)}
          >
            Tutup
          </Button>
        }
      >
        {enrolledStudents.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            Belum ada mahasiswa yang mengambil kelas ini di KRS.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {enrolledStudents.map((mhs, i) => (
              <div
                key={mhs?.id || i}
                className="py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    {mhs?.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {mhs?.nama}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      NIM: {mhs?.nim} • Angkatan {mhs?.angkatan}
                    </p>
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  Aktif
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Kelas Perkuliahan"
        description={`Apakah Anda yakin ingin menghapus kelas ${deleteTarget?.mataKuliah?.nama} (${deleteTarget?.namaKelas})?`}
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
              Hapus Kelas
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Semua data KRS mahasiswa yang terhubung dengan kelas ini juga akan terhapus.
        </p>
      </Modal>
    </div>
  )
}
