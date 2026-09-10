"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  QrCode,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  FileSpreadsheet,
  Printer,
  Download,
  Eye,
  Plus,
  XCircle,
  History,
} from "lucide-react"
import { useAcademicStore } from "@/lib/academic-store"
import {
  usePresensiStore,
  StatusPresensiType,
  SesiPresensiItem,
  PresensiItem,
} from "@/lib/presensi-store"
import {
  createQrPayload,
  calculateAttendanceMetrics,
  exportToCsv,
} from "@/lib/presensi-utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { Tabs } from "@/components/ui/tabs"
import { QrDisplay } from "@/components/presensi/qr-display"

export default function DosenPresensiPage() {
  const { enrichedKelas, state: academicState } = useAcademicStore()
  const {
    state: presensiState,
    openNewSesi,
    refreshTokenSesi,
    closeSesi,
    markManualPresensi,
    cancelPresensiCurang,
  } = usePresensiStore()

  // Dosen login: dos-1 (Dr. Ahmad Fauzi)
  const currentDosenId = "dos-1"
  const myClasses = enrichedKelas.filter((k) => k.dosenId === currentDosenId)

  const [activeTab, setActiveTab] = useState<string>("sesi")
  const [selectedKelasId, setSelectedKelasId] = useState<string>(
    myClasses[0]?.id || ""
  )

  // Buka Sesi Form State
  const [pertemuanKe, setPertemuanKe] = useState<number>(6)
  const [judulMateri, setJudulMateri] = useState<string>("")
  const [isNewSesiModalOpen, setIsNewSesiModalOpen] = useState<boolean>(false)

  // Fraud cancellation modal state
  const [fraudTarget, setFraudTarget] = useState<{
    sesiId: string
    mahasiswaId: string
    mahasiswaNama: string
  } | null>(null)
  const [fraudReason, setFraudReason] = useState<string>("")

  const selectedKelas = enrichedKelas.find((k) => k.id === selectedKelasId)

  // Active session for the selected class
  const activeSesi = useMemo(() => {
    return (
      presensiState.sesi.find(
        (s) => s.kelasId === selectedKelasId && s.isActive
      ) || null
    )
  }, [presensiState.sesi, selectedKelasId])

  // Students enrolled in this class
  const enrolledStudents = useMemo(() => {
    if (!selectedKelasId) return []
    return academicState.krs
      .filter((k) => k.kelasId === selectedKelasId && k.status === "DISETUJUI")
      .map((k) => academicState.mahasiswa.find((m) => m.id === k.mahasiswaId))
      .filter(Boolean) as any[]
  }, [selectedKelasId, academicState.krs, academicState.mahasiswa])

  // Presensi records for active session
  const activeSessionPresensi = useMemo(() => {
    if (!activeSesi) return []
    return presensiState.presensi.filter((p) => p.sesiId === activeSesi.id)
  }, [activeSesi, presensiState.presensi])

  // Handler: Open new session
  const handleOpenSesiSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedKelasId) return
    openNewSesi(selectedKelasId, pertemuanKe, judulMateri, 45)
    setIsNewSesiModalOpen(false)
    setJudulMateri("")
  }

  // Handler: Refresh token
  const handleTokenExpire = () => {
    if (activeSesi) {
      refreshTokenSesi(activeSesi.id)
    }
  }

  // Handler: Cancel presensi fraud
  const handleConfirmFraud = () => {
    if (fraudTarget && fraudReason.trim()) {
      cancelPresensiCurang(
        fraudTarget.sesiId,
        fraudTarget.mahasiswaId,
        fraudTarget.mahasiswaNama,
        fraudReason,
        "Dr. Ahmad Fauzi, M.Kom."
      )
      setFraudTarget(null)
      setFraudReason("")
    }
  }

  // Sessions for this class (all meetings held)
  const classAllSessions = useMemo(() => {
    return presensiState.sesi
      .filter((s) => s.kelasId === selectedKelasId)
      .sort((a, b) => a.pertemuanKe - b.pertemuanKe)
  }, [presensiState.sesi, selectedKelasId])

  // Export Matrix to CSV (FR-2.7)
  const handleExportCsv = () => {
    if (!selectedKelas) return

    const headers = [
      "No",
      "NIM",
      "Nama Mahasiswa",
      ...classAllSessions.map((s) => `P-${s.pertemuanKe}`),
      "Total Hadir",
      "Total Izin",
      "Total Sakit",
      "Total Alfa",
      "Persentase Kehadiran (%)",
      "Status Kelayakan UAS",
    ]

    const rows = enrolledStudents.map((mhs, idx) => {
      const studentRecords = classAllSessions.map((s) => {
        const p = presensiState.presensi.find(
          (item) => item.sesiId === s.id && item.mahasiswaId === mhs.id
        )
        return p ? p.status.charAt(0) : "A"
      })

      const studentAllPresensi = classAllSessions.map((s) => {
        return (
          presensiState.presensi.find(
            (item) => item.sesiId === s.id && item.mahasiswaId === mhs.id
          ) || { status: "ALFA" as const }
        )
      })

      const metrics = calculateAttendanceMetrics(
        studentAllPresensi,
        classAllSessions.length,
        selectedKelas.ambangKehadiranPersen || 75
      )

      return [
        idx + 1,
        mhs.nim,
        mhs.nama,
        ...studentRecords,
        metrics.totalHadir,
        metrics.totalIzin,
        metrics.totalSakit,
        metrics.totalAlfa,
        `${metrics.persentaseKehadiran}%`,
        metrics.isMemenuhiSyarat ? "Memenuhi Syarat" : "TIDAK MEMENUHI SYARAT",
      ]
    })

    exportToCsv(
      `Rekap_Presensi_${selectedKelas.mataKuliah?.kode}_Kelas_${selectedKelas.namaKelas}`,
      headers,
      rows
    )
  }

  const tabsConfig = [
    { id: "sesi", label: "Sesi Pertemuan & QR Code (FR-2.1)" },
    { id: "rekap", label: "Rekapitulasi & Ambang Batas (FR-2.6)" },
    { id: "audit", label: "Log Audit Kecurangan (FR-2.5)", badge: presensiState.logs.length },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Presensi Digital Mahasiswa"
        subtitle="Manajemen presensi perkuliahan berbasis Dynamic QR Code, pencatatan manual, dan penindakan kecurangan (FR-2.1 s/d FR-2.7)."
        action={
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsNewSesiModalOpen(true)}
          >
            Buka Sesi Pertemuan Baru
          </Button>
        }
      />

      {/* Class Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">
            Pilih Kelas Ampuan:
          </label>
          <select
            value={selectedKelasId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            className="text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer w-full sm:w-80"
          >
            {myClasses.map((k) => (
              <option key={k.id} value={k.id}>
                {k.mataKuliah?.kode} - {k.mataKuliah?.nama} (Kelas {k.namaKelas})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-600" />
            <span>{enrolledStudents.length} Mahasiswa Terdaftar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-teal-600" />
            <span>Ambang Kehadiran: {selectedKelas?.ambangKehadiranPersen || 75}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs items={tabsConfig} activeId={activeTab} onChange={setActiveTab} />

      {/* TAB 1: Sesi Pertemuan & QR Code (FR-2.1, FR-2.3, FR-2.4) */}
      {activeTab === "sesi" && (
        <div className="space-y-6">
          {activeSesi ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: QR Code Display Proyektor */}
              <div className="lg:col-span-5 space-y-4">
                <QrDisplay
                  payload={createQrPayload(
                    activeSesi.id,
                    activeSesi.kelasId,
                    activeSesi.pertemuanKe,
                    activeSesi.tokenQr
                  )}
                  token={activeSesi.tokenQr}
                  expirySeconds={activeSesi.refreshIntervalSeconds || 45}
                  onTokenExpire={handleTokenExpire}
                  onManualRefresh={handleTokenExpire}
                />

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center space-y-2">
                  <div className="text-xs text-slate-500">
                    Sesi:{" "}
                    <strong className="text-slate-900">
                      Pertemuan Ke-{activeSesi.pertemuanKe}
                    </strong>{" "}
                    • {activeSesi.judulMateri}
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() => closeSesi(activeSesi.id)}
                  >
                    Tutup Sesi Perkuliahan
                  </Button>
                </div>
              </div>

              {/* Right Column: Live Attendee List & Manual Attendance */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Daftar Hadir Sesi Ini ({enrolledStudents.length} Mahasiswa)
                    </h3>
                    <p className="text-2xs text-slate-500">
                      Data otomatis ter-update saat mahasiswa memindai QR Code.
                    </p>
                  </div>

                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Hadir:{" "}
                    {
                      activeSessionPresensi.filter((p) => p.status === "HADIR")
                        .length
                    }{" "}
                    / {enrolledStudents.length}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[540px] overflow-y-auto">
                  {enrolledStudents.map((mhs) => {
                    const presensiRecord = activeSessionPresensi.find(
                      (p) => p.mahasiswaId === mhs.id
                    )
                    const status: StatusPresensiType =
                      presensiRecord?.status || "ALFA"
                    const metode = presensiRecord?.metode
                    const waktuScan = presensiRecord?.waktuScan
                    const isBatal = Boolean(presensiRecord?.dibatalkanOleh)

                    return (
                      <div
                        key={mhs.id}
                        className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                          status === "HADIR"
                            ? "bg-emerald-50/30"
                            : "hover:bg-slate-50/60"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">
                              {mhs.nama}
                            </span>
                            <span className="font-mono text-2xs text-slate-400">
                              {mhs.nim}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-2xs text-slate-500">
                            {waktuScan ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {new Date(waktuScan).toLocaleTimeString("id-ID")}{" "}
                                (via {metode})
                              </span>
                            ) : (
                              <span className="text-slate-400">Belum presensi</span>
                            )}
                            {isBatal && (
                              <span className="text-rose-600 font-bold">
                                • [Dibatalkan Curang: {presensiRecord?.alasanBatal}]
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Toggle Buttons & Fraud Action */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              markManualPresensi(
                                activeSesi.id,
                                mhs.id,
                                "HADIR",
                                "Dr. Ahmad Fauzi"
                              )
                            }
                            className={`px-2.5 py-1 text-2xs font-bold rounded-lg cursor-pointer transition-colors ${
                              status === "HADIR"
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            Hadir
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              markManualPresensi(
                                activeSesi.id,
                                mhs.id,
                                "IZIN",
                                "Dr. Ahmad Fauzi"
                              )
                            }
                            className={`px-2.5 py-1 text-2xs font-bold rounded-lg cursor-pointer transition-colors ${
                              status === "IZIN"
                                ? "bg-amber-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            Izin
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              markManualPresensi(
                                activeSesi.id,
                                mhs.id,
                                "SAKIT",
                                "Dr. Ahmad Fauzi"
                              )
                            }
                            className={`px-2.5 py-1 text-2xs font-bold rounded-lg cursor-pointer transition-colors ${
                              status === "SAKIT"
                                ? "bg-sky-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            Sakit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              markManualPresensi(
                                activeSesi.id,
                                mhs.id,
                                "ALFA",
                                "Dr. Ahmad Fauzi"
                              )
                            }
                            className={`px-2.5 py-1 text-2xs font-bold rounded-lg cursor-pointer transition-colors ${
                              status === "ALFA"
                                ? "bg-rose-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            Alfa
                          </button>

                          {/* Action Batalkan Curang (FR-2.4) */}
                          {status === "HADIR" && (
                            <button
                              type="button"
                              onClick={() =>
                                setFraudTarget({
                                  sesiId: activeSesi.id,
                                  mahasiswaId: mhs.id,
                                  mahasiswaNama: mhs.nama,
                                })
                              }
                              title="Tandai Curang / Batalkan Presensi (FR-2.4)"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                            >
                              <ShieldAlert className="h-4 w-4 text-rose-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <QrCode className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Belum Ada Sesi Presensi Aktif
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Buka sesi pertemuan untuk meng-generate QR Code proyektor berbatas waktu dan mencatat kehadiran mahasiswa secara otomatis.
                </p>
              </div>
              <Button
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsNewSesiModalOpen(true)}
              >
                Buka Sesi Presensi Sekarang
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Rekapitulasi & Ambang Kehadiran (FR-2.6 & FR-2.7) */}
      {activeTab === "rekap" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Matriks Kehadiran Mahasiswa ({classAllSessions.length} Pertemuan Digelar)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ambang Batas Kehadiran Minimum Kelas:{" "}
                <strong className="text-emerald-700">
                  {selectedKelas?.ambangKehadiranPersen || 75}%
                </strong>{" "}
                (FR-2.6)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                onClick={handleExportCsv}
              >
                Ekspor CSV (FR-2.7)
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer className="h-3.5 w-3.5" />}
                onClick={() => window.print()}
              >
                Cetak Matriks
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">No</th>
                  <th className="px-4 py-3 min-w-[160px]">Mahasiswa</th>
                  {classAllSessions.map((s) => (
                    <th
                      key={s.id}
                      className="px-2 py-3 text-center whitespace-nowrap min-w-[42px]"
                      title={`P-${s.pertemuanKe}: ${s.judulMateri}`}
                    >
                      P{s.pertemuanKe}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center bg-emerald-50 text-emerald-900 font-extrabold">
                    H
                  </th>
                  <th className="px-2 py-3 text-center">I</th>
                  <th className="px-2 py-3 text-center">S</th>
                  <th className="px-2 py-3 text-center">A</th>
                  <th className="px-4 py-3 text-center min-w-[100px]">
                    Persentase (%)
                  </th>
                  <th className="px-4 py-3 text-center min-w-[140px]">
                    Status Kelayakan UAS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolledStudents.map((mhs, idx) => {
                  const studentPresensiList = classAllSessions.map((s) => {
                    return (
                      presensiState.presensi.find(
                        (p) => p.sesiId === s.id && p.mahasiswaId === mhs.id
                      ) || { status: "ALFA" as const }
                    )
                  })

                  const metrics = calculateAttendanceMetrics(
                    studentPresensiList,
                    classAllSessions.length,
                    selectedKelas?.ambangKehadiranPersen || 75
                  )

                  return (
                    <tr key={mhs.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-center text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-slate-900">{mhs.nama}</div>
                        <div className="text-2xs text-slate-400 font-mono">
                          {mhs.nim}
                        </div>
                      </td>

                      {/* Sessions Meeting status */}
                      {classAllSessions.map((s) => {
                        const rec = presensiState.presensi.find(
                          (p) => p.sesiId === s.id && p.mahasiswaId === mhs.id
                        )
                        const status = rec?.status || "ALFA"

                        return (
                          <td
                            key={s.id}
                            className="px-2 py-2.5 text-center font-bold font-mono text-xs"
                          >
                            <span
                              className={`inline-block w-6 h-6 leading-6 rounded-md text-center ${
                                status === "HADIR"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : status === "IZIN"
                                  ? "bg-amber-100 text-amber-800"
                                  : status === "SAKIT"
                                  ? "bg-sky-100 text-sky-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {status.charAt(0)}
                            </span>
                          </td>
                        )
                      })}

                      <td className="px-3 py-2.5 text-center font-bold bg-emerald-50 text-emerald-900">
                        {metrics.totalHadir}
                      </td>
                      <td className="px-2 py-2.5 text-center text-slate-600">
                        {metrics.totalIzin}
                      </td>
                      <td className="px-2 py-2.5 text-center text-slate-600">
                        {metrics.totalSakit}
                      </td>
                      <td className="px-2 py-2.5 text-center text-rose-600 font-bold">
                        {metrics.totalAlfa}
                      </td>

                      <td className="px-4 py-2.5 text-center font-extrabold text-sm">
                        <span
                          className={
                            metrics.isMemenuhiSyarat
                              ? "text-emerald-700"
                              : "text-rose-600"
                          }
                        >
                          {metrics.persentaseKehadiran}%
                        </span>
                      </td>

                      <td className="px-4 py-2.5 text-center">
                        <Badge
                          variant={metrics.isMemenuhiSyarat ? "success" : "danger"}
                          size="sm"
                          dot
                        >
                          {metrics.isMemenuhiSyarat
                            ? "Layak Ujian"
                            : "Di Bawah Ambang"}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Log Audit Kecurangan (FR-2.5) */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Audit Trail Perubahan & Pembatalan Presensi (FR-2.5)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap pembatalan presensi terindikasi curang atau perubahan status manual tercatat secara permanen dengan alasan audit.
            </p>
          </div>

          {presensiState.logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada riwayat audit presensi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Waktu Kejadian</th>
                    <th className="px-4 py-3">Mahasiswa</th>
                    <th className="px-4 py-3 text-center">Jenis Aksi</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Alasan / Catatan Pelanggaran</th>
                    <th className="px-4 py-3">Petugas / Dosen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {presensiState.logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {log.mahasiswaNama}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-2xs ${
                            log.aksi === "DIBATALKAN_CURANG"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-sky-100 text-sky-800"
                          }`}
                        >
                          {log.aksi}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        <span className="text-slate-400 line-through">
                          {log.statusLama}
                        </span>{" "}
                        $\rightarrow${" "}
                        <strong className="text-rose-600 font-bold">
                          {log.statusBaru}
                        </strong>
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium max-w-xs">
                        {log.alasan}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.dilakukanOleh}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Buka Sesi Baru */}
      <Modal
        isOpen={isNewSesiModalOpen}
        onClose={() => setIsNewSesiModalOpen(false)}
        title="Buka Sesi Presensi Baru (FR-2.1)"
        description={`Mata Kuliah: ${selectedKelas?.mataKuliah?.nama} (Kelas ${selectedKelas?.namaKelas})`}
        footer={
          <>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsNewSesiModalOpen(false)}
            >
              Batal
            </Button>
            <Button variant="primary" type="button" onClick={handleOpenSesiSubmit}>
              Buka Sesi & Generate QR
            </Button>
          </>
        }
      >
        <form onSubmit={handleOpenSesiSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Pertemuan Ke *
            </label>
            <select
              value={pertemuanKe}
              onChange={(e) => setPertemuanKe(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((p) => (
                <option key={p} value={p}>
                  Pertemuan Ke-{p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Topik Bahasan Perkuliahan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Arsitektur REST API & Integrasi Database"
              value={judulMateri}
              onChange={(e) => setJudulMateri(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <p className="text-2xs text-slate-400">
            Sistem akan men-generate Dynamic QR Code berbatas waktu (auto-refresh 45 detik) yang siap ditampilkan di layar proyektor.
          </p>
        </form>
      </Modal>

      {/* Modal Input Alasan Pembatalan Curang (FR-2.4 & FR-2.5) */}
      <Modal
        isOpen={Boolean(fraudTarget)}
        onClose={() => setFraudTarget(null)}
        title="Batalkan Kehadiran (Indikasi Curang)"
        description={`Mahasiswa: ${fraudTarget?.mahasiswaNama}`}
        footer={
          <>
            <Button
              variant="outline"
              type="button"
              onClick={() => setFraudTarget(null)}
            >
              Kembali
            </Button>
            <Button
              variant="danger"
              type="button"
              disabled={!fraudReason.trim()}
              onClick={handleConfirmFraud}
            >
              Konfirmasi Batalkan & Catat Audit
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Alasan Pembatalan Kehadiran (Wajib Audit Log) *
          </label>
          <textarea
            rows={3}
            required
            placeholder="Contoh: Terindikasi titip absen / scan QR dari luar ruangan perkuliahan..."
            value={fraudReason}
            onChange={(e) => setFraudReason(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
          />
          <p className="text-2xs text-rose-600 font-medium">
            Tindakan ini akan mengubah status kehadiran menjadi ALFA dan tercatat di riwayat audit audit trail dosen.
          </p>
        </div>
      </Modal>
    </div>
  )
}
