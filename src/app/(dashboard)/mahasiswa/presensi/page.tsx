"use client"

import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  QrCode,
  Camera,
  Key,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  BookOpen,
  History,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"
import { ApiBoundary, BannerModeTransisi } from "@/components/ui/api-boundary"
import type { RingkasanPresensiDto } from "@/server/modules/presensi"
import { usePresensiStore } from "@/lib/presensi-store"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs } from "@/components/ui/tabs"

export default function MahasiswaPresensiPage() {
  return (
    <ApiBoundary<RingkasanPresensiDto> url="/api/v1/mahasiswa/presensi">
      {(data) => <PresensiContent data={data} />}
    </ApiBoundary>
  )
}

function PresensiContent({ data }: { data: RingkasanPresensiDto }) {
  // TODO(tulis): scan/input token masih memakai store lokal; pindahkan ke POST /api/v1/mahasiswa/presensi.
  const { recordMahasiswaPresensi } = usePresensiStore()

  // Kelas yang diambil, sesi aktif, dan riwayat kehadiran berasal dari database
  const currentMahasiswaId = data.mahasiswaId
  const [activeTab, setActiveTab] = useState<string>("scan")
  const [inputToken, setInputToken] = useState<string>("")
  const [selectedSesiId, setSelectedSesiId] = useState<string>("")
  const [feedback, setFeedback] = useState<{
    type: "SUCCESS" | "ERROR"
    title: string
    message: string
  } | null>(null)

  // Kelas yang diambil mahasiswa
  const myEnrolledClasses = useMemo(() => data.kelas.map((k) => k.kelas), [data.kelas])

  // Sesi yang sedang dibuka pada kelas yang diambil
  const availableActiveSessions = data.sesiAktif

  // Auto-select first active session
  React.useEffect(() => {
    if (availableActiveSessions.length > 0 && !selectedSesiId) {
      setSelectedSesiId(availableActiveSessions[0].id)
    }
  }, [availableActiveSessions, selectedSesiId])

  const targetSession = availableActiveSessions.find(
    (s) => s.id === selectedSesiId
  )
  const targetClass = myEnrolledClasses.find(
    (c) => c.id === targetSession?.kelasId
  )

  // Handle Token Submission (FR-2.2)
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSesiId || !inputToken.trim()) return

    const res = recordMahasiswaPresensi(
      selectedSesiId,
      currentMahasiswaId,
      inputToken.trim().toUpperCase()
    )

    if (res.success) {
      setFeedback({
        type: "SUCCESS",
        title: "Presensi Berhasil Dicatat!",
        message: `${res.message} • ${targetClass?.mataKuliah?.nama} (Pertemuan Ke-${targetSession?.pertemuanKe})`,
      })
      setInputToken("")
    } else {
      setFeedback({
        type: "ERROR",
        title: "Gagal Mencatat Presensi",
        message: res.message,
      })
    }
  }

  // Riwayat kehadiran dan metrik per kelas (dihitung di server)
  const classesAttendanceData = data.kelas

  const tabsConfig = [
    { id: "scan", label: "Scan / Input Presensi (FR-2.2)" },
    { id: "riwayat", label: "Riwayat & Ambang Kehadiran (FR-2.6)" },
  ]

  return (
    <div className="space-y-6">
      <BannerModeTransisi />
      <PageHeader
        title="Presensi Perkuliahan"
        subtitle="Pindai QR Code atau masukkan token presensi perkuliahan, serta pantau ambang batas kehadiran minimum (FR-2.2 & FR-2.6)."
      />

      {/* Tabs */}
      <Tabs items={tabsConfig} activeId={activeTab} onChange={setActiveTab} />

      {/* TAB 1: Scan & Input Token (FR-2.2) */}
      {activeTab === "scan" && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Feedback Alert */}
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
                feedback.type === "SUCCESS"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              {feedback.type === "SUCCESS" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <strong className="font-bold text-sm block">
                  {feedback.title}
                </strong>
                <p>{feedback.message}</p>
              </div>
            </motion.div>
          )}

          {/* Active Session Info Card */}
          {availableActiveSessions.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm" dot>
                      Sesi Presensi Terbuka
                    </Badge>
                    <span className="text-2xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {targetClass?.mataKuliah?.kode}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {targetClass?.mataKuliah?.nama}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pertemuan Ke-{targetSession?.pertemuanKe}: {targetSession?.judulMateri}
                  </p>
                </div>

                {availableActiveSessions.length > 1 && (
                  <select
                    value={selectedSesiId}
                    onChange={(e) => setSelectedSesiId(e.target.value)}
                    className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    {availableActiveSessions.map((s) => {
                      const c = myEnrolledClasses.find((cls) => cls.id === s.kelasId)
                      return (
                        <option key={s.id} value={s.id}>
                          {c?.mataKuliah?.nama} (P-{s.pertemuanKe})
                        </option>
                      )
                    })}
                  </select>
                )}
              </div>

              {/* Camera Scanner Viewfinder Simulation */}
              <div className="relative rounded-2xl bg-slate-900 overflow-hidden aspect-video flex flex-col items-center justify-center text-white p-6 text-center border-2 border-dashed border-emerald-500/50">
                {/* Viewfinder Target Reticle */}
                <div className="relative w-48 h-48 border-2 border-emerald-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="absolute inset-0 bg-emerald-500/10 animate-pulse rounded-2xl" />
                  <Camera className="h-10 w-10 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-300 mt-4 font-medium">
                  Arahkan kamera ke QR Code di layar proyektor dosen
                </p>
                <span className="text-2xs text-slate-400 mt-1">
                  Atau masukkan token 6 digit di bawah jika kamera bermasalah
                </span>
              </div>

              {/* Manual Token Entry Form (FR-2.2 Fallback) */}
              <form onSubmit={handleTokenSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Masukkan Kode Token QR (6 Digit)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Contoh: QR789A"
                        value={inputToken}
                        onChange={(e) =>
                          setInputToken(e.target.value.toUpperCase())
                        }
                        className="w-full pl-10 pr-4 py-2.5 text-base font-mono font-bold tracking-widest uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={!inputToken.trim()}
                    >
                      Kirim Presensi
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-2xs text-slate-500 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>
                    Token berlaku selama 45 detik sesuai timer di layar dosen.
                  </span>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Tidak Ada Sesi Presensi yang Sedang Dibuka
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Dosen belum membuka sesi presensi untuk mata kuliah yang Anda ambil saat ini. Sesi presensi akan otomatis muncul di sini saat dosen menampilkan QR Code di kelas.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Riwayat Presensi & Ambang Kehadiran (FR-2.6) */}
      {activeTab === "riwayat" && (
        <div className="space-y-6">
          {classesAttendanceData.map(({ kelas, sessions, metrics }) => (
            <div
              key={kelas.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {kelas.mataKuliah?.kode}
                    </span>
                    <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      Kelas {kelas.namaKelas}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {kelas.mataKuliah?.nama}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dosen: {kelas.dosen?.nama} • Ambang Kehadiran Minimum:{" "}
                    {kelas.ambangKehadiranPersen || 75}%
                  </p>
                </div>

                {/* KPI Badge & Rate */}
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-2xs text-slate-400 font-semibold">
                      Akumulasi Kehadiran
                    </div>
                    <div
                      className={`text-2xl font-extrabold ${
                        metrics.isMemenuhiSyarat
                          ? "text-emerald-700"
                          : "text-rose-600"
                      }`}
                    >
                      {metrics.persentaseKehadiran}%
                    </div>
                  </div>

                  <Badge
                    variant={metrics.isMemenuhiSyarat ? "success" : "danger"}
                    size="md"
                    dot
                  >
                    {metrics.isMemenuhiSyarat
                      ? "Layak Ujian"
                      : "Di Bawah Ambang"}
                  </Badge>
                </div>
              </div>

              {/* Threshold Warning Banner (FR-2.6) */}
              {!metrics.isMemenuhiSyarat && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                  <div>
                    <strong className="font-bold block">
                      Peringatan Kehadiran di Bawah Ambang Batas!
                    </strong>
                    <span>
                      Kehadiran Anda ({metrics.persentaseKehadiran}%) berada di bawah batas minimum {kelas.ambangKehadiranPersen || 75}%. Harap hubungi dosen pengampu untuk konfirmasi dispensasi agar memenuhi syarat mengikuti UAS.
                    </span>
                  </div>
                </div>
              )}

              {/* Meeting-by-Meeting Pills */}
              <div className="space-y-2">
                <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
                  Riwayat Tiap Pertemuan ({sessions.length} Sesi Terlaksana)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {sessions.map(({ sesi, status, metode, waktuScan }) => (
                    <div
                      key={sesi.id}
                      className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2 ${
                        status === "HADIR"
                          ? "bg-emerald-50/50 border-emerald-200/80"
                          : status === "IZIN"
                          ? "bg-amber-50/50 border-amber-200/80"
                          : status === "SAKIT"
                          ? "bg-sky-50/50 border-sky-200/80"
                          : "bg-rose-50/50 border-rose-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          P-{sesi.pertemuanKe}
                        </span>
                        <span
                          className={`font-extrabold text-2xs px-2 py-0.5 rounded ${
                            status === "HADIR"
                              ? "bg-emerald-200 text-emerald-900"
                              : status === "IZIN"
                              ? "bg-amber-200 text-amber-900"
                              : status === "SAKIT"
                              ? "bg-sky-200 text-sky-900"
                              : "bg-rose-200 text-rose-900"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="text-2xs text-slate-500 space-y-0.5">
                        <div className="line-clamp-1">{sesi.tanggal}</div>
                        {waktuScan ? (
                          <div className="text-emerald-700 font-medium">
                            {new Date(waktuScan).toLocaleTimeString("id-ID")}{" "}
                            ({metode})
                          </div>
                        ) : (
                          <div className="text-slate-400">-</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
