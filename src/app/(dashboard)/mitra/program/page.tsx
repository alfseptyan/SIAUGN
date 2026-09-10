"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award,
  Plus,
  Search,
  Filter,
  Users,
  Calendar,
  DollarSign,
  Send,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Info,
} from "lucide-react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import {
  useBeasiswaStore,
  formatRupiah,
  type ProgramBeasiswaItem,
  type StatusProgramBeasiswa,
} from "@/lib/beasiswa-store"

export default function MitraProgramPage() {
  const {
    state,
    createProgram,
    updateProgram,
    deleteProgram,
    submitProgramReview,
  } = useBeasiswaStore()

  // Currently logged in mitra (mitra-1)
  const myMitra = state.mitra[0]
  const myPrograms = state.program.filter((p) => p.mitraId === myMitra.id)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<ProgramBeasiswaItem | null>(null)
  const [reviewConfirmId, setReviewConfirmId] = useState<string | null>(null)

  // Form State
  const [formNama, setFormNama] = useState("")
  const [formDeskripsi, setFormDeskripsi] = useState("")
  const [formKriteria, setFormKriteria] = useState("")
  const [formKuota, setFormKuota] = useState(15)
  const [formNominal, setFormNominal] = useState(5000000)
  const [formMinIpk, setFormMinIpk] = useState(3.25)
  const [formMinSem, setFormMinSem] = useState(3)
  const [formMaxSem, setFormMaxSem] = useState(7)
  const [formMulai, setFormMulai] = useState("2026-09-01")
  const [formSelesai, setFormSelesai] = useState("2026-11-30")

  const handleOpenCreate = () => {
    setEditingProgram(null)
    setFormNama("")
    setFormDeskripsi("")
    setFormKriteria("IPK minimal 3.25, Mahasiswa Aktif Semester 3 s/d 7, Memiliki motivasi belajar tinggi.")
    setFormKuota(15)
    setFormNominal(5000000)
    setFormMinIpk(3.25)
    setFormMinSem(3)
    setFormMaxSem(7)
    setFormMulai("2026-09-01")
    setFormSelesai("2026-11-30")
    setIsModalOpen(true)
  }

  const handleOpenEdit = (prog: ProgramBeasiswaItem) => {
    setEditingProgram(prog)
    setFormNama(prog.nama)
    setFormDeskripsi(prog.deskripsi)
    setFormKriteria(prog.kriteria)
    setFormKuota(prog.kuota)
    setFormNominal(prog.nominalPerSemester)
    setFormMinIpk(prog.minimalIpk)
    setFormMinSem(prog.minimalSemester)
    setFormMaxSem(prog.maksimalSemester)
    setFormMulai(prog.periodeMulai)
    setFormSelesai(prog.periodeSelesai)
    setIsModalOpen(true)
  }

  const handleSaveForm = (asReview: boolean = false) => {
    if (!formNama.trim()) {
      alert("Nama program beasiswa wajib diisi.")
      return
    }

    if (editingProgram) {
      updateProgram(editingProgram.id, {
        nama: formNama,
        deskripsi: formDeskripsi,
        kriteria: formKriteria,
        kuota: Number(formKuota),
        nominalPerSemester: Number(formNominal),
        minimalIpk: Number(formMinIpk),
        minimalSemester: Number(formMinSem),
        maksimalSemester: Number(formMaxSem),
        periodeMulai: formMulai,
        periodeSelesai: formSelesai,
        status: asReview ? "MENUNGGU_REVIEW" : editingProgram.status,
      })
    } else {
      const created = createProgram({
        mitraId: myMitra.id,
        mitraNama: myMitra.namaOrganisasi,
        nama: formNama,
        deskripsi: formDeskripsi,
        kriteria: formKriteria,
        kuota: Number(formKuota),
        nominalPerSemester: Number(formNominal),
        minimalIpk: Number(formMinIpk),
        minimalSemester: Number(formMinSem),
        maksimalSemester: Number(formMaxSem),
        periodeMulai: formMulai,
        periodeSelesai: formSelesai,
        status: asReview ? "MENUNGGU_REVIEW" : "DRAF",
      })
      if (asReview) {
        submitProgramReview(created.id)
      }
    }

    setIsModalOpen(false)
  }

  const filteredPrograms = myPrograms.filter((prog) => {
    const matchSearch =
      prog.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.deskripsi.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus =
      selectedStatus === "ALL" || prog.status === selectedStatus
    return matchSearch && matchStatus
  })

  const getStatusBadge = (status: StatusProgramBeasiswa) => {
    switch (status) {
      case "PUBLISH":
        return <Badge variant="success" dot>Dipublikasi (Aktif)</Badge>
      case "MENUNGGU_REVIEW":
        return <Badge variant="warning" dot>Menunggu Review</Badge>
      case "DITOLAK":
        return <Badge variant="danger" dot>Perlu Revisi</Badge>
      case "DITUTUP":
        return <Badge variant="neutral">Ditutup</Badge>
      case "DRAF":
      default:
        return <Badge variant="neutral" dot>Draf</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Program Beasiswa Saya"
        subtitle="Kelola program beasiswa, syarat kriteria, serta ajukan kurasi ke Direktorat Kemahasiswaan (FR-3.1)."
      >
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-700 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Buat Program Baru
        </button>
      </PageHeader>

      {/* Info Notice Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-sm">
          <p className="font-semibold text-emerald-900">
            Alur 3-Way Approval Terintegrasi
          </p>
          <p className="text-emerald-700 mt-0.5">
            Setiap program baru yang Anda ajukan akan diverifikasi oleh <strong>Direktorat Kemahasiswaan</strong> sebelum otomatis terbit di portal katalog mahasiswa.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "ALL", label: "Semua" },
            { id: "PUBLISH", label: "Aktif (Publish)" },
            { id: "MENUNGGU_REVIEW", label: "Menunggu Review" },
            { id: "DRAF", label: "Draf" },
            { id: "DITOLAK", label: "Perlu Revisi" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredPrograms.map((prog) => {
            const pendaftarList = state.pendaftaran.filter(
              (pend) => pend.programId === prog.id
            )
            const recommendedCount = pendaftarList.filter(
              (pend) => pend.statusMitra === "DIREKOMENDASIKAN"
            ).length
            const approvedFinalCount = pendaftarList.filter(
              (pend) => pend.statusFinal === "DITERIMA"
            ).length

            return (
              <motion.div
                key={prog.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-2xl border border-border/60 p-5 shadow-card hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {prog.mitraNama}
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-0.5 line-clamp-1">
                        {prog.nama}
                      </h3>
                    </div>
                    {getStatusBadge(prog.status)}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {prog.deskripsi}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/40 text-xs mb-4">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Bantuan / Smt</span>
                      <span className="font-bold text-foreground">
                        {formatRupiah(prog.nominalPerSemester)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Kuota</span>
                      <span className="font-bold text-foreground">
                        {prog.kuota} Penerima
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Syarat IPK</span>
                      <span className="font-bold text-foreground">
                        Min. {prog.minimalIpk.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Revision alert if rejected */}
                  {prog.status === "DITOLAK" && prog.catatanReview && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <div>
                        <strong className="font-semibold block">Catatan Revisi Kemahasiswaan:</strong>
                        <p className="mt-0.5">{prog.catatanReview}</p>
                      </div>
                    </div>
                  )}

                  {/* Applicant Metrics if published */}
                  {prog.status === "PUBLISH" && (
                    <div className="mb-4 flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pelamar: <strong>{pendaftarList.length}</strong></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">
                          Rekomendasi: <strong className="text-foreground">{recommendedCount}</strong>
                        </span>
                        <span className="text-emerald-700 font-semibold">
                          Final: {approvedFinalCount}/{prog.kuota}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Batas: {prog.periodeSelesai}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {prog.status === "PUBLISH" && (
                      <Link
                        href={`/mitra/pendaftar?programId=${prog.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Seleksi Kandidat ({pendaftarList.length})
                      </Link>
                    )}

                    {(prog.status === "DRAF" || prog.status === "DITOLAK") && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(prog)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="Edit Program"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus program "${prog.nama}"?`)) {
                              deleteProgram(prog.id)
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Program"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setReviewConfirmId(prog.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-700 transition-colors shadow-xs cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          Ajukan Review
                        </button>
                      </>
                    )}

                    {prog.status === "MENUNGGU_REVIEW" && (
                      <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        Sedang Ditinjau
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredPrograms.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80">
          <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">Tidak Ada Program Ditemukan</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Belum ada program beasiswa dengan kriteria yang Anda cari. Buat program baru sekarang.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-700 cursor-pointer transition-colors"
          >
            + Buat Program Sekarang
          </button>
        </div>
      )}

      {/* Modal Buat / Edit Program */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProgram ? "Edit Program Beasiswa" : "Buat Program Beasiswa Baru"}
        description="Lengkapi detail benefit, kuota, serta kriteria seleksi pelamar untuk program Anda."
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => handleSaveForm(false)}
              className="px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 cursor-pointer transition-colors"
            >
              Simpan sebagai Draf
            </button>
            <button
              onClick={() => handleSaveForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-700 cursor-pointer shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              Simpan & Ajukan Review
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-2 text-sm">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Nama Program Beasiswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
              placeholder="Contoh: Beasiswa Talenta Sains & Inovasi 2026"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Nominal Bantuan per Semester (Rp)
              </label>
              <input
                type="number"
                value={formNominal}
                onChange={(e) => setFormNominal(Number(e.target.value))}
                step={500000}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Kuota Penerima (Orang)
              </label>
              <input
                type="number"
                value={formKuota}
                onChange={(e) => setFormKuota(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Minimal IPK
              </label>
              <input
                type="number"
                value={formMinIpk}
                onChange={(e) => setFormMinIpk(Number(e.target.value))}
                step={0.05}
                min={2.0}
                max={4.0}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Minimal Semester
              </label>
              <input
                type="number"
                value={formMinSem}
                onChange={(e) => setFormMinSem(Number(e.target.value))}
                min={1}
                max={8}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Maksimal Semester
              </label>
              <input
                type="number"
                value={formMaxSem}
                onChange={(e) => setFormMaxSem(Number(e.target.value))}
                min={1}
                max={8}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Periode Pendaftaran Mulai
              </label>
              <input
                type="date"
                value={formMulai}
                onChange={(e) => setFormMulai(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Periode Pendaftaran Berakhir
              </label>
              <input
                type="date"
                value={formSelesai}
                onChange={(e) => setFormSelesai(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Deskripsi Singkat & Manfaat Program
            </label>
            <textarea
              rows={2}
              value={formDeskripsi}
              onChange={(e) => setFormDeskripsi(e.target.value)}
              placeholder="Jelaskan cakupan beasiswa, komitmen mitra, dan manfaat pengembangan diri..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Kriteria & Persyaratan Dokumen
            </label>
            <textarea
              rows={2}
              value={formKriteria}
              onChange={(e) => setFormKriteria(e.target.value)}
              placeholder="Contoh: Lampirkan KTM, Transkrip resmi, dan Surat Rekomendasi Fakultas..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Konfirmasi Ajukan Review */}
      <Modal
        isOpen={!!reviewConfirmId}
        onClose={() => setReviewConfirmId(null)}
        title="Ajukan Review ke Direktorat Kemahasiswaan?"
        description="Program beasiswa akan ditinjau oleh pihak universitas sebelum dipublikasikan ke katalog mahasiswa."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setReviewConfirmId(null)}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => {
                if (reviewConfirmId) {
                  submitProgramReview(reviewConfirmId)
                  setReviewConfirmId(null)
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-700 cursor-pointer shadow-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              Ya, Ajukan Review
            </button>
          </div>
        }
      >
        <div className="py-2 text-sm text-muted-foreground">
          Setelah diajukan, status program menjadi <strong>Menunggu Review</strong>. Anda tidak dapat mengubah data sampai review selesai atau jika ada catatan revisi.
        </div>
      </Modal>
    </div>
  )
}
