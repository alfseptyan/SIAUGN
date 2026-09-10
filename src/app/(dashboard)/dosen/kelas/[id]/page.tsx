"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Users,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  PenLine,
} from "lucide-react"
import Link from "next/link"
import {
  useAcademicStore,
  KomponenNilaiItem,
  SkalaNilaiItem,
  DEFAULT_KOMPONEN_NILAI,
  DEFAULT_SKALA_NILAI,
} from "@/lib/academic-store"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs } from "@/components/ui/tabs"

export default function DosenKelasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const unwrappedParams = React.use(params)
  const kelasId = unwrappedParams.id

  const {
    enrichedKelas,
    state,
    getKomponenByKelas,
    saveKomponenNilai,
    getSkalaByKelas,
    saveSkalaNilai,
    updateKelas,
  } = useAcademicStore()

  const currentKelas = enrichedKelas.find((k) => k.id === kelasId)
  const [activeTab, setActiveTab] = useState<string>("komponen")

  // State for Komponen Nilai (FR-1.6)
  const [komponenList, setKomponenList] = useState<KomponenNilaiItem[]>([])
  const [savedSuccessKomponen, setSavedSuccessKomponen] = useState(false)

  // State for Skala Nilai (FR-1.7)
  const [skalaList, setSkalaList] = useState<SkalaNilaiItem[]>([])
  const [savedSuccessSkala, setSavedSuccessSkala] = useState(false)

  // State for Ambang Kehadiran
  const [ambangKehadiran, setAmbangKehadiran] = useState<number>(75)
  const [savedSuccessAmbang, setSavedSuccessAmbang] = useState(false)

  useEffect(() => {
    if (kelasId) {
      setKomponenList(getKomponenByKelas(kelasId))
      setSkalaList(getSkalaByKelas(kelasId))
    }
  }, [kelasId])

  useEffect(() => {
    if (currentKelas) {
      setAmbangKehadiran(currentKelas.ambangKehadiranPersen || 75)
    }
  }, [currentKelas])

  if (!currentKelas) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Kelas tidak ditemukan.</p>
        <Link href="/dosen/kelas">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Kembali ke Daftar Kelas
          </Button>
        </Link>
      </div>
    )
  }

  // Komponen calculations
  const totalBobot = komponenList.reduce((sum, c) => sum + (c.bobotPersen || 0), 0)
  const isBobotValid = Math.abs(totalBobot - 100) < 0.01

  // Handle Komponen changes
  const addKomponen = () => {
    setKomponenList([
      ...komponenList,
      {
        id: `comp-${Date.now()}`,
        kelasId,
        nama: "Komponen Baru",
        bobotPersen: 10,
      },
    ])
  }

  const updateKomponenField = (
    index: number,
    field: keyof KomponenNilaiItem,
    value: any
  ) => {
    const updated = [...komponenList]
    updated[index] = { ...updated[index], [field]: value }
    setKomponenList(updated)
  }

  const removeKomponen = (index: number) => {
    setKomponenList(komponenList.filter((_, i) => i !== index))
  }

  const handleSaveKomponen = () => {
    if (!isBobotValid) return
    saveKomponenNilai(kelasId, komponenList)
    setSavedSuccessKomponen(true)
    setTimeout(() => setSavedSuccessKomponen(false), 2500)
  }

  // Handle Skala changes
  const updateSkalaField = (
    index: number,
    field: keyof SkalaNilaiItem,
    value: any
  ) => {
    const updated = [...skalaList]
    updated[index] = { ...updated[index], [field]: value }
    setSkalaList(updated)
  }

  const handleResetDefaultSkala = () => {
    setSkalaList(DEFAULT_SKALA_NILAI)
  }

  const handleSaveSkala = () => {
    saveSkalaNilai(kelasId, skalaList)
    setSavedSuccessSkala(true)
    setTimeout(() => setSavedSuccessSkala(false), 2500)
  }

  const handleSaveAmbang = () => {
    updateKelas(kelasId, { ambangKehadiranPersen: ambangKehadiran })
    setSavedSuccessAmbang(true)
    setTimeout(() => setSavedSuccessAmbang(false), 2500)
  }

  // Enrolled students in this class
  const enrolledStudents = state.krs
    .filter((entry) => entry.kelasId === kelasId && entry.status === "DISETUJUI")
    .map((entry) => state.mahasiswa.find((m) => m.id === entry.mahasiswaId))
    .filter(Boolean)

  const tabsConfig = [
    { id: "komponen", label: "Setup Komponen Nilai (FR-1.6)" },
    { id: "skala", label: "Setup Skala Nilai (FR-1.7)" },
    { id: "peserta", label: "Peserta Kelas", badge: enrolledStudents.length },
    { id: "kehadiran", label: "Ambang Kehadiran" },
  ]

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/dosen/kelas"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Kelas Saya</span>
        </Link>

        <Link href={`/dosen/nilai?kelasId=${kelasId}`}>
          <Button variant="primary" size="sm" leftIcon={<PenLine className="h-3.5 w-3.5" />}>
            Buka Lembar Penilaian Mahasiswa
          </Button>
        </Link>
      </div>

      {/* Class Info Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
              {currentKelas.mataKuliah?.kode}
            </span>
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
              Kelas {currentKelas.namaKelas}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • {currentKelas.mataKuliah?.sks} SKS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {currentKelas.mataKuliah?.nama}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-4 pt-1">
            <span>
              Jadwal: {currentKelas.hari}, {currentKelas.jamMulai} -{" "}
              {currentKelas.jamSelesai}
            </span>
            <span>•</span>
            <span>Ruang: {currentKelas.ruangan?.nama}</span>
            <span>•</span>
            <span>Dosen: {currentKelas.dosen?.nama}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Terdaftar</div>
            <div className="text-xl font-bold text-slate-900">
              {enrolledStudents.length} / {currentKelas.kuota}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        items={tabsConfig}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: Setup Komponen Nilai (FR-1.6) */}
      {activeTab === "komponen" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Komponen Penilaian & Bobot Persentase (FR-1.6)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tentukan instrumen penilaian (Tugas, Kuis, UTS, UAS, Praktikum) untuk kelas ini. Total bobot harus tepat 100%.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={addKomponen}
            >
              Tambah Komponen
            </Button>
          </div>

          {/* Bobot Meter */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Akumulasi Bobot:</span>
              <span
                className={
                  isBobotValid ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"
                }
              >
                {totalBobot}% / 100%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isBobotValid
                    ? "bg-emerald-500"
                    : totalBobot > 100
                    ? "bg-rose-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(totalBobot, 100)}%` }}
              />
            </div>
            {!isBobotValid && (
              <p className="text-2xs text-rose-600 font-medium flex items-center gap-1 pt-1">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {totalBobot < 100
                    ? `Kurang ${100 - totalBobot}% lagi untuk mencapai 100%.`
                    : `Kelebihan ${totalBobot - 100}%. Harap sesuaikan bobot.`}
                </span>
              </p>
            )}
          </div>

          {/* Component Input Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Nama Komponen Evaluasi</th>
                  <th className="px-4 py-3 w-40 text-center">Bobot (%)</th>
                  <th className="px-4 py-3 w-20 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {komponenList.map((comp, idx) => (
                  <tr key={comp.id || idx}>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={comp.nama}
                        onChange={(e) =>
                          updateKomponenField(idx, "nama", e.target.value)
                        }
                        placeholder="Contoh: Tugas Mandiri / Proyek Akhir"
                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="relative inline-block w-28">
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={comp.bobotPersen}
                          onChange={(e) =>
                            updateKomponenField(
                              idx,
                              "bobotPersen",
                              Number(e.target.value)
                            )
                          }
                          className="w-full pl-3 pr-7 py-1.5 text-sm text-center font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                          %
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={komponenList.length <= 1}
                        onClick={() => removeKomponen(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {savedSuccessKomponen ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Komponen nilai berhasil disimpan!
              </span>
            ) : <span />}

            <Button
              variant="primary"
              disabled={!isBobotValid}
              leftIcon={<Save className="h-4 w-4" />}
              onClick={handleSaveKomponen}
            >
              Simpan Komponen Nilai
            </Button>
          </div>
        </motion.div>
      )}

      {/* TAB 2: Setup Skala Konversi Nilai (FR-1.7) */}
      {activeTab === "skala" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Skala Konversi Nilai Huruf Khusus Kelas Ini (FR-1.7)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standar skala nilai dapat disesuaikan oleh dosen pengampu per kelas sesuai tingkat kesulitan materi perkuliahan.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={handleResetDefaultSkala}
            >
              Reset ke Standar Kampus
            </Button>
          </div>

          {/* Scale Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Nilai Huruf</th>
                  <th className="px-6 py-3 text-center">Skor Minimal</th>
                  <th className="px-6 py-3 text-center">Skor Maksimal</th>
                  <th className="px-6 py-3 text-center">Bobot Indeks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {skalaList.map((scale, idx) => (
                  <tr key={scale.id || idx}>
                    <td className="px-6 py-3">
                      <span className="font-bold text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg">
                        {scale.huruf}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        value={scale.skorMin}
                        onChange={(e) =>
                          updateSkalaField(idx, "skorMin", Number(e.target.value))
                        }
                        className="w-24 px-2.5 py-1 text-sm text-center font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </td>
                    <td className="px-6 py-3 text-center">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        value={scale.skorMax}
                        onChange={(e) =>
                          updateSkalaField(idx, "skorMax", Number(e.target.value))
                        }
                        className="w-24 px-2.5 py-1 text-sm text-center font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </td>
                    <td className="px-6 py-3 text-center text-xs text-slate-500 font-medium">
                      {scale.huruf === "A"
                        ? "4.0"
                        : scale.huruf === "AB"
                        ? "3.5"
                        : scale.huruf === "B"
                        ? "3.0"
                        : scale.huruf === "BC"
                        ? "2.5"
                        : scale.huruf === "C"
                        ? "2.0"
                        : scale.huruf === "D"
                        ? "1.0"
                        : "0.0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {savedSuccessSkala ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Skala konversi nilai berhasil disimpan!
              </span>
            ) : <span />}

            <Button
              variant="primary"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={handleSaveSkala}
            >
              Simpan Skala Nilai
            </Button>
          </div>
        </motion.div>
      )}

      {/* TAB 3: Peserta Kelas */}
      {activeTab === "peserta" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4"
        >
          <h3 className="text-lg font-bold text-slate-900">
            Daftar Mahasiswa Terdaftar ({enrolledStudents.length} Mahasiswa)
          </h3>

          {enrolledStudents.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              Belum ada mahasiswa yang mengambil kelas ini di KRS.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Nama Mahasiswa</th>
                    <th className="px-4 py-3">NIM</th>
                    <th className="px-4 py-3">Program Studi</th>
                    <th className="px-4 py-3 text-center">Angkatan</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrolledStudents.map((mhs) => (
                    <tr key={mhs?.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {mhs?.nama}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {mhs?.nim}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {mhs?.programStudi}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-600">
                        {mhs?.angkatan}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="success" size="sm">
                          Aktif
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 4: Ambang Kehadiran */}
      {activeTab === "kehadiran" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6 max-w-xl"
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Ambang Batas Kehadiran Minimum Mahasiswa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesuai FSD: ambang kehadiran diset oleh dosen per kelas sebagai syarat kelayakan mahasiswa mengikuti ujian akhir (UAS).
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Persentase Kehadiran Minimal (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={50}
                max={100}
                value={ambangKehadiran}
                onChange={(e) => setAmbangKehadiran(Number(e.target.value))}
                className="w-32 px-4 py-2 text-base font-bold text-center bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <span className="text-sm font-semibold text-slate-600">%</span>
            </div>
            <p className="text-xs text-slate-400">
              Standar universitas adalah 75%. Mahasiswa dengan kehadiran di bawah ambang ini akan ditandai otomatis saat presensi.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {savedSuccessAmbang ? (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Ambang kehadiran berhasil diperbarui!
              </span>
            ) : <span />}

            <Button
              variant="primary"
              leftIcon={<Save className="h-4 w-4" />}
              onClick={handleSaveAmbang}
            >
              Simpan Pengaturan
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
