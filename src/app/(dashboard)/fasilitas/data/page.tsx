"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Beaker,
  Monitor,
  Speaker,
  DoorOpen,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import {
  useLayananStore,
  getTipeBadgeVariant,
  type FasilitasItem,
  type TipeFasilitas,
} from "@/lib/layanan-store"

const tipeIcons: Record<TipeFasilitas, React.ReactNode> = {
  LABORATORIUM: <Beaker className="w-5 h-5" />,
  AULA: <DoorOpen className="w-5 h-5" />,
  RUANGAN: <Monitor className="w-5 h-5" />,
  ALAT: <Speaker className="w-5 h-5" />,
}

export default function FasilitasDataPage() {
  const { state, createFasilitas, updateFasilitas, deleteFasilitas } = useLayananStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterTipe, setFilterTipe] = useState<string>("ALL")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FasilitasItem | null>(null)

  // Form state
  const [formNama, setFormNama] = useState("")
  const [formDeskripsi, setFormDeskripsi] = useState("")
  const [formTipe, setFormTipe] = useState<TipeFasilitas>("RUANGAN")
  const [formKapasitas, setFormKapasitas] = useState(30)
  const [formLokasi, setFormLokasi] = useState("")
  const [formIsActive, setFormIsActive] = useState(true)

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormNama("")
    setFormDeskripsi("")
    setFormTipe("RUANGAN")
    setFormKapasitas(30)
    setFormLokasi("")
    setFormIsActive(true)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item: FasilitasItem) => {
    setEditingItem(item)
    setFormNama(item.nama)
    setFormDeskripsi(item.deskripsi)
    setFormTipe(item.tipe)
    setFormKapasitas(item.kapasitas)
    setFormLokasi(item.lokasi)
    setFormIsActive(item.isActive)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formNama.trim()) { alert("Nama fasilitas wajib diisi."); return }
    if (!formLokasi.trim()) { alert("Lokasi fasilitas wajib diisi."); return }

    if (editingItem) {
      updateFasilitas(editingItem.id, {
        nama: formNama,
        deskripsi: formDeskripsi,
        tipe: formTipe,
        kapasitas: Number(formKapasitas),
        lokasi: formLokasi,
        isActive: formIsActive,
      })
    } else {
      createFasilitas({
        nama: formNama,
        deskripsi: formDeskripsi,
        tipe: formTipe,
        kapasitas: Number(formKapasitas),
        lokasi: formLokasi,
        isActive: formIsActive,
      })
    }
    setIsModalOpen(false)
  }

  const filteredFasilitas = state.fasilitas.filter((f) => {
    const matchSearch =
      f.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
    const matchTipe = filterTipe === "ALL" || f.tipe === filterTipe
    return matchSearch && matchTipe
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Data Fasilitas"
        subtitle="Kelola ruangan, laboratorium, aula, dan peralatan kampus yang tersedia untuk dipinjam mahasiswa (FR-4.0)."
      >
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-700 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah Fasilitas
        </button>
      </PageHeader>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama atau lokasi fasilitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "ALL", label: "Semua" },
            { id: "RUANGAN", label: "Ruangan" },
            { id: "LABORATORIUM", label: "Laboratorium" },
            { id: "AULA", label: "Aula" },
            { id: "ALAT", label: "Peralatan" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTipe(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterTipe === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fasilitas Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredFasilitas.map((fas) => {
            const bookingCount = state.peminjaman.filter(
              (p) => p.fasilitasId === fas.id && p.status !== "DITOLAK"
            ).length

            return (
              <motion.div
                key={fas.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-card rounded-2xl border p-5 shadow-card transition-all flex flex-col justify-between ${
                  fas.isActive ? "border-border/60 hover:border-primary/40" : "border-border/40 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        fas.tipe === "LABORATORIUM" ? "bg-sky-100 text-sky-600" :
                        fas.tipe === "AULA" ? "bg-purple-100 text-purple-600" :
                        fas.tipe === "ALAT" ? "bg-amber-100 text-amber-600" :
                        "bg-emerald-100 text-emerald-600"
                      }`}>
                        {tipeIcons[fas.tipe]}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground line-clamp-1">{fas.nama}</h3>
                        <Badge variant={getTipeBadgeVariant(fas.tipe)} size="sm">{fas.tipe}</Badge>
                      </div>
                    </div>
                    {fas.isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" title="Aktif" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0 mt-1" title="Nonaktif" />
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{fas.deskripsi}</p>

                  <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="line-clamp-1">{fas.lokasi}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Kapasitas: <strong className="text-foreground">{fas.kapasitas}</strong> {fas.tipe === "ALAT" ? "unit" : "orang"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {bookingCount} peminjaman aktif
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(fas)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin hapus fasilitas "${fas.nama}"?`))
                          deleteFasilitas(fas.id)
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filteredFasilitas.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80">
          <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">Tidak Ada Fasilitas</h3>
          <p className="text-sm text-muted-foreground mt-1">Tambahkan fasilitas baru untuk mulai melayani peminjaman.</p>
        </div>
      )}

      {/* Modal Tambah / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Data Fasilitas" : "Tambah Fasilitas Baru"}
        description="Lengkapi informasi fasilitas yang tersedia untuk dipinjam mahasiswa."
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2.5">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted cursor-pointer transition-colors">Batal</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-700 cursor-pointer shadow-sm transition-colors">
              {editingItem ? "Simpan Perubahan" : "Tambah Fasilitas"}
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-2 text-sm">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Nama Fasilitas <span className="text-rose-500">*</span></label>
            <input type="text" value={formNama} onChange={(e) => setFormNama(e.target.value)} placeholder="Contoh: Laboratorium Komputer 3" className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Tipe Fasilitas</label>
              <select value={formTipe} onChange={(e) => setFormTipe(e.target.value as TipeFasilitas)} className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer">
                <option value="RUANGAN">Ruangan</option>
                <option value="LABORATORIUM">Laboratorium</option>
                <option value="AULA">Aula</option>
                <option value="ALAT">Peralatan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Kapasitas</label>
              <input type="number" value={formKapasitas} onChange={(e) => setFormKapasitas(Number(e.target.value))} min={1} className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Lokasi <span className="text-rose-500">*</span></label>
            <input type="text" value={formLokasi} onChange={(e) => setFormLokasi(e.target.value)} placeholder="Contoh: Gedung F, Lantai 2, Ruang F-203" className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Deskripsi</label>
            <textarea rows={2} value={formDeskripsi} onChange={(e) => setFormDeskripsi(e.target.value)} placeholder="Keterangan fasilitas, peralatan yang tersedia, dll." className="w-full px-3.5 py-2 text-sm rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
            <span className="text-xs font-semibold text-foreground">Status Ketersediaan</span>
            <button type="button" onClick={() => setFormIsActive(!formIsActive)} className="flex items-center gap-2 cursor-pointer">
              {formIsActive ? (
                <><ToggleRight className="w-6 h-6 text-emerald-600" /><span className="text-xs font-semibold text-emerald-600">Aktif</span></>
              ) : (
                <><ToggleLeft className="w-6 h-6 text-muted-foreground" /><span className="text-xs font-semibold text-muted-foreground">Nonaktif</span></>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
