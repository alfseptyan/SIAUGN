"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Users,
  Building2,
  MapPin,
  Sparkles,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import {
  useLayananStore,
  getStatusPeminjamanVariant,
  type PeminjamanFasilitasItem,
} from "@/lib/layanan-store"

export default function FasilitasPeminjamanPage() {
  const { state, approvePeminjaman, rejectPeminjaman } = useLayananStore()

  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<PeminjamanFasilitasItem | null>(null)
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT">("APPROVE")
  const [reviewNotes, setReviewNotes] = useState("")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const pendingCount = state.peminjaman.filter((p) => p.status === "MENUNGGU").length

  const filteredPeminjaman = useMemo(() => {
    return state.peminjaman.filter((p) => {
      if (filterStatus !== "ALL" && p.status !== filterStatus) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          p.namaMahasiswa.toLowerCase().includes(q) ||
          p.nim.toLowerCase().includes(q) ||
          p.namaFasilitas.toLowerCase().includes(q) ||
          p.keperluan.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [state.peminjaman, filterStatus, searchQuery])

  const handleOpenReview = (item: PeminjamanFasilitasItem) => {
    setSelectedItem(item)
    setReviewAction("APPROVE")
    setReviewNotes(item.catatan || "")
  }

  const handleSubmitReview = () => {
    if (!selectedItem) return
    if (reviewAction === "APPROVE") {
      approvePeminjaman(selectedItem.id, reviewNotes)
      setToastMessage(`Peminjaman ${selectedItem.namaFasilitas} oleh ${selectedItem.namaMahasiswa} DISETUJUI.`)
    } else {
      if (!reviewNotes.trim()) { alert("Catatan alasan penolakan wajib diisi."); return }
      rejectPeminjaman(selectedItem.id, reviewNotes)
      setToastMessage(`Peminjaman ${selectedItem.namaFasilitas} oleh ${selectedItem.namaMahasiswa} DITOLAK.`)
    }
    setSelectedItem(null)
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Antrean Peminjaman Fasilitas"
        subtitle="Tinjau dan kelola permintaan peminjaman ruangan, laboratorium, dan peralatan dari mahasiswa (FR-4.3)."
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
            <span className="text-2xl font-bold text-emerald-900 mt-1 block">{state.peminjaman.filter((p) => p.status === "DISETUJUI").length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-200/60 flex items-center justify-center text-emerald-800"><CheckCircle2 className="w-5 h-5" /></div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-muted-foreground block">Total Permintaan</span>
            <span className="text-2xl font-bold text-foreground mt-1 block">{state.peminjaman.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground"><CalendarCheck className="w-5 h-5" /></div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Cari nama, NIM, fasilitas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
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

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Pemohon</th>
                <th className="px-5 py-3.5">Fasilitas</th>
                <th className="px-5 py-3.5 text-center">Tanggal</th>
                <th className="px-5 py-3.5 text-center">Jam</th>
                <th className="px-5 py-3.5">Keperluan</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredPeminjaman.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-semibold text-foreground block">{item.namaMahasiswa}</span>
                    <span className="text-xs text-muted-foreground font-mono">{item.nim}</span>
                    <span className="text-[11px] text-muted-foreground block">{item.organisasi}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-medium text-foreground">{item.namaFasilitas}</span>
                  </td>
                  <td className="px-5 py-4 text-center text-xs font-medium text-foreground">{item.tanggal}</td>
                  <td className="px-5 py-4 text-center text-xs font-mono text-foreground">{item.jamMulai} - {item.jamSelesai}</td>
                  <td className="px-5 py-4 max-w-xs">
                    <span className="text-xs text-muted-foreground line-clamp-2">{item.keperluan}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Badge variant={getStatusPeminjamanVariant(item.status)} dot>{item.status === "DISETUJUI" ? "Disetujui" : item.status === "DITOLAK" ? "Ditolak" : "Menunggu"}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleOpenReview(item)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold transition-all cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />
                      {item.status === "MENUNGGU" ? "Tinjau" : "Detail"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPeminjaman.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                  <CalendarCheck className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-medium">Tidak ada data peminjaman.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Review */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Review Peminjaman Fasilitas" description="Verifikasi ketersediaan dan berikan keputusan persetujuan." maxWidth="xl"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button onClick={() => setSelectedItem(null)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted cursor-pointer transition-colors">Batal</button>
            <button onClick={handleSubmitReview} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer shadow-sm transition-colors ${reviewAction === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}>
              {reviewAction === "APPROVE" ? <><CheckCircle2 className="w-4 h-4" />Setujui Peminjaman</> : <><XCircle className="w-4 h-4" />Tolak Peminjaman</>}
            </button>
          </div>
        }
      >
        {selectedItem && (
          <div className="space-y-4 py-2 text-sm">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary block">{selectedItem.nim} • {selectedItem.organisasi}</span>
                  <h4 className="text-base font-bold text-foreground mt-0.5">{selectedItem.namaMahasiswa}</h4>
                </div>
                <Badge variant={getStatusPeminjamanVariant(selectedItem.status)} dot>
                  {selectedItem.status === "DISETUJUI" ? "Disetujui" : selectedItem.status === "DITOLAK" ? "Ditolak" : "Menunggu"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block text-[11px]">Fasilitas</span>
                <span className="font-bold text-foreground">{selectedItem.namaFasilitas}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block text-[11px]">Tanggal</span>
                <span className="font-bold text-foreground">{selectedItem.tanggal}</span>
              </div>
              <div className="p-2.5 rounded-xl border border-border/60 bg-card">
                <span className="text-muted-foreground block text-[11px]">Jam</span>
                <span className="font-bold text-foreground font-mono">{selectedItem.jamMulai} - {selectedItem.jamSelesai}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Keperluan:</label>
              <div className="p-3 rounded-xl bg-card border border-border/60 text-xs text-foreground leading-relaxed">{selectedItem.keperluan}</div>
            </div>

            {selectedItem.status === "MENUNGGU" && (
              <>
                <div className="pt-2 border-t border-border/60">
                  <label className="block text-xs font-semibold text-foreground mb-2">Keputusan Pengelola Fasilitas <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setReviewAction("APPROVE")} className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${reviewAction === "APPROVE" ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />Setujui Peminjaman
                    </button>
                    <button type="button" onClick={() => setReviewAction("REJECT")} className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${reviewAction === "REJECT" ? "border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>
                      <XCircle className="w-4 h-4 text-rose-600" />Tolak Peminjaman
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">{reviewAction === "APPROVE" ? "Catatan (Opsional)" : "Alasan Penolakan *"}</label>
                  <textarea rows={2} value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder={reviewAction === "APPROVE" ? "Catatan tambahan untuk pemohon..." : "Jelaskan alasan penolakan..."} className="w-full px-3.5 py-2 text-xs rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </>
            )}

            {selectedItem.catatan && selectedItem.status !== "MENUNGGU" && (
              <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-xs text-muted-foreground">
                <strong className="text-foreground block mb-0.5">Catatan Pengelola:</strong>
                {selectedItem.catatan}
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
