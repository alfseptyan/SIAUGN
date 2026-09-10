"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  Search,
  AlertCircle,
  FileCheck,
  Send,
  Eye,
  Filter,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import {
  useBeasiswaStore,
  formatRupiah,
  type ProgramBeasiswaItem,
  type StatusProgramBeasiswa,
} from "@/lib/beasiswa-store"

export default function KemahasiswaanBeasiswaPage() {
  const {
    state,
    approveProgramByKemahasiswaan,
    rejectProgramByKemahasiswaan,
  } = useBeasiswaStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState<string>("MENUNGGU_REVIEW")

  // Modal Review State
  const [selectedProgram, setSelectedProgram] = useState<ProgramBeasiswaItem | null>(null)
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT">("APPROVE")
  const [reviewNotes, setReviewNotes] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const pendingCount = state.program.filter((p) => p.status === "MENUNGGU_REVIEW").length

  const filteredPrograms = state.program.filter((prog) => {
    const matchSearch =
      prog.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.mitraNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchSearch) return false

    if (selectedTab === "ALL") return true
    if (selectedTab === "MENUNGGU_REVIEW") return prog.status === "MENUNGGU_REVIEW"
    if (selectedTab === "PUBLISH") return prog.status === "PUBLISH"
    if (selectedTab === "DITOLAK") return prog.status === "DITOLAK"
    return true
  })

  const handleOpenReview = (prog: ProgramBeasiswaItem) => {
    setSelectedProgram(prog)
    setReviewAction("APPROVE")
    setReviewNotes("")
  }

  const handleSubmitReview = () => {
    if (!selectedProgram) return

    if (reviewAction === "APPROVE") {
      approveProgramByKemahasiswaan(selectedProgram.id, reviewNotes)
      setToastMessage(`Program "${selectedProgram.nama}" berhasil disetujui & dipublikasikan ke katalog mahasiswa!`)
    } else {
      if (!reviewNotes.trim()) {
        alert("Catatan revisi/alasan penolakan wajib diisi untuk mitra.")
        return
      }
      rejectProgramByKemahasiswaan(selectedProgram.id, reviewNotes)
      setToastMessage(`Program "${selectedProgram.nama}" dikembalikan ke Mitra dengan catatan revisi.`)
    }

    setSelectedProgram(null)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const getStatusBadge = (status: StatusProgramBeasiswa) => {
    switch (status) {
      case "PUBLISH":
        return <Badge variant="success" dot>Dipublikasi (Katalog Aktif)</Badge>
      case "MENUNGGU_REVIEW":
        return <Badge variant="warning" dot>Menunggu Kurasi</Badge>
      case "DITOLAK":
        return <Badge variant="danger" dot>Perlu Revisi</Badge>
      case "DITUTUP":
        return <Badge variant="neutral">Ditutup</Badge>
      case "DRAF":
      default:
        return <Badge variant="neutral" dot>Draf Mitra</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kurasi & Review Program Beasiswa"
        subtitle="Verifikasi legalitas, benefit, dan kriteria seleksi program beasiswa mitra sebelum dipublikasikan ke mahasiswa (FR-3.2)."
      />

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-800 block">Menunggu Kurasi</span>
            <span className="text-2xl font-bold text-amber-900 mt-1 block">{pendingCount} Program</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-200/60 flex items-center justify-center text-amber-800">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800 block">Program Terbit Aktif</span>
            <span className="text-2xl font-bold text-emerald-900 mt-1 block">
              {state.program.filter((p) => p.status === "PUBLISH").length} Program
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-200/60 flex items-center justify-center text-emerald-800">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">Mitra Terdaftar</span>
            <span className="text-2xl font-bold text-foreground mt-1 block">{state.mitra.length} Lembaga</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama program atau mitra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "MENUNGGU_REVIEW", label: `Perlu Review (${pendingCount})` },
            { id: "PUBLISH", label: "Aktif Publish" },
            { id: "ALL", label: "Semua Program" },
            { id: "DITOLAK", label: "Ditolak / Revisi" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredPrograms.map((prog) => {
            const isPending = prog.status === "MENUNGGU_REVIEW"

            return (
              <motion.div
                key={prog.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-card rounded-2xl border p-5 shadow-card transition-all flex flex-col justify-between ${
                  isPending
                    ? "border-amber-300 ring-1 ring-amber-300/30 bg-amber-50/10"
                    : "border-border/60 hover:border-primary/40"
                }`}
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
                    {getStatusBadge(prog.status)}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {prog.deskripsi}
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/40 border border-border/40 text-xs mb-4">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Bantuan / Smt</span>
                      <span className="font-bold text-foreground">{formatRupiah(prog.nominalPerSemester)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Kuota</span>
                      <span className="font-bold text-foreground">{prog.kuota} Penerima</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Min. IPK</span>
                      <span className="font-bold text-emerald-600">{prog.minimalIpk.toFixed(2)}</span>
                    </div>
                  </div>

                  {prog.catatanReview && (
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-[11px] text-muted-foreground mb-4">
                      <strong className="text-foreground block">Catatan Direktorat:</strong>
                      {prog.catatanReview}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Batas: {prog.periodeSelesai}
                  </span>

                  {isPending ? (
                    <button
                      onClick={() => handleOpenReview(prog)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-700 transition-all shadow-xs cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Tinjau & Setujui
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenReview(prog)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground text-xs font-medium cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detail Program
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80">
          <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">Tidak Ada Program</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Semua program dalam kategori ini telah diproses atau belum ada pengajuan baru dari mitra.
          </p>
        </div>
      )}

      {/* Modal Tinjau & Putuskan Review */}
      <Modal
        isOpen={!!selectedProgram}
        onClose={() => setSelectedProgram(null)}
        title="Kurasi & Verifikasi Program Beasiswa"
        description="Pastikan kredibilitas mitra, kelayakan nominal, serta kriteria seleksi yang tidak diskriminatif."
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
              onClick={handleSubmitReview}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer shadow-sm transition-colors ${
                reviewAction === "APPROVE"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {reviewAction === "APPROVE" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Setujui & Publikasikan
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Kirim Catatan Revisi
                </>
              )}
            </button>
          </div>
        }
      >
        {selectedProgram && (
          <div className="space-y-4 py-2 text-sm">
            {/* Header info */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-xs font-semibold text-primary uppercase">
                Mitra: {selectedProgram.mitraNama}
              </span>
              <h4 className="text-base font-bold text-foreground mt-0.5">
                {selectedProgram.nama}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {selectedProgram.deskripsi}
              </p>
            </div>

            {/* Program Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block text-[11px]">Bantuan</span>
                <span className="font-bold text-foreground">
                  {formatRupiah(selectedProgram.nominalPerSemester)}/Smt
                </span>
              </div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block text-[11px]">Kuota</span>
                <span className="font-bold text-foreground">{selectedProgram.kuota} Mahasiswa</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block text-[11px]">Syarat IPK</span>
                <span className="font-bold text-emerald-600">Min. {selectedProgram.minimalIpk.toFixed(2)}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block text-[11px]">Batas Semester</span>
                <span className="font-bold text-foreground">
                  Smt {selectedProgram.minimalSemester} - {selectedProgram.maksimalSemester}
                </span>
              </div>
            </div>

            {/* Kriteria */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Kriteria & Ketentuan Tambahan dari Mitra:
              </label>
              <div className="p-3 rounded-xl bg-card border border-border/60 text-xs text-foreground leading-relaxed">
                {selectedProgram.kriteria || "Tidak ada kriteria khusus tambahan."}
              </div>
            </div>

            {/* Decision Segmented Buttons */}
            <div className="pt-2 border-t border-border/60">
              <label className="block text-xs font-semibold text-foreground mb-2">
                Tindakan Direktorat Kemahasiswaan <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewAction("APPROVE")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    reviewAction === "APPROVE"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Setujui & Terbitkan (PUBLISH)
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction("REJECT")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    reviewAction === "REJECT"
                      ? "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Minta Revisi / Tolak
                </button>
              </div>
            </div>

            {/* Review Notes */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                {reviewAction === "APPROVE"
                  ? "Catatan Persetujuan (Opsional)"
                  : "Alasan / Catatan Revisi untuk Mitra *"}
              </label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewAction === "APPROVE"
                    ? "Contoh: Program terverifikasi memenuhi standar kemahasiswaan..."
                    : "Contoh: Mohon perjelas mekanisme penyaluran dana dan sesuaikan kuota minimal..."
                }
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
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
