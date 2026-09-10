"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Search,
  Award,
  Filter,
  ShieldCheck,
  Building,
  FileCheck,
  Download,
  AlertCircle,
  Eye,
  Sparkles,
  CheckCheck,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import {
  useBeasiswaStore,
  formatRupiah,
  type PendaftaranBeasiswaItem,
  type StatusFinalType,
} from "@/lib/beasiswa-store"

export default function KemahasiswaanApprovalPage() {
  const {
    state,
    finalApprovalByKemahasiswaan,
    batchFinalApprovalByKemahasiswaan,
  } = useBeasiswaStore()

  // Published programs only
  const activePrograms = state.program.filter((p) => p.status === "PUBLISH")

  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    activePrograms[0]?.id ?? ""
  )
  const [filterFinalStatus, setFilterFinalStatus] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal State
  const [selectedApplicant, setSelectedApplicant] =
    useState<PendaftaranBeasiswaItem | null>(null)
  const [finalDecision, setFinalDecision] = useState<"DITERIMA" | "DITOLAK">("DITERIMA")
  const [officialNotes, setOfficialNotes] = useState("")
  const [skNumber, setSkNumber] = useState("SK-KMH/2026/088")
  const [isBatchConfirmOpen, setIsBatchConfirmOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const activeProgram = state.program.find((p) => p.id === selectedProgramId)

  // Applicants for this program who have been recommended by Mitra
  const applicants = useMemo(() => {
    return state.pendaftaran.filter((pend) => {
      if (selectedProgramId && pend.programId !== selectedProgramId) return false
      // Only show those evaluated by Mitra (priority to recommended)
      if (pend.statusMitra !== "DIREKOMENDASIKAN" && pend.statusFinal === "DIPROSES") {
        return false
      }
      if (filterFinalStatus !== "ALL" && pend.statusFinal !== filterFinalStatus) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          pend.namaMahasiswa.toLowerCase().includes(q) ||
          pend.nim.toLowerCase().includes(q) ||
          pend.programStudi.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [state.pendaftaran, selectedProgramId, filterFinalStatus, searchQuery])

  // Quota & counts
  const quotaStats = useMemo(() => {
    const allProgramAppls = state.pendaftaran.filter((p) => p.programId === selectedProgramId)
    const recommended = allProgramAppls.filter((p) => p.statusMitra === "DIREKOMENDASIKAN").length
    const accepted = allProgramAppls.filter((p) => p.statusFinal === "DITERIMA").length
    const pendingFinal = allProgramAppls.filter(
      (p) => p.statusMitra === "DIREKOMENDASIKAN" && p.statusFinal === "DIPROSES"
    ).length
    const kuota = activeProgram?.kuota ?? 0
    const remainingQuota = Math.max(0, kuota - accepted)

    return {
      kuota,
      recommended,
      accepted,
      pendingFinal,
      remainingQuota,
    }
  }, [state.pendaftaran, selectedProgramId, activeProgram])

  const handleOpenDecisionModal = (applicant: PendaftaranBeasiswaItem) => {
    setSelectedApplicant(applicant)
    setFinalDecision(applicant.statusFinal === "DITOLAK" ? "DITOLAK" : "DITERIMA")
    setOfficialNotes(
      applicant.catatanFinal ||
        `Disetujui sebagai penerima beasiswa berdasarkan SK Rektorat No. ${skNumber}.`
    )
  }

  const handleSaveFinalDecision = () => {
    if (!selectedApplicant) return

    const fullNotes = officialNotes
    finalApprovalByKemahasiswaan(selectedApplicant.id, finalDecision, fullNotes)
    setSelectedApplicant(null)

    setToastMessage(
      finalDecision === "DITERIMA"
        ? `Kandidat ${selectedApplicant.namaMahasiswa} resmi DITERIMA! Status telah dipublikasikan ke mahasiswa.`
        : `Kandidat ${selectedApplicant.namaMahasiswa} ditandai Ditolak.`
    )
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleBatchApprove = () => {
    if (!selectedProgramId) return
    const count = batchFinalApprovalByKemahasiswaan(selectedProgramId)
    setIsBatchConfirmOpen(false)
    setToastMessage(`Berhasil menyetujui ${count} kandidat sekaligus secara serentak!`)
    setTimeout(() => setToastMessage(null), 4000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval Final Penerima Beasiswa"
        subtitle="Validasi akhir kandidat yang direkomendasikan mitra dan terbitkan SK penetapan resmi universitas (FR-3.5 & FR-3.6)."
      >
        {quotaStats.pendingFinal > 0 && (
          <button
            onClick={() => setIsBatchConfirmOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Setujui Semua Rekomendasi ({quotaStats.pendingFinal})
          </button>
        )}
      </PageHeader>

      {/* Program Selector & Real-Time Quota Progress */}
      <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Pilih Program Beasiswa Aktif
            </label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full sm:w-96 px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {activePrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.mitraNama})
                </option>
              ))}
            </select>
          </div>

          {activeProgram && (
            <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-muted-foreground">
              <span className="p-2 rounded-lg bg-muted/60">
                Mitra: <strong className="text-foreground">{activeProgram.mitraNama}</strong>
              </span>
              <span className="p-2 rounded-lg bg-muted/60">
                Bantuan: <strong className="text-primary">{formatRupiah(activeProgram.nominalPerSemester)}/Smt</strong>
              </span>
            </div>
          )}
        </div>

        {/* Quota Progress Bar */}
        {activeProgram && (
          <div className="pt-2 border-t border-border/40">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-foreground">Realisasi Kuota Penerima:</span>
              <span className="text-emerald-700">
                {quotaStats.accepted} dari {quotaStats.kuota} Kursi Terisi ({Math.round((quotaStats.accepted / (quotaStats.kuota || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (quotaStats.accepted / (quotaStats.kuota || 1)) * 100)}%`,
                }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-center">
                <span className="text-[11px] text-muted-foreground block">Target Kuota</span>
                <span className="text-base font-bold text-foreground">{quotaStats.kuota}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/50 text-center">
                <span className="text-[11px] text-amber-700 block">Rekomendasi Mitra</span>
                <span className="text-base font-bold text-amber-900">{quotaStats.recommended}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/50 text-center">
                <span className="text-[11px] text-emerald-700 block">Resmi Diterima</span>
                <span className="text-base font-bold text-emerald-900">{quotaStats.accepted}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-200/50 text-center">
                <span className="text-[11px] text-sky-700 block">Sisa Kuota Tersedia</span>
                <span className="text-base font-bold text-sky-900">{quotaStats.remainingQuota}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari NIM, nama kandidat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "ALL", label: "Semua Kandidat" },
            { id: "DIPROSES", label: `Menunggu Final (${quotaStats.pendingFinal})` },
            { id: "DITERIMA", label: `Resmi Diterima (${quotaStats.accepted})` },
            { id: "DITOLAK", label: "Ditolak Final" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterFinalStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterFinalStatus === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Mahasiswa</th>
                <th className="px-5 py-3.5">Program Studi</th>
                <th className="px-5 py-3.5 text-center">IPK / Smt</th>
                <th className="px-5 py-3.5">Catatan Seleksi Mitra</th>
                <th className="px-5 py-3.5 text-center">Status Final Kampus</th>
                <th className="px-5 py-3.5 text-right">Keputusan Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {applicants.map((candidate) => {
                const isAccepted = candidate.statusFinal === "DITERIMA"
                const isRejected = candidate.statusFinal === "DITOLAK"
                const isPendingFinal = candidate.statusFinal === "DIPROSES"

                return (
                  <tr
                    key={candidate.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-semibold text-foreground block">
                          {candidate.namaMahasiswa}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {candidate.nim}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-foreground font-medium">
                        {candidate.programStudi}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-bold text-emerald-600">
                          {candidate.ipk.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Semester {candidate.semester}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {candidate.catatanMitra || "Direkomendasikan oleh Mitra Beasiswa."}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {isAccepted ? (
                        <Badge variant="success" dot>Resmi DITERIMA</Badge>
                      ) : isRejected ? (
                        <Badge variant="danger" dot>Ditolak Final</Badge>
                      ) : (
                        <Badge variant="warning" dot>Menunggu Approval</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isPendingFinal ? (
                        <button
                          onClick={() => handleOpenDecisionModal(candidate)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-700 transition-all shadow-xs cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Sahkan Final
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenDecisionModal(candidate)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:text-foreground text-xs font-medium cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ubah / Detail
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}

              {applicants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm font-medium">Belum ada kandidat rekomendasi yang siap diproses.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Sahkan Final Approval */}
      <Modal
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        title="Pengesahan Final Penerima Beasiswa"
        description="Hasil approval ini akan resmi diterbitkan di portal mahasiswa dan mengunci status penerimaan (FR-3.5)."
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={() => setSelectedApplicant(null)}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSaveFinalDecision}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer shadow-sm transition-colors ${
                finalDecision === "DITERIMA"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {finalDecision === "DITERIMA" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Sahkan sebagai Penerima (DITERIMA)
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Tolak Kandidat (DITOLAK)
                </>
              )}
            </button>
          </div>
        }
      >
        {selectedApplicant && (
          <div className="space-y-4 py-2 text-sm">
            {/* Candidate Header Summary */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-primary block">
                  {selectedApplicant.nim} • {selectedApplicant.programStudi}
                </span>
                <h4 className="text-base font-bold text-foreground mt-0.5">
                  {selectedApplicant.namaMahasiswa}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">IPK Kumulatif</span>
                <span className="text-lg font-bold text-emerald-600">
                  {selectedApplicant.ipk.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Recommendation from Mitra */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-xs">
              <span className="font-semibold text-emerald-900 block mb-0.5">
                Rekomendasi dari Mitra:
              </span>
              <p className="text-emerald-800">
                {selectedApplicant.catatanMitra || "Mitra beasiswa merekomendasikan kandidat ini untuk disahkan sebagai penerima."}
              </p>
            </div>

            {/* Decision Segmented Radio */}
            <div className="pt-2 border-t border-border/60">
              <label className="block text-xs font-semibold text-foreground mb-2">
                Keputusan Final Direktorat Kemahasiswaan <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFinalDecision("DITERIMA")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    finalDecision === "DITERIMA"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Sahkan DITERIMA
                </button>
                <button
                  type="button"
                  onClick={() => setFinalDecision("DITOLAK")}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    finalDecision === "DITOLAK"
                      ? "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Tolak Penerimaan
                </button>
              </div>
            </div>

            {/* Nomor SK & Catatan */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nomor SK Penetapan Rektorat / Kemahasiswaan
                </label>
                <input
                  type="text"
                  value={skNumber}
                  onChange={(e) => setSkNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Catatan Resmi (Ditampilkan kepada Mahasiswa)
                </label>
                <textarea
                  rows={2}
                  value={officialNotes}
                  onChange={(e) => setOfficialNotes(e.target.value)}
                  placeholder="Catatan resmi pengesahan..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Konfirmasi Batch Approval */}
      <Modal
        isOpen={isBatchConfirmOpen}
        onClose={() => setIsBatchConfirmOpen(false)}
        title="Konfirmasi Pengesahan Rekomendasi Serentak"
        description="Sahkan seluruh kandidat yang telah direkomendasikan mitra secara serentak (sesuai kuota tersisa)."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsBatchConfirmOpen(false)}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleBatchApprove}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 cursor-pointer shadow-sm transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Ya, Sahkan Sekaligus
            </button>
          </div>
        }
      >
        <div className="py-2 text-xs text-muted-foreground leading-relaxed">
          Terdapat <strong>{quotaStats.pendingFinal} kandidat</strong> yang telah direkomendasikan mitra. Aksi ini akan mengubah status seluruh kandidat tersebut menjadi <strong>DITERIMA</strong> dan menerbitkan notifikasi resmi di portal mahasiswa masing-masing.
        </div>
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
