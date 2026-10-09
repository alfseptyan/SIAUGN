"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Upload,
  Calendar,
  Building,
  Check,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Download,
  AlertCircle,
  Info,
  ExternalLink,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import {
  useBeasiswaStore,
  formatRupiah,
  checkEligibility,
  type DokumenPendukungItem,
} from "@/lib/beasiswa-store"
import { ApiBoundary, BannerModeTransisi } from "@/components/ui/api-boundary"
import type { ProgramBeasiswaDto, StatusBeasiswaDto } from "@/server/modules/beasiswa"

export default function MahasiswaBeasiswaPage() {
  return (
    <ApiBoundary<StatusBeasiswaDto> url="/api/v1/mahasiswa/beasiswa">
      {(data) => <BeasiswaContent data={data} />}
    </ApiBoundary>
  )
}

function BeasiswaContent({ data }: { data: StatusBeasiswaDto }) {
  // TODO(tulis): pendaftaran masih memakai store lokal; pindahkan ke POST /api/v1/mahasiswa/beasiswa.
  const { applyBeasiswa } = useBeasiswaStore()

  // Profil, katalog program, dan pendaftaran milik mahasiswa berasal dari database
  const currentStudent = data.mahasiswa

  const [activeTab, setActiveTab] = useState<"KATALOG" | "PENGAJUAN">("KATALOG")
  const [searchQuery, setSearchQuery] = useState("")

  // Application Modal state
  const [selectedProgram, setSelectedProgram] = useState<ProgramBeasiswaDto | null>(null)
  const [motivationLetter, setMotivationLetter] = useState("")
  const [useSiakadTranscript, setUseSiakadTranscript] = useState(true)
  const [agreementChecked, setAgreementChecked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Published programs available for students
  const availablePrograms = useMemo(() => {
    return data.program.filter((prog) => {
      if (prog.status !== "PUBLISH") return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          prog.nama.toLowerCase().includes(q) ||
          prog.mitraNama.toLowerCase().includes(q) ||
          prog.deskripsi.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [data.program, searchQuery])

  // Student's existing applications
  const myApplications = useMemo(() => {
    return data.pendaftaran
  }, [data.pendaftaran])

  const handleOpenApplyModal = (program: ProgramBeasiswaDto) => {
    setSelectedProgram(program)
    setMotivationLetter("")
    setUseSiakadTranscript(true)
    setAgreementChecked(false)
  }

  const handleSubmitApplication = () => {
    if (!selectedProgram) return

    if (!motivationLetter.trim() || motivationLetter.length < 30) {
      alert("Mohon tuliskan surat motivasi singkat (minimal 30 karakter).")
      return
    }

    if (!agreementChecked) {
      alert("Anda harus menyetujui pernyataan kebenaran berkas pendaftaran.")
      return
    }

    setIsSubmitting(true)

    const dokumen: DokumenPendukungItem[] = [
      {
        id: `dok-ktm-${Date.now()}`,
        namaFile: `KTM_${currentStudent.nim}.pdf`,
        tipeFile: "application/pdf",
        ukuranBytes: 350000,
        kategori: "KTM",
        uploadedAt: new Date().toISOString(),
      },
      {
        id: `dok-transkrip-${Date.now()}`,
        namaFile: useSiakadTranscript
          ? `Transkrip_SIAKAD_Terverifikasi_${currentStudent.nim}.pdf`
          : `Transkrip_Akademik_${currentStudent.nim}.pdf`,
        tipeFile: "application/pdf",
        ukuranBytes: 850000,
        kategori: "TRANSKRIP",
        uploadedAt: new Date().toISOString(),
      },
      {
        id: `dok-rekomendasi-${Date.now()}`,
        namaFile: `Surat_Rekomendasi_Fakultas_${currentStudent.nim}.pdf`,
        tipeFile: "application/pdf",
        ukuranBytes: 420000,
        kategori: "REKOMENDASI",
        uploadedAt: new Date().toISOString(),
      },
    ]

    try {
      applyBeasiswa({
        programId: selectedProgram.id,
        mahasiswaId: currentStudent.id,
        nim: currentStudent.nim,
        namaMahasiswa: currentStudent.nama,
        programStudi: currentStudent.programStudi,
        semester: currentStudent.semester,
        ipk: currentStudent.ipk,
        motivationLetter,
        dokumen,
      })

      setSelectedProgram(null)
      setIsSubmitting(false)
      setActiveTab("PENGAJUAN")
      setToastMessage("Pendaftaran beasiswa berhasil dikirim! Pantau status Anda di tab Pengajuan.")
      setTimeout(() => setToastMessage(null), 4000)
    } catch (err: any) {
      alert(err.message || "Gagal mendaftar beasiswa.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <BannerModeTransisi />
      <PageHeader
        title="Layanan & Informasi Beasiswa"
        subtitle="Daftar beasiswa kemitraan universitas dan pantau transparansi 3-Way Approval secara real-time (FR-3.3 s/d FR-3.8)."
      />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab("KATALOG")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "KATALOG"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Award className="w-4 h-4" />
          Katalog Beasiswa Tersedia ({availablePrograms.length})
        </button>
        <button
          onClick={() => setActiveTab("PENGAJUAN")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "PENGAJUAN"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Clock className="w-4 h-4" />
          Status Pengajuan Saya ({myApplications.length})
        </button>
      </div>

      {/* TAB 1: KATALOG BEASISWA TERSEDIA */}
      {activeTab === "KATALOG" && (
        <div className="space-y-5">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari beasiswa atau mitra penyedia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Profil Anda: <strong>IPK {currentStudent.ipk.toFixed(2)}</strong> • <strong>Semester {currentStudent.semester}</strong>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {availablePrograms.map((prog) => {
              const eligibility = checkEligibility(
                prog,
                currentStudent.ipk,
                currentStudent.semester
              )
              const hasApplied = myApplications.some((a) => a.programId === prog.id)

              return (
                <div
                  key={prog.id}
                  className="bg-card rounded-2xl border border-border/60 p-5 shadow-card hover:border-primary/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5" />
                          {prog.mitraNama}
                        </span>
                        <h3 className="text-base font-bold text-foreground mt-1 line-clamp-1">
                          {prog.nama}
                        </h3>
                      </div>
                      {hasApplied ? (
                        <Badge variant="info">Sudah Mendaftar</Badge>
                      ) : eligibility.isEligible ? (
                        <Badge variant="success" dot>Memenuhi Syarat</Badge>
                      ) : (
                        <Badge variant="danger" dot>Tidak Memenuhi</Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {prog.deskripsi}
                    </p>

                    {/* Benefit & Criteria Highlights */}
                    <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/40 text-xs mb-4">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Bantuan Biaya</span>
                        <span className="font-bold text-foreground">
                          {formatRupiah(prog.nominalPerSemester)}/Smt
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Kuota</span>
                        <span className="font-bold text-foreground">{prog.kuota} Penerima</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Syarat Min. IPK</span>
                        <span className="font-bold text-emerald-600">
                          Min. {prog.minimalIpk.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Eligibility Warning if Not Eligible */}
                    {!eligibility.isEligible && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-[11px] text-rose-800 mb-4 space-y-1">
                        {eligibility.reasons.map((r, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Batas: {prog.periodeSelesai}</span>
                    </div>

                    {hasApplied ? (
                      <button
                        onClick={() => setActiveTab("PENGAJUAN")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Lihat Status Pengajuan
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        disabled={!eligibility.isEligible}
                        onClick={() => handleOpenApplyModal(prog)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          eligibility.isEligible
                            ? "bg-primary text-primary-foreground hover:bg-primary-700 shadow-xs"
                            : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        Daftar Beasiswa
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {availablePrograms.length === 0 && (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80">
              <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">Tidak Ada Program Beasiswa</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Saat ini belum ada program beasiswa yang aktif atau cocok dengan pencarian Anda.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STATUS PENGAJUAN SAYA (3-WAY APPROVAL STEPPER) */}
      {activeTab === "PENGAJUAN" && (
        <div className="space-y-6">
          {myApplications.map((appl) => {
            const program = data.program.find((p) => p.id === appl.programId)

            // CRITICAL FR-3.6: Mahasiswa sees "DIPROSES" while statusFinal === "DIPROSES"
            const isAccepted = appl.statusFinal === "DITERIMA"
            const isRejected = appl.statusFinal === "DITOLAK"
            const isProcessing = appl.statusFinal === "DIPROSES"

            return (
              <div
                key={appl.id}
                className="bg-card rounded-2xl border border-border/60 p-6 shadow-card space-y-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      {program?.mitraNama || "Mitra Beasiswa"}
                    </span>
                    <h3 className="text-lg font-bold text-foreground mt-0.5">
                      {program?.nama || "Program Beasiswa"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Diajukan pada: {new Date(appl.tanggalDaftar).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>

                  {/* Main Status Badge */}
                  <div>
                    {isAccepted ? (
                      <Badge variant="success" size="md" dot>
                        DITERIMA (Penerima Resmi)
                      </Badge>
                    ) : isRejected ? (
                      <Badge variant="danger" size="md" dot>
                        Tidak Lolos Seleksi
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="md" dot>
                        Sedang Diproses (Tahap Seleksi)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 3-WAY PROGRESS STEPPER */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Alur Validasi 3-Way Approval:
                  </h4>

                  <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* STEP 1: Pendaftaran Terkirim */}
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-900 block">
                          Tahap 1: Pendaftaran Terkirim
                        </span>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Berkas akademik & surat motivasi Anda telah terverifikasi sistem.
                        </p>
                      </div>
                    </div>

                    {/* STEP 2: Seleksi Mitra Beasiswa */}
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                        isAccepted
                          ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                          : isRejected
                          ? "border-border bg-muted/30 text-muted-foreground"
                          : "border-amber-300 bg-amber-50/50 text-amber-900 ring-1 ring-amber-300/30"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isAccepted
                            ? "bg-emerald-600 text-white"
                            : isRejected
                            ? "bg-muted-foreground text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {isAccepted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">
                          Tahap 2: Seleksi Mitra Beasiswa
                        </span>
                        <p className="text-[11px] mt-0.5">
                          {isAccepted
                            ? "Kandidat direkomendasikan prioritas oleh Mitra Beasiswa."
                            : isProcessing
                            ? "Berkas Anda sedang dalam peninjauan & verifikasi mitra."
                            : "Proses seleksi berkas mitra telah ditutup."}
                        </p>
                      </div>
                    </div>

                    {/* STEP 3: Approval Final Kemahasiswaan */}
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                        isAccepted
                          ? "border-emerald-300 bg-emerald-100/70 text-emerald-900 ring-2 ring-emerald-500/20"
                          : isRejected
                          ? "border-rose-200 bg-rose-50/60 text-rose-900"
                          : "border-border bg-muted/20 text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isAccepted
                            ? "bg-emerald-600 text-white"
                            : isRejected
                            ? "bg-rose-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isAccepted ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : isRejected ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <ShieldCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">
                          Tahap 3: Pengesahan Rektorat
                        </span>
                        <p className="text-[11px] mt-0.5">
                          {isAccepted
                            ? "Disahkan resmi oleh Direktorat Kemahasiswaan."
                            : isRejected
                            ? "Belum disetujui pada periode seleksi ini."
                            : "Menunggu penetapan SK universitas."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acceptance Celebration Banner */}
                {isAccepted && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-white">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">
                          Selamat! Anda Resmi Terpilih sebagai Penerima Beasiswa
                        </h4>
                        <p className="text-xs text-white/90 mt-0.5">
                          {appl.catatanFinal || "SK Penetapan Rektorat telah diterbitkan. Bantuan biaya pendidikan akan disalurkan sesuai ketentuan."}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => alert("Mengunduh salinan Surat Keputusan (SK) Penerima Beasiswa...")}
                      className="px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh SK Penerimaan (PDF)
                    </button>
                  </div>
                )}

                {/* Submitted Documents Drawer */}
                <div className="pt-2 border-t border-border/40">
                  <span className="text-xs font-semibold text-muted-foreground block mb-2">
                    Dokumen yang Anda Lampirkan:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {appl.dokumen.map((d) => (
                      <span
                        key={d.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 text-xs text-foreground font-medium"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-primary" />
                        {d.namaFile}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}

          {myApplications.length === 0 && (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80">
              <Clock className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">Belum Ada Pengajuan</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Anda belum pernah mengajukan beasiswa. Buka katalog beasiswa untuk melihat program aktif yang sesuai dengan kriteria Anda.
              </p>
              <button
                onClick={() => setActiveTab("KATALOG")}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-700 cursor-pointer transition-colors"
              >
                Lihat Katalog Beasiswa
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Pendaftaran Beasiswa */}
      <Modal
        isOpen={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        title="Formulir Pendaftaran Beasiswa"
        description="Periksa ringkasan data diri dan lengkapi surat motivasi serta dokumen pendukung."
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={() => setSelectedProgram(null)}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleSubmitApplication}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-700 cursor-pointer shadow-sm transition-colors"
            >
              <Award className="w-4 h-4" />
              {isSubmitting ? "Mengirim Pendaftaran..." : "Kirim Pendaftaran Beasiswa"}
            </button>
          </div>
        }
      >
        {selectedProgram && (
          <div className="space-y-4 py-2 text-sm">
            {/* Header info */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-xs font-semibold text-primary uppercase block">
                {selectedProgram.mitraNama}
              </span>
              <h4 className="text-base font-bold text-foreground mt-0.5">
                {selectedProgram.nama}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Bantuan: <strong>{formatRupiah(selectedProgram.nominalPerSemester)}/Semester</strong> • Kuota: {selectedProgram.kuota} Mahasiswa
              </p>
            </div>

            {/* Applicant Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block text-[11px]">NIM</span>
                <span className="font-bold text-foreground font-mono">{currentStudent.nim}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block text-[11px]">Nama</span>
                <span className="font-bold text-foreground">{currentStudent.nama}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block text-[11px]">IPK Kumulatif</span>
                <span className="font-bold text-emerald-600">{currentStudent.ipk.toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block text-[11px]">Semester</span>
                <span className="font-bold text-foreground">Semester {currentStudent.semester}</span>
              </div>
            </div>

            {/* Motivation Letter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-foreground">
                  Surat Motivasi & Rencana Pengembangan Diri <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {motivationLetter.length} karakter
                </span>
              </div>
              <textarea
                rows={3}
                value={motivationLetter}
                onChange={(e) => setMotivationLetter(e.target.value)}
                placeholder="Ceritakan motivasi Anda mendaftar beasiswa ini, visi karir, dan bagaimana bantuan ini mendukung kelulusan Anda..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Document Attachments */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground">
                Dokumen Pendukung Wajib:
              </label>

              <div className="p-3 rounded-xl border border-border/60 bg-card flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Transkrip Akademik SIAKAD Resmi
                    </span>
                    <span className="text-[11px] text-emerald-600">
                      Terverifikasi otomatis dari Pangkalan Data Akademik (IPK {currentStudent.ipk.toFixed(2)})
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useSiakadTranscript}
                  onChange={(e) => setUseSiakadTranscript(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-card flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Kartu Tanda Mahasiswa (KTM) & Surat Rekomendasi Fakultas
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Format PDF (Maks. 2MB)
                    </span>
                  </div>
                </div>
                <span className="text-xs text-primary font-semibold px-2 py-1 rounded bg-primary/10">
                  Siap Dilampirkan
                </span>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-2 border-t border-border/60">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="w-4 h-4 text-primary rounded mt-0.5 cursor-pointer"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Saya menyatakan bahwa seluruh data dan dokumen yang saya berikan adalah benar, dan saya bersedia mematuhi seluruh syarat & ketentuan penerimaan beasiswa.
                </span>
              </label>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
