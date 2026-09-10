"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileEdit,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Sparkles,
  Building,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import {
  useLayananStore,
  formatRupiahLayanan,
  getStatusProposalVariant,
  type ProposalKegiatanItem,
} from "@/lib/layanan-store"

export default function KemahasiswaanProposalPage() {
  const { state, approveProposal, rejectProposal } = useLayananStore()

  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<ProposalKegiatanItem | null>(null)
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT">("APPROVE")
  const [reviewNotes, setReviewNotes] = useState("")
  const [skNumber, setSkNumber] = useState("SK-KMH/2026/")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const pendingCount = state.proposal.filter((p) => p.status === "MENUNGGU").length

  const filteredProposal = useMemo(() => {
    return state.proposal.filter((p) => {
      if (filterStatus !== "ALL" && p.status !== filterStatus) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          p.namaAcara.toLowerCase().includes(q) ||
          p.organisasi.toLowerCase().includes(q) ||
          p.namaMahasiswa.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [state.proposal, filterStatus, searchQuery])

  const handleOpenReview = (item: ProposalKegiatanItem) => {
    setSelectedItem(item)
    setReviewAction("APPROVE")
    setReviewNotes(item.catatan || "")
    setSkNumber(`SK-KMH/2026/${String(Math.floor(Math.random() * 900) + 100)}`)
  }

  const handleSubmitReview = () => {
    if (!selectedItem) return
    if (reviewAction === "APPROVE") {
      const catatan = reviewNotes.trim()
        ? reviewNotes
        : `Disetujui oleh Direktorat Kemahasiswaan. ${skNumber}. Anggaran disalurkan sesuai prosedur.`
      approveProposal(selectedItem.id, catatan)
      setToastMessage(`Proposal "${selectedItem.namaAcara}" DISETUJUI!`)
    } else {
      if (!reviewNotes.trim()) { alert("Alasan penolakan/catatan revisi wajib diisi."); return }
      rejectProposal(selectedItem.id, reviewNotes)
      setToastMessage(`Proposal "${selectedItem.namaAcara}" DITOLAK.`)
    }
    setSelectedItem(null)
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Antrean Proposal Kegiatan Mahasiswa"
        subtitle="Review kelayakan dan berikan disposisi persetujuan proposal kegiatan dari organisasi kemahasiswaan (FR-4.5)."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-800 block">Menunggu Review</span>
            <span className="text-2xl font-bold text-amber-900 mt-1 block">{pendingCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-200/60 flex items-center justify-center text-amber-800"><Clock className="w-5 h-5" /></div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-800 block">Disetujui</span>
            <span className="text-2xl font-bold text-emerald-900 mt-1 block">{state.proposal.filter((p) => p.status === "DISETUJUI").length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-200/60 flex items-center justify-center text-emerald-800"><CheckCircle2 className="w-5 h-5" /></div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">Total Proposal</span>
            <span className="text-2xl font-bold text-foreground mt-1 block">{state.proposal.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground"><FileEdit className="w-5 h-5" /></div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Cari nama acara, organisasi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "ALL", label: "Semua" },
            { id: "MENUNGGU", label: `Menunggu (${pendingCount})` },
            { id: "DISETUJUI", label: "Disetujui" },
            { id: "DITOLAK", label: "Ditolak" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setFilterStatus(tab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${filterStatus === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-card text-muted-foreground hover:bg-muted border border-border/50"}`}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Proposal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredProposal.map((prop) => (
            <motion.div key={prop.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-card rounded-2xl border p-5 shadow-card transition-all flex flex-col justify-between ${prop.status === "MENUNGGU" ? "border-amber-300 ring-1 ring-amber-300/30" : "border-border/60 hover:border-primary/40"}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5"><Building className="w-3.5 h-3.5" />{prop.organisasi}</span>
                    <h3 className="text-base font-bold text-foreground mt-1 line-clamp-1">{prop.namaAcara}</h3>
                  </div>
                  <Badge variant={getStatusProposalVariant(prop.status)} dot>
                    {prop.status === "DISETUJUI" ? "Disetujui" : prop.status === "DITOLAK" ? "Ditolak" : "Menunggu"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{prop.deskripsi}</p>
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/40 border border-border/40 text-xs mb-4">
                  <div><span className="text-muted-foreground block text-[11px]">Estimasi Biaya</span><span className="font-bold text-foreground">{formatRupiahLayanan(prop.estimasiBiaya)}</span></div>
                  <div><span className="text-muted-foreground block text-[11px]">Peserta</span><span className="font-bold text-foreground">{prop.estimasiPeserta} Orang</span></div>
                  <div><span className="text-muted-foreground block text-[11px]">Lampiran</span><span className="font-bold text-primary flex items-center gap-1"><FileText className="w-3 h-3" />PDF</span></div>
                </div>
                {prop.catatan && prop.status !== "MENUNGGU" && (
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-[11px] text-muted-foreground mb-4">
                    <strong className="text-foreground block">Disposisi Kemahasiswaan:</strong>{prop.catatan}
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{prop.tanggalMulai}{prop.tanggalSelesai !== prop.tanggalMulai ? ` s/d ${prop.tanggalSelesai}` : ""}</span>
                <button onClick={() => handleOpenReview(prop)} className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${prop.status === "MENUNGGU" ? "bg-primary text-primary-foreground hover:bg-primary-700 shadow-xs" : "border border-border text-muted-foreground hover:text-foreground"}`}>
                  <Eye className="w-3.5 h-3.5" />{prop.status === "MENUNGGU" ? "Tinjau & Putuskan" : "Detail"}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProposal.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80">
          <FileEdit className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">Tidak Ada Proposal</h3>
          <p className="text-sm text-muted-foreground mt-1">Belum ada pengajuan proposal kegiatan yang masuk.</p>
        </div>
      )}

      {/* Modal Review */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Review & Disposisi Proposal Kegiatan" description="Verifikasi kelayakan kegiatan dan berikan persetujuan Direktorat Kemahasiswaan." maxWidth="2xl"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button onClick={() => setSelectedItem(null)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted cursor-pointer transition-colors">Batal</button>
            {selectedItem?.status === "MENUNGGU" && (
              <button onClick={handleSubmitReview} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer shadow-sm transition-colors ${reviewAction === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}>
                {reviewAction === "APPROVE" ? <><CheckCircle2 className="w-4 h-4" />Setujui Proposal</> : <><XCircle className="w-4 h-4" />Tolak Proposal</>}
              </button>
            )}
          </div>
        }
      >
        {selectedItem && (
          <div className="space-y-4 py-2 text-sm">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
              <span className="text-xs font-semibold text-primary uppercase block">{selectedItem.organisasi}</span>
              <h4 className="text-base font-bold text-foreground mt-0.5">{selectedItem.namaAcara}</h4>
              <p className="text-xs text-muted-foreground mt-1">{selectedItem.deskripsi}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl border border-border/60 bg-card"><span className="text-muted-foreground block text-[11px]">Pengaju</span><span className="font-bold text-foreground">{selectedItem.namaMahasiswa}</span><span className="text-[10px] text-muted-foreground font-mono block">{selectedItem.nim}</span></div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-card"><span className="text-muted-foreground block text-[11px]">Jadwal</span><span className="font-bold text-foreground">{selectedItem.tanggalMulai}</span>{selectedItem.tanggalSelesai !== selectedItem.tanggalMulai && <span className="text-[10px] text-muted-foreground block">s/d {selectedItem.tanggalSelesai}</span>}</div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-card"><span className="text-muted-foreground block text-[11px]">Est. Biaya</span><span className="font-bold text-foreground">{formatRupiahLayanan(selectedItem.estimasiBiaya)}</span></div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-card"><span className="text-muted-foreground block text-[11px]">Est. Peserta</span><span className="font-bold text-foreground">{selectedItem.estimasiPeserta} Orang</span></div>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-card flex items-center justify-between">
              <div className="flex items-center gap-2.5"><FileText className="w-4 h-4 text-primary" /><div><span className="text-xs font-semibold text-foreground block">{selectedItem.filePdfNama}</span><span className="text-[10px] text-muted-foreground">{(selectedItem.filePdfUkuran / 1024).toFixed(0)} KB</span></div></div>
              <button onClick={() => alert(`Simulasi preview: ${selectedItem.filePdfNama}`)} className="px-2.5 py-1 rounded-lg text-primary bg-primary/10 hover:bg-primary/20 text-xs font-semibold cursor-pointer transition-colors">Preview PDF</button>
            </div>

            {selectedItem.status === "MENUNGGU" && (
              <>
                <div className="pt-2 border-t border-border/60">
                  <label className="block text-xs font-semibold text-foreground mb-2">Keputusan Direktorat Kemahasiswaan <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setReviewAction("APPROVE")} className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${reviewAction === "APPROVE" ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />Setujui Kegiatan
                    </button>
                    <button type="button" onClick={() => setReviewAction("REJECT")} className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${reviewAction === "REJECT" ? "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>
                      <XCircle className="w-4 h-4 text-rose-600" />Tolak / Minta Revisi
                    </button>
                  </div>
                </div>
                {reviewAction === "APPROVE" && (
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">No. SK Persetujuan</label>
                    <input type="text" value={skNumber} onChange={(e) => setSkNumber(e.target.value)} className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">{reviewAction === "APPROVE" ? "Catatan Disposisi (Opsional)" : "Alasan / Catatan Revisi *"}</label>
                  <textarea rows={2} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder={reviewAction === "APPROVE" ? "Catatan tambahan disposisi..." : "Jelaskan alasan penolakan atau perbaikan yang diperlukan..."} className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </>
            )}

            {selectedItem.catatan && selectedItem.status !== "MENUNGGU" && (
              <div className={`p-3 rounded-xl border text-xs ${selectedItem.status === "DISETUJUI" ? "bg-emerald-50/60 border-emerald-200/60 text-emerald-800" : "bg-rose-50/60 border-rose-200/60 text-rose-800"}`}>
                <strong className="block mb-0.5">Disposisi Kemahasiswaan:</strong>{selectedItem.catatan}
              </div>
            )}
          </div>
        )}
      </Modal>

      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-400" />{toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
