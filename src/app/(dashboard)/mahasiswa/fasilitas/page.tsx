"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Send,
  Calendar,
  CalendarCheck,
  AlertTriangle,
  Sparkles,
  History,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import {
  useLayananStore,
  getBookingsForDate,
  isSlotOccupied,
  generateTimeSlots,
  checkBentrokPeminjaman,
  getTipeBadgeVariant,
  getStatusPeminjamanVariant,
  type FasilitasItem,
} from "@/lib/layanan-store"

type TabView = "kalender" | "form" | "riwayat"

export default function MahasiswaFasilitasPage() {
  const { state, submitPeminjaman } = useLayananStore()

  const [activeTab, setActiveTab] = useState<TabView>("kalender")

  // Kalender tab state
  const [selectedFasKalId, setSelectedFasKalId] = useState<string>(state.fasilitas[0]?.id ?? "")
  const [weekOffset, setWeekOffset] = useState(0)

  // Form state
  const [formFasId, setFormFasId] = useState<string>(state.fasilitas[0]?.id ?? "")
  const [formTanggal, setFormTanggal] = useState("")
  const [formJamMulai, setFormJamMulai] = useState("08:00")
  const [formJamSelesai, setFormJamSelesai] = useState("10:00")
  const [formKeperluan, setFormKeperluan] = useState("")
  const [formOrganisasi, setFormOrganisasi] = useState("")
  const [conflictError, setConflictError] = useState<string | null>(null)

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const timeSlots = generateTimeSlots()

  // Filter only active fasilitas
  const activeFasilitas = state.fasilitas.filter((f) => f.isActive)

  // Riwayat peminjaman mahasiswa (mhs-1 = Budi Santoso)
  const myPeminjaman = state.peminjaman.filter((p) => p.mahasiswaId === "mhs-1")

  // Week logic
  const weekDates = useMemo(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7)
    const dates: { date: Date; dateStr: string; dayName: string; isToday: boolean }[] = []
    const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
    for (let i = 0; i < 6; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      const dateStr = d.toISOString().split("T")[0]
      dates.push({ date: d, dateStr, dayName: dayNames[i], isToday: dateStr === today.toISOString().split("T")[0] })
    }
    return dates
  }, [weekOffset])

  const weekLabel = useMemo(() => {
    if (weekDates.length < 2) return ""
    const start = weekDates[0].date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    const end = weekDates[weekDates.length - 1].date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    return `${start} - ${end}`
  }, [weekDates])

  // Validate conflict on form change
  const handleFormCheck = () => {
    if (!formFasId || !formTanggal || !formJamMulai || !formJamSelesai) { setConflictError(null); return }

    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m }
    if (toMin(formJamMulai) >= toMin(formJamSelesai)) {
      setConflictError("Jam mulai harus lebih awal dari jam selesai.")
      return
    }

    const result = checkBentrokPeminjaman(state.peminjaman, formFasId, formTanggal, formJamMulai, formJamSelesai)
    if (result.isBentrok) {
      setConflictError(`Jadwal bentrok dengan peminjaman "${result.conflictWith?.keperluan}" oleh ${result.conflictWith?.namaMahasiswa} (${result.conflictWith?.jamMulai} - ${result.conflictWith?.jamSelesai}).`)
    } else {
      setConflictError(null)
    }
  }

  const handleSubmit = () => {
    if (!formFasId) { alert("Pilih fasilitas."); return }
    if (!formTanggal) { alert("Pilih tanggal."); return }
    if (!formKeperluan.trim()) { alert("Jelaskan keperluan peminjaman."); return }

    try {
      submitPeminjaman({
        mahasiswaId: "mhs-1",
        namaMahasiswa: "Budi Santoso",
        nim: "220101001",
        fasilitasId: formFasId,
        tanggal: formTanggal,
        jamMulai: formJamMulai,
        jamSelesai: formJamSelesai,
        keperluan: formKeperluan,
        organisasi: formOrganisasi || "Pribadi",
      })

      setToastMessage("Peminjaman berhasil diajukan! Tunggu persetujuan Pengelola Fasilitas.")
      setFormKeperluan("")
      setFormOrganisasi("")
      setActiveTab("riwayat")
      setTimeout(() => setToastMessage(null), 3500)
    } catch (e: unknown) {
      const err = e as Error
      setConflictError(err.message)
    }
  }

  const tabItems: { id: TabView; label: string; icon: React.ReactNode }[] = [
    { id: "kalender", label: "Kalender Ketersediaan", icon: <Calendar className="w-4 h-4" /> },
    { id: "form", label: "Form Peminjaman", icon: <Send className="w-4 h-4" /> },
    { id: "riwayat", label: `Riwayat Saya (${myPeminjaman.length})`, icon: <History className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Peminjaman Fasilitas Kampus"
        subtitle="Cek ketersediaan, ajukan peminjaman ruangan & peralatan, dan pantau status permintaanmu (FR-4.1 & FR-4.2)."
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border/50">
        {tabItems.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl whitespace-nowrap transition-all cursor-pointer border-b-2 -mb-px ${activeTab === tab.id ? "text-primary border-primary bg-primary/5" : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ============== TAB: KALENDER ============== */}
      {activeTab === "kalender" && (
        <div className="space-y-5">
          <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="w-full sm:w-auto">
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pilih Fasilitas</label>
                <select value={selectedFasKalId} onChange={(e) => setSelectedFasKalId(e.target.value)} className="w-full sm:w-96 px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer">
                  {activeFasilitas.map((f) => (<option key={f.id} value={f.id}>{f.nama} ({f.tipe}, Kap: {f.kapasitas})</option>))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setWeekOffset((w) => w - 1)} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-sm font-semibold text-foreground min-w-[180px] text-center">{weekLabel}</span>
                <button onClick={() => setWeekOffset((w) => w + 1)} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
                {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground cursor-pointer">Hari Ini</button>}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16 bg-muted/30">Jam</th>
                    {weekDates.map((day) => (
                      <th key={day.dateStr} className={`px-2 py-3 text-center font-semibold min-w-[120px] ${day.isToday ? "bg-primary/5 text-primary" : "text-muted-foreground"}`}>
                        <span className="block text-xs">{day.dayName}</span>
                        <span className={`block text-sm mt-0.5 ${day.isToday ? "text-primary font-bold" : "text-foreground"}`}>{day.date.getDate()}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, slotIdx) => {
                    const hour = parseInt(slot.split(":")[0])
                    return (
                      <tr key={slot} className={`border-b border-border/20 ${slotIdx % 2 === 0 ? "bg-white" : "bg-muted/10"}`}>
                        <td className="px-3 py-2 text-xs font-mono text-muted-foreground bg-muted/20 border-r border-border/30">{slot}</td>
                        {weekDates.map((day) => {
                          const dayBookings = getBookingsForDate(state.peminjaman, selectedFasKalId, day.dateStr)
                          const occupant = isSlotOccupied(dayBookings, hour)
                          if (occupant) {
                            const [startH] = occupant.jamMulai.split(":").map(Number)
                            const isStart = hour === startH
                            if (isStart) {
                              const [endH] = occupant.jamSelesai.split(":").map(Number)
                              const span = endH - startH
                              return (
                                <td key={day.dateStr} rowSpan={span} className="px-1 py-1 align-top">
                                  <div className={`h-full rounded-lg p-1.5 text-[10px] leading-tight ${occupant.status === "DISETUJUI" ? "bg-emerald-100 border border-emerald-300 text-emerald-900" : "bg-amber-100 border border-amber-300 text-amber-900"}`}>
                                    <span className="font-bold block truncate">{occupant.keperluan}</span>
                                    <span className="text-[9px] opacity-75 font-mono">{occupant.jamMulai}-{occupant.jamSelesai}</span>
                                  </div>
                                </td>
                              )
                            }
                            return null
                          }
                          return (<td key={day.dateStr} className={`px-1 py-2 text-center ${day.isToday ? "bg-primary/[0.02]" : ""}`}><span className="text-muted-foreground/30">—</span></td>)
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-200 border border-emerald-400" /><span>Disetujui</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-200 border border-amber-400" /><span>Menunggu</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-muted border border-border" /><span>Slot Tersedia</span></div>
          </div>
        </div>
      )}

      {/* ============== TAB: FORM PEMINJAMAN ============== */}
      {activeTab === "form" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-5">
          <div className="bg-card rounded-2xl border border-border/60 p-6 shadow-card space-y-5 text-sm">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Fasilitas yang Dipinjam <span className="text-rose-500">*</span></label>
              <select value={formFasId} onChange={(e) => { setFormFasId(e.target.value); setConflictError(null) }} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer">
                {activeFasilitas.map((f) => (<option key={f.id} value={f.id}>{f.nama} ({f.tipe}) — Kap: {f.kapasitas}</option>))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Tanggal <span className="text-rose-500">*</span></label>
                <input type="date" value={formTanggal} onChange={(e) => { setFormTanggal(e.target.value); setConflictError(null) }} onBlur={handleFormCheck} className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Jam Mulai <span className="text-rose-500">*</span></label>
                <select value={formJamMulai} onChange={(e) => { setFormJamMulai(e.target.value); setConflictError(null) }} onBlur={handleFormCheck} className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer">
                  {timeSlots.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Jam Selesai <span className="text-rose-500">*</span></label>
                <select value={formJamSelesai} onChange={(e) => { setFormJamSelesai(e.target.value); setConflictError(null) }} onBlur={handleFormCheck} className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer">
                  {timeSlots.filter((s) => s > formJamMulai).map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </div>

            {conflictError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{conflictError}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Organisasi / Lembaga</label>
              <input type="text" value={formOrganisasi} onChange={(e) => setFormOrganisasi(e.target.value)} placeholder="Contoh: Himpunan Mahasiswa Informatika" className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Keperluan Peminjaman <span className="text-rose-500">*</span></label>
              <textarea rows={3} value={formKeperluan} onChange={(e) => setFormKeperluan(e.target.value)} placeholder="Jelaskan secara singkat kegiatan yang akan dilaksanakan di fasilitas ini..." className="w-full px-3.5 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            </div>

            <div className="pt-3 border-t border-border/50 flex items-center justify-end">
              <button onClick={handleSubmit} disabled={!!conflictError} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm transition-all">
                <Send className="w-4 h-4" />Ajukan Peminjaman
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============== TAB: RIWAYAT ============== */}
      {activeTab === "riwayat" && (
        <div className="space-y-4">
          {myPeminjaman.length === 0 && (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border/80">
              <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">Belum Ada Peminjaman</h3>
              <p className="text-sm text-muted-foreground mt-1">Kamu belum pernah mengajukan peminjaman fasilitas.</p>
            </div>
          )}

          {myPeminjaman.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border/60 p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{item.namaFasilitas}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.keperluan}</p>
                </div>
                <Badge variant={getStatusPeminjamanVariant(item.status)} dot>
                  {item.status === "DISETUJUI" ? "Disetujui" : item.status === "DITOLAK" ? "Ditolak" : "Menunggu"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-primary" />{item.tanggal}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" />{item.jamMulai} - {item.jamSelesai}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-primary" />{item.organisasi}</span>
              </div>
              {item.catatan && (
                <div className={`mt-3 p-2.5 rounded-xl text-xs border ${item.status === "DISETUJUI" ? "bg-emerald-50/60 border-emerald-200/60 text-emerald-800" : item.status === "DITOLAK" ? "bg-rose-50/60 border-rose-200/60 text-rose-800" : "bg-amber-50/60 border-amber-200/60 text-amber-800"}`}>
                  <strong>Catatan Pengelola:</strong> {item.catatan}
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
