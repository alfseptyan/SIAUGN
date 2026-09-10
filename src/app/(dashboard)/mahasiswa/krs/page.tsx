"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClipboardList,
  Calendar,
  Clock,
  DoorOpen,
  Users,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  Search,
  Printer,
  ShieldAlert,
  GraduationCap,
} from "lucide-react"
import { useAcademicStore, KelasItem } from "@/lib/academic-store"
import { validateStudentKrsEnrollment } from "@/lib/academic-utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { formatDate } from "@/lib/utils"

export default function MahasiswaKrsPage() {
  const {
    state,
    activePeriode,
    enrichedKelas,
    enrollKrs,
    dropKrs,
  } = useAcademicStore()

  // Mahasiswa login: mhs-1 (Budi Santoso, NIM 220101001)
  const currentMahasiswaId = "mhs-1"
  const currentStudent = state.mahasiswa.find((m) => m.id === currentMahasiswaId)

  const [searchQuery, setSearchQuery] = useState("")
  const [activeSubTab, setActiveSubTab] = useState<"TERPILIH" | "PENATAAN">("TERPILIH")
  const [conflictModalMsg, setConflictModalMsg] = useState<string | null>(null)
  const [dropTargetKrs, setDropTargetKrs] = useState<{ id: string; nama: string } | null>(null)

  const isKrsOpen = activePeriode?.isKrsOpen ?? true

  // Current enrolled KRS items for this student in the active period
  const myKrsItems = useMemo(() => {
    return state.krs
      .filter(
        (k) =>
          k.mahasiswaId === currentMahasiswaId &&
          k.status === "DISETUJUI" &&
          k.periodeId === activePeriode?.id
      )
      .map((k) => ({
        ...k,
        kelasDetail: enrichedKelas.find((ek) => ek.id === k.kelasId),
      }))
  }, [state.krs, currentMahasiswaId, activePeriode, enrichedKelas])

  // Total SKS currently taken
  const currentTotalSks = useMemo(() => {
    return myKrsItems.reduce(
      (sum, item) => sum + (item.kelasDetail?.mataKuliah?.sks || 0),
      0
    )
  }, [myKrsItems])

  const maxSks = 24
  const remainingSks = Math.max(maxSks - currentTotalSks, 0)

  // Enrolled classes formatted for conflict checking
  const enrolledClassesForValidation = useMemo(() => {
    return myKrsItems
      .map((item) => {
        const k = item.kelasDetail
        if (!k || !k.mataKuliah) return null
        return {
          id: k.id,
          mataKuliahId: k.mataKuliahId,
          mataKuliahNama: k.mataKuliah.nama,
          sks: k.mataKuliah.sks,
          namaKelas: k.namaKelas,
          hari: k.hari,
          jamMulai: k.jamMulai,
          jamSelesai: k.jamSelesai,
        }
      })
      .filter(Boolean) as any[]
  }, [myKrsItems])

  // Handle taking a class (FR-1.4)
  const handleEnroll = (kelas: KelasItem) => {
    if (!isKrsOpen) {
      setConflictModalMsg("Jendela KRS saat ini sedang ditutup. Anda tidak dapat menambah atau mengubah kelas.")
      return
    }

    if (!kelas.mataKuliah) return

    // Run full business logic conflict checks
    const check = validateStudentKrsEnrollment(
      {
        id: kelas.id,
        mataKuliahId: kelas.mataKuliahId,
        mataKuliahNama: kelas.mataKuliah.nama,
        sks: kelas.mataKuliah.sks,
        namaKelas: kelas.namaKelas,
        hari: kelas.hari,
        jamMulai: kelas.jamMulai,
        jamSelesai: kelas.jamSelesai,
        kuota: kelas.kuota,
        terisi: kelas.terisi || 0,
      },
      enrolledClassesForValidation,
      maxSks
    )

    if (check.hasConflict) {
      setConflictModalMsg(check.message || "Gagal mengambil kelas karena terbentur aturan akademik.")
      return
    }

    enrollKrs(currentMahasiswaId, kelas.id)
  }

  // Handle dropping a class (FR-1.5)
  const handleDropConfirm = () => {
    if (!isKrsOpen) {
      setConflictModalMsg("Jendela KRS saat ini sedang ditutup. Pembatalan kelas tidak diperbolehkan.")
      return
    }
    if (dropTargetKrs) {
      dropKrs(dropTargetKrs.id)
      setDropTargetKrs(null)
    }
  }

  // Available classes list
  const availableClasses = enrichedKelas.filter((k) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      k.mataKuliah?.nama.toLowerCase().includes(q) ||
      k.mataKuliah?.kode.toLowerCase().includes(q) ||
      k.dosen?.nama.toLowerCase().includes(q)
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kartu Rencana Studi (KRS)"
        subtitle={`Penyusunan rencana studi semester berjalan ${activePeriode?.nama || ""}.`}
        action={
          <Button
            variant="outline"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={() => window.print()}
          >
            Cetak Draf KRS
          </Button>
        }
      />

      {/* KRS Period Window Alert Banner */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isKrsOpen
            ? "bg-emerald-50 border-emerald-200/70 text-emerald-900"
            : "bg-amber-50 border-amber-200/70 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-3">
          {isKrsOpen ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
          )}
          <div>
            <strong className="font-semibold block text-sm">
              {isKrsOpen
                ? "Jendela KRS Sedang Terbuka"
                : "Jendela KRS Telah Ditutup"}
            </strong>
            <span className="text-xs opacity-80">
              Periode Pengisian:{" "}
              {activePeriode
                ? `${formatDate(activePeriode.tanggalMulaiKRS)} s/d ${formatDate(
                    activePeriode.tanggalTutupKRS
                  )}`
                : "-"}
            </span>
          </div>
        </div>

        <Badge variant={isKrsOpen ? "success" : "warning"} size="md" dot>
          {isKrsOpen ? "Mode Edit Aktif" : "Mode Read-Only"}
        </Badge>
      </div>

      {/* SKS & Quota Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Beban SKS Diambil
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">
              {currentTotalSks}
            </span>
            <span className="text-slate-400 text-sm font-semibold">/ {maxSks} SKS</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(currentTotalSks / maxSks) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Sisa Kuota SKS
          </span>
          <div className="text-3xl font-extrabold text-slate-900">
            {remainingSks} <span className="text-sm font-normal text-slate-400">SKS</span>
          </div>
          <p className="text-2xs text-slate-400 mt-2">
            Maksimal 24 SKS per semester reguler
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Mata Kuliah
          </span>
          <div className="text-3xl font-extrabold text-slate-900">
            {myKrsItems.length} <span className="text-sm font-normal text-slate-400">Kelas</span>
          </div>
          <p className="text-2xs text-slate-400 mt-2">
            Status: Disetujui Dosen PA
          </p>
        </div>
      </div>

      {/* Sub Tab Switcher: Terpilih vs Ambil Kelas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("TERPILIH")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
            activeSubTab === "TERPILIH"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Kelas Terpilih di KRS ({myKrsItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("PENATAAN")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${
            activeSubTab === "PENATAAN"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          + Tambah / Cari Kelas Baru
        </button>
      </div>

      {/* SECTION 1: Enrolled Classes */}
      {activeSubTab === "TERPILIH" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {myKrsItems.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <ClipboardList className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-600">
                Anda belum mengambil mata kuliah untuk periode ini.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveSubTab("PENATAAN")}
              >
                Pilih Mata Kuliah Sekarang
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Mata Kuliah</th>
                    <th className="px-6 py-3.5 text-center">Kelas</th>
                    <th className="px-6 py-3.5 text-center">SKS</th>
                    <th className="px-6 py-3.5">Dosen Pengampu</th>
                    <th className="px-6 py-3.5">Jadwal Kuliah</th>
                    <th className="px-6 py-3.5">Ruangan</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myKrsItems.map((item, idx) => {
                    const k = item.kelasDetail
                    if (!k) return null

                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mr-2">
                            {k.mataKuliah?.kode}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {k.mataKuliah?.nama}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-800">
                            {k.namaKelas}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-800">
                          {k.mataKuliah?.sks}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-700">
                          {k.dosen?.nama}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="font-semibold text-slate-800">
                            {k.hari}
                          </div>
                          <div className="text-slate-400">
                            {k.jamMulai} - {k.jamSelesai}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-700">
                          {k.ruangan?.nama}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={!isKrsOpen}
                            onClick={() =>
                              setDropTargetKrs({
                                id: item.id,
                                nama: `${k.mataKuliah?.nama} (Kelas ${k.namaKelas})`,
                              })
                            }
                            title="Batalkan Kelas (FR-1.5)"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: Available Classes for Enrollment (FR-1.4) */}
      {activeSubTab === "PENATAAN" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari mata kuliah atau dosen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Sisa Kuota SKS Anda: <strong className="text-emerald-700 font-bold">{remainingSks} SKS</strong>
            </div>
          </div>

          {/* Classes Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Mata Kuliah & Kode</th>
                    <th className="px-6 py-3.5 text-center">Kelas</th>
                    <th className="px-6 py-3.5 text-center">SKS</th>
                    <th className="px-6 py-3.5">Dosen Pengampu</th>
                    <th className="px-6 py-3.5">Jadwal Perkuliahan</th>
                    <th className="px-6 py-3.5">Ruangan</th>
                    <th className="px-6 py-3.5 text-center">Sisa Kuota</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {availableClasses.map((kelas, idx) => {
                    const isEnrolled = myKrsItems.some(
                      (item) => item.kelasId === kelas.id
                    )
                    const isSameCourseEnrolled = myKrsItems.some(
                      (item) =>
                        item.kelasDetail?.mataKuliahId === kelas.mataKuliahId
                    )
                    const isFull = (kelas.terisi || 0) >= kelas.kuota

                    return (
                      <motion.tr
                        key={kelas.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.02 }}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mr-2">
                            {kelas.mataKuliah?.kode}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {kelas.mataKuliah?.nama}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-800">
                          {kelas.namaKelas}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-800">
                          {kelas.mataKuliah?.sks} SKS
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-700">
                          {kelas.dosen?.nama}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="font-semibold text-slate-800">
                            {kelas.hari}
                          </div>
                          <div className="text-slate-400">
                            {kelas.jamMulai} - {kelas.jamSelesai}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-700">
                          {kelas.ruangan?.nama}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`text-xs font-bold ${
                              isFull ? "text-rose-600" : "text-emerald-700"
                            }`}
                          >
                            {kelas.terisi || 0} / {kelas.kuota}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isEnrolled ? (
                            <Badge variant="success" size="sm">
                              Sudah Diambil
                            </Badge>
                          ) : isSameCourseEnrolled ? (
                            <span className="text-2xs text-slate-400 font-medium">
                              Sudah Kelas Lain
                            </span>
                          ) : isFull ? (
                            <Badge variant="danger" size="sm">
                              Penuh
                            </Badge>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={!isKrsOpen}
                              leftIcon={<Plus className="h-3.5 w-3.5" />}
                              onClick={() => handleEnroll(kelas)}
                            >
                              Ambil Kelas
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Peringatan Bentrok / Validasi KRS */}
      <Modal
        isOpen={Boolean(conflictModalMsg)}
        onClose={() => setConflictModalMsg(null)}
        title="Peringatan KRS"
        description="Sistem akademik mendeteksi ketidaksesuaian aturan pengambilan mata kuliah."
        footer={
          <Button
            variant="primary"
            type="button"
            onClick={() => setConflictModalMsg(null)}
          >
            Mengerti
          </Button>
        }
      >
        <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start gap-3 text-rose-900 text-xs">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block text-sm mb-1">
              Gagal Mengambil Kelas:
            </strong>
            <p className="leading-relaxed">{conflictModalMsg}</p>
          </div>
        </div>
      </Modal>

      {/* Modal Konfirmasi Pembatalan Kelas (FR-1.5) */}
      <Modal
        isOpen={Boolean(dropTargetKrs)}
        onClose={() => setDropTargetKrs(null)}
        title="Batalkan Pengambilan Kelas (FR-1.5)"
        description={`Apakah Anda yakin ingin membatalkan kelas ${dropTargetKrs?.nama}?`}
        footer={
          <>
            <Button
              variant="outline"
              type="button"
              onClick={() => setDropTargetKrs(null)}
            >
              Tidak, Kembali
            </Button>
            <Button variant="danger" type="button" onClick={handleDropConfirm}>
              Ya, Batalkan Kelas
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Selama jendela pengisian KRS masih dibuka, Anda dapat membatalkan dan mengganti kelas tanpa penalti akademik.
        </p>
      </Modal>
    </div>
  )
}
