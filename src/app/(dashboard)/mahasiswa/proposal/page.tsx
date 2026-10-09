"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileEdit,
  Send,
  History,
  Upload,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import {
  useLayananStore,
  formatRupiahLayanan,
  getStatusProposalVariant,
} from "@/lib/layanan-store"
import { ApiBoundary, BannerModeTransisi } from "@/components/ui/api-boundary"
import type { StatusPengajuanDto } from "@/server/modules/layanan"

type TabView = "form" | "riwayat"

export default function MahasiswaProposalPage() {
  return (
    <ApiBoundary<StatusPengajuanDto> url="/api/v1/mahasiswa/pengajuan">
      {(data) => <ProposalContent data={data} />}
    </ApiBoundary>
  )
}

function ProposalContent({ data }: { data: StatusPengajuanDto }) {
  // TODO(tulis): pengajuan proposal masih memakai store lokal; pindahkan ke POST /api/v1/mahasiswa/pengajuan.
  const { submitProposal } = useLayananStore()
  const me = data.mahasiswa

  const [activeTab, setActiveTab] = useState<TabView>("form")

  // Form state
  const [formNamaAcara, setFormNamaAcara] = useState("")
  const [formDeskripsi, setFormDeskripsi] = useState("")
  const [formTanggalMulai, setFormTanggalMulai] = useState("")
  const [formTanggalSelesai, setFormTanggalSelesai] = useState("")
  const [formTempat, setFormTempat] = useState("")
  const [formEstBiaya, setFormEstBiaya] = useState(0)
  const [formEstPeserta, setFormEstPeserta] = useState(0)
  const [formOrganisasi, setFormOrganisasi] = useState("")
  const [formPdfNama, setFormPdfNama] = useState("")
  const [formPdfUkuran, setFormPdfUkuran] = useState(0)

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Riwayat proposal milik mahasiswa (dari database)
  const myProposal = data.proposal

  const handleFileSimulate = () => {
    // Simulate PDF file picking
    const randomNames = [
      "Proposal_Kegiatan_Mahasiswa.pdf",
      "Proposal_Seminar_Workshop.pdf",
      "Proposal_Kompetisi_Internal.pdf",
      "Proposal_Bakti_Sosial.pdf",
    ]
    const name = randomNames[Math.floor(Math.random() * randomNames.length)]
    const size = Math.floor(Math.random() * 3000000) + 500000 // 500KB - 3.5MB
    setFormPdfNama(name)
    setFormPdfUkuran(size)
  }

  const handleSubmit = () => {
    if (!formNamaAcara.trim()) { alert("Nama acara wajib diisi."); return }
    if (!formDeskripsi.trim()) { alert("Deskripsi kegiatan wajib diisi."); return }
    if (!formTanggalMulai) { alert("Tanggal pelaksanaan wajib diisi."); return }
    if (!formTempat.trim()) { alert("Tempat kegiatan wajib diisi."); return }
    if (!formPdfNama) { alert("File proposal PDF wajib dilampirkan."); return }

    submitProposal({
      mahasiswaId: me.id,
      namaMahasiswa: me.nama,
      nim: me.nim,
      organisasi: formOrganisasi || "Pribadi",
      namaAcara: formNamaAcara,
      deskripsi: formDeskripsi,
      tanggalMulai: formTanggalMulai,
      tanggalSelesai: formTanggalSelesai || formTanggalMulai,
      tempat: formTempat,
      estimasiBiaya: formEstBiaya,
      estimasiPeserta: formEstPeserta,
      filePdfNama: formPdfNama,
      filePdfUkuran: formPdfUkuran,
    })

    // Reset form
    setFormNamaAcara("")
    setFormDeskripsi("")
    setFormTanggalMulai("")
    setFormTanggalSelesai("")
    setFormTempat("")
    setFormEstBiaya(0)
    setFormEstPeserta(0)
    setFormOrganisasi("")
    setFormPdfNama("")
    setFormPdfUkuran(0)

    setToastMessage("Proposal berhasil diajukan! Menunggu review Direktorat Kemahasiswaan.")
    setActiveTab("riwayat")
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6">
      <BannerModeTransisi />
      <PageHeader
        title="Proposal Kegiatan Kemahasiswaan"
        subtitle="Ajukan proposal kegiatan organisasi mahasiswa dan pantau proses persetujuan dari Direktorat Kemahasiswaan (FR-4.4)."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border/50">
        {[
          { id: "form" as TabView, label: "Ajukan Proposal Baru", icon: <Send className="w-4 h-4" /> },
          { id: "riwayat" as TabView, label: `Riwayat Pengajuan (${myProposal.length})`, icon: <History className="w-4 h-4" /> },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-px ${activeTab === tab.id ? "text-primary border-primary bg-primary/5" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ============== TAB: FORM PROPOSAL ============== */}
      {activeTab === "form" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-5">
          <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-card space-y-5 text-sm">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Nama Acara / Kegiatan <span className="text-rose-500">*</span></label>
              <input type="text" value={formNamaAcara} onChange={(e) => setFormNamaAcara(e.target.value)} placeholder="Contoh: Seminar Nasional Teknologi Informasi 2026" className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Organisasi Pengaju</label>
              <input type="text" value={formOrganisasi} onChange={(e) => setFormOrganisasi(e.target.value)} placeholder="Contoh: Himpunan Mahasiswa Informatika" className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Deskripsi Kegiatan <span className="text-rose-500">*</span></label>
              <textarea rows={4} value={formDeskripsi} onChange={(e) => setFormDeskripsi(e.target.value)} placeholder="Jelaskan latar belakang, tujuan, dan rangkaian kegiatan yang akan dilaksanakan..." className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Tanggal Mulai <span className="text-rose-500">*</span></label>
                <input type="date" value={formTanggalMulai} onChange={(e) => setFormTanggalMulai(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Tanggal Selesai</label>
                <input type="date" value={formTanggalSelesai} onChange={(e) => setFormTanggalSelesai(e.target.value)} className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Tempat Pelaksanaan <span className="text-rose-500">*</span></label>
              <input type="text" value={formTempat} onChange={(e) => setFormTempat(e.target.value)} placeholder="Contoh: Aula Serba Guna Utama, Kampus" className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-primary" />Estimasi Biaya (Rp)</label>
                <input type="number" value={formEstBiaya || ""} onChange={(e) => setFormEstBiaya(Number(e.target.value))} min={0} placeholder="0" className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-primary" />Estimasi Jumlah Peserta</label>
                <input type="number" value={formEstPeserta || ""} onChange={(e) => setFormEstPeserta(Number(e.target.value))} min={0} placeholder="0" className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>

            {/* PDF upload simulation */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Lampiran Proposal (PDF) <span className="text-rose-500">*</span></label>
              {formPdfNama ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <span className="text-xs font-semibold text-foreground block">{formPdfNama}</span>
                      <span className="text-[10px] text-muted-foreground">{(formPdfUkuran / 1024).toFixed(0)} KB</span>
                    </div>
                  </div>
                  <button onClick={() => { setFormPdfNama(""); setFormPdfUkuran(0) }} className="text-xs text-rose-500 hover:text-rose-700 cursor-pointer font-semibold">Hapus</button>
                </div>
              ) : (
                <button onClick={handleFileSimulate} className="w-full p-6 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-primary">
                  <Upload className="w-8 h-8" />
                  <span className="text-xs font-semibold">Klik untuk upload file PDF proposal</span>
                  <span className="text-[11px]">Format: PDF, maks 5MB</span>
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-border/50 flex items-center justify-end">
              <button onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-700 cursor-pointer shadow-sm transition-all">
                <Send className="w-4 h-4" />Kirim Proposal
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============== TAB: RIWAYAT PENGAJUAN ============== */}
      {activeTab === "riwayat" && (
        <div className="space-y-4">
          {myProposal.length === 0 && (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80">
              <FileEdit className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">Belum Ada Proposal</h3>
              <p className="text-sm text-muted-foreground mt-1">Kamu belum pernah mengajukan proposal kegiatan.</p>
            </div>
          )}

          {myProposal.map((prop) => (
            <motion.div key={prop.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border/60 p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">{prop.organisasi}</span>
                  <h4 className="text-sm font-bold text-foreground mt-0.5">{prop.namaAcara}</h4>
                </div>
                <Badge variant={getStatusProposalVariant(prop.status)} dot>
                  {prop.status === "DISETUJUI" ? "Disetujui" : prop.status === "DITOLAK" ? "Ditolak" : "Menunggu Review"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{prop.deskripsi}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" />{prop.tanggalMulai}{prop.tanggalSelesai !== prop.tanggalMulai ? ` s/d ${prop.tanggalSelesai}` : ""}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" />{prop.tempat}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-primary" />{formatRupiahLayanan(prop.estimasiBiaya)}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-primary" />{prop.estimasiPeserta} peserta</span>
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-primary" />{prop.filePdfNama}</span>
              </div>

              {/* Stepper progress */}
              <div className="mt-4 pt-3 border-t border-border/40">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div>
                    <span className="font-semibold text-emerald-700">Diajukan</span>
                  </div>
                  <div className="flex-1 h-0.5 bg-border rounded" />
                  <div className="flex items-center gap-1.5 text-xs">
                    {prop.status === "MENUNGGU" ? (
                      <><div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center animate-pulse"><Clock className="w-3 h-3 text-white" /></div><span className="font-semibold text-amber-700">Menunggu Review</span></>
                    ) : prop.status === "DISETUJUI" ? (
                      <><div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div><span className="font-semibold text-emerald-700">Direview</span></>
                    ) : (
                      <><div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center"><XCircle className="w-3 h-3 text-white" /></div><span className="font-semibold text-rose-700">Ditolak</span></>
                    )}
                  </div>
                  <div className="flex-1 h-0.5 bg-border rounded" />
                  <div className="flex items-center gap-1.5 text-xs">
                    {prop.status === "DISETUJUI" ? (
                      <><div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-white" /></div><span className="font-semibold text-emerald-700">Disetujui</span></>
                    ) : (
                      <><div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center"><Clock className="w-3 h-3 text-gray-400" /></div><span className="font-semibold text-muted-foreground">Keputusan</span></>
                    )}
                  </div>
                </div>
              </div>

              {prop.catatan && (
                <div className={`mt-3 p-2.5 rounded-xl text-xs border ${prop.status === "DISETUJUI" ? "bg-emerald-50/60 border-emerald-200/60 text-emerald-800" : prop.status === "DITOLAK" ? "bg-rose-50/60 border-rose-200/60 text-rose-800" : "bg-amber-50/60 border-amber-200/60 text-amber-800"}`}>
                  <strong>Disposisi Kemahasiswaan:</strong> {prop.catatan}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

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
