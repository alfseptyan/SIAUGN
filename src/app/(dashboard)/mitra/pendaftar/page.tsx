"use client"

import { useState, useMemo, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Eye,
  Award,
  ChevronRight,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Download,
  GraduationCap,
  MessageSquare,
  Building,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import {
  useBeasiswaStore,
  formatRupiah,
  type PendaftaranBeasiswaItem,
  type StatusMitraType,
} from "@/lib/beasiswa-store"

export default function MitraPendaftarPage() {
  const searchParams = useSearchParams()
  const initialProgramId = searchParams.get("programId") || ""

  const { state, decideApplicantByMitra } = useBeasiswaStore()

  // Currently logged in mitra
  const myMitra = state.mitra[0]
  const myPrograms = state.program.filter((p) => p.mitraId === myMitra.id)

  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    initialProgramId || (myPrograms[0]?.id ?? "")
  )
  const [filterMitraStatus, setFilterMitraStatus] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal Review & Decision state
  const [selectedApplicant, setSelectedApplicant] =
    useState<PendaftaranBeasiswaItem | null>(null)
  const [decisionType, setDecisionType] = useState<"DIREKOMENDASIKAN" | "DITOLAK">("DIREKOMENDASIKAN")
  const [decisionNotes, setDecisionNotes] = useState("")
  const [isSuccessToast, setIsSuccessToast] = useState(false)

  // Current active program details
  const activeProgram = myPrograms.find((p) => p.id === selectedProgramId)

  // Filtered applicants
  const programApplicants = useMemo(() => {
    return state.pendaftaran.filter((pend) => {
      if (selectedProgramId && pend.programId !== selectedProgramId) return false
      if (filterMitraStatus !== "ALL" && pend.statusMitra !== filterMitraStatus) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchName = pend.namaMahasiswa.toLowerCase().includes(query)
        const matchNim = pend.nim.toLowerCase().includes(query)
        const matchProdi = pend.programStudi.toLowerCase().includes(query)
        return matchName || matchNim || matchProdi
      }
      return true
    })
  }, [state.pendaftaran, selectedProgramId, filterMitraStatus, searchQuery])

  // Count summaries for active program
  const stats = useMemo(() => {
    const list = state.pendaftaran.filter((p) => p.programId === selectedProgramId)
    return {
      total: list.length,
      menunggu: list.filter((p) => p.statusMitra === "MENUNGGU").length,
      direkomendasikan: list.filter((p) => p.statusMitra === "DIREKOMENDASIKAN").length,
      ditolak: list.filter((p) => p.statusMitra === "DITOLAK").length,
      finalApproved: list.filter((p) => p.statusFinal === "DITERIMA").length,
    }
  }, [state.pendaftaran, selectedProgramId])

  const handleOpenReview = (applicant: PendaftaranBeasiswaItem) => {
    setSelectedApplicant(applicant)
    setDecisionType(applicant.statusMitra === "DITOLAK" ? "DITOLAK" : "DIREKOMENDASIKAN")
    setDecisionNotes(applicant.catatanMitra || "")
  }

  const handleSubmitDecision = () => {
    if (!selectedApplicant) return

    decideApplicantByMitra(selectedApplicant.id, decisionType, decisionNotes)
    setSelectedApplicant(null)
    setIsSuccessToast(true)
    setTimeout(() => setIsSuccessToast(false), 3000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seleksi & Review Pendaftar"
        subtitle="Tinjau berkas pendaftaran mahasiswa dan tentukan kandidat yang direkomendasikan kepada universitas (FR-3.4)."
      />

      {/* FR-3.6 Confidentiality Alert Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-sm">
          <p className="font-semibold text-amber-900">
            Prinsip Kerahasiaan Status 3-Way (FR-3.6)
          </p>
          <p className="text-amber-700 mt-0.5 leading-relaxed">
            Keputusan rekomendasi yang Anda tetapkan disimpan secara internal dan diteruskan ke <strong>Direktorat Kemahasiswaan</strong>. Status di portal mahasiswa tetap berlabel <strong>&quot;DIPROSES&quot;</strong> hingga disahkan secara final oleh universitas.
          </p>
        </div>
      </div>

      {/* Program Selector & Stats Grid */}
      <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Pilih Program Beasiswa
            </label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full sm:w-96 px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {myPrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.status})
                </option>
              ))}
            </select>
          </div>

          {activeProgram && (
            <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-muted-foreground">
              <span className="p-2 rounded-lg bg-muted/60">
                Kuota: <strong className="text-foreground">{activeProgram.kuota} Orang</strong>
              </span>
              <span className="p-2 rounded-lg bg-muted/60">
                Bantuan: <strong className="text-primary">{formatRupiah(activeProgram.nominalPerSemester)}/Smt</strong>
              </span>
            </div>
          )}
        </div>

        {/* Counter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/40">
            <span className="text-xs text-muted-foreground block">Total Pendaftar</span>
            <span className="text-xl font-bold text-foreground">{stats.total}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/50">
            <span className="text-xs text-amber-700 block">Menunggu Seleksi</span>
            <span className="text-xl font-bold text-amber-900">{stats.menunggu}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
            <span className="text-xs text-emerald-700 block">Direkomendasikan Mitra</span>
            <span className="text-xl font-bold text-emerald-900">{stats.direkomendasikan}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/50">
            <span className="text-xs text-blue-700 block">Disetujui Final Kampus</span>
            <span className="text-xl font-bold text-blue-900">{stats.finalApproved} / {activeProgram?.kuota ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari NIM, nama mahasiswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "ALL", label: "Semua Pendaftar" },
            { id: "MENUNGGU", label: "Perlu Diproses" },
            { id: "DIREKOMENDASIKAN", label: "Direkomendasikan" },
            { id: "DITOLAK", label: "Ditolak Berkas" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMitraStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterMitraStatus === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Mahasiswa</th>
                <th className="px-5 py-3.5">Program Studi</th>
                <th className="px-5 py-3.5 text-center">Semester / IPK</th>
                <th className="px-5 py-3.5">Dokumen</th>
                <th className="px-5 py-3.5 text-center">Keputusan Mitra</th>
                <th className="px-5 py-3.5 text-center">Approval Final</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {programApplicants.map((applicant) => {
                return (
                  <tr
                    key={applicant.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-semibold text-foreground block">
                          {applicant.namaMahasiswa}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {applicant.nim}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-foreground font-medium">
                        {applicant.programStudi}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xs text-muted-foreground">
                          Smt {applicant.semester}
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          {applicant.ipk.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {applicant.dokumen.map((dok) => (
                          <span
                            key={dok.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground font-medium"
                          >
                            <FileText className="w-3 h-3 text-primary" />
                            {dok.kategori}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {applicant.statusMitra === "DIREKOMENDASIKAN" ? (
                        <Badge variant="success" dot>Direkomendasikan</Badge>
                      ) : applicant.statusMitra === "DITOLAK" ? (
                        <Badge variant="danger" dot>Ditolak Mitra</Badge>
                      ) : (
                        <Badge variant="warning" dot>Menunggu Seleksi</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {applicant.statusFinal === "DITERIMA" ? (
                        <Badge variant="info">Disahkan Kampus</Badge>
                      ) : applicant.statusFinal === "DITOLAK" ? (
                        <Badge variant="neutral">Tidak Lolos</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">
                          Diproses
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleOpenReview(applicant)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Tinjau & Putuskan
                      </button>
                    </td>
                  </tr>
                )
              })}

              {programApplicants.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm font-medium">Tidak ada data pendaftar yang sesuai filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Review & Putuskan Seleksi */}
      <Modal
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        title="Evaluasi Berkas & Keputusan Seleksi"
        description="Pelajari rekam jejak akademik, surat motivasi, dan lampiran berkas kandidat."
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={() => setSelectedApplicant(null)}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted cursor-pointer transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleSubmitDecision}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer shadow-sm transition-colors ${
                decisionType === "DIREKOMENDASIKAN"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {decisionType === "DIREKOMENDASIKAN" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Rekomendasi
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Simpan Penolakan
                </>
              )}
            </button>
          </div>
        }
      >
        {selectedApplicant && (
          <div className="space-y-4 py-2 text-sm">
            {/* Candidate Header Profile Card */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-primary block">
                  {selectedApplicant.nim} • {selectedApplicant.programStudi}
                </span>
                <h4 className="text-base font-bold text-foreground mt-0.5">
                  {selectedApplicant.namaMahasiswa}
                </h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">IPK Kumulatif</span>
                  <span className="text-base font-bold text-emerald-600">
                    {selectedApplicant.ipk.toFixed(2)}
                  </span>
                </div>
                <div className="text-right pl-3 border-l border-border/60">
                  <span className="text-xs text-muted-foreground block">Semester</span>
                  <span className="text-base font-bold text-foreground">
                    {selectedApplicant.semester}
                  </span>
                </div>
              </div>
            </div>

            {/* Motivation Letter */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                Surat Motivasi Kandidat:
              </label>
              <div className="p-3.5 rounded-xl bg-card border border-border/60 text-xs text-foreground leading-relaxed">
                {selectedApplicant.motivationLetter}
              </div>
            </div>

            {/* Uploaded Documents */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Dokumen Pendukung yang Diunggah ({selectedApplicant.dokumen.length}):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedApplicant.dokumen.map((dok) => (
                  <div
                    key={dok.id}
                    className="p-2.5 rounded-xl border border-border/60 bg-card flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-foreground block truncate">
                        {dok.namaFile}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {(dok.ukuranBytes / 1024).toFixed(0)} KB • Kategori: {dok.kategori}
                      </span>
                    </div>
                    <button
                      onClick={() => alert(`Simulasi preview berkas: ${dok.namaFile}`)}
                      className="p-1.5 rounded-lg text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                      title="Lihat Dokumen"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Segmented Radio */}
            <div className="pt-2 border-t border-border/60">
              <label className="block text-xs font-semibold text-foreground mb-2">
                Keputusan Seleksi Mitra Beasiswa <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecisionType("DIREKOMENDASIKAN")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    decisionType === "DIREKOMENDASIKAN"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Rekomendasikan Kandidat
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionType("DITOLAK")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    decisionType === "DITOLAK"
                      ? "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Tolak Berkas
                </button>
              </div>
            </div>

            {/* Catatan Pertimbangan */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Catatan Pertimbangan Seleksi
              </label>
              <textarea
                rows={2}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Berikan alasan atau apresiasi seleksi untuk arsip universitas..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Confidentiality Reminder */}
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-[11px] text-muted-foreground flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                Hasil rekomendasi ini langsung disinkronkan ke meja kurasi <strong>Direktorat Kemahasiswaan</strong> untuk disahkan secara final.
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Success Notification */}
      <AnimatePresence>
        {isSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Keputusan seleksi berhasil disimpan & diteruskan ke Kemahasiswaan.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
