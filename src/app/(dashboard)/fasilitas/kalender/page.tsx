"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import {
  useLayananStore,
  getBookingsForDate,
  isSlotOccupied,
  generateTimeSlots,
  getTipeBadgeVariant,
} from "@/lib/layanan-store"

export default function FasilitasKalenderPage() {
  const { state, mounted } = useLayananStore()

  const [selectedFasilitasId, setSelectedFasilitasId] = useState<string>("")
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    if (!selectedFasilitasId && state.fasilitas.length > 0) {
      setSelectedFasilitasId(state.fasilitas[0].id)
    }
  }, [state.fasilitas, selectedFasilitasId])

  const activeId = selectedFasilitasId || state.fasilitas[0]?.id || ""
  const selectedFasilitas = state.fasilitas.find((f) => f.id === activeId)
  const timeSlots = generateTimeSlots()

  // Generate week dates
  const weekDates = useMemo(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7) // Monday

    const dates: { date: Date; dateStr: string; dayName: string; isToday: boolean }[] = []
    const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

    for (let i = 0; i < 6; i++) {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      const dateStr = d.toISOString().split("T")[0]
      dates.push({
        date: d,
        dateStr,
        dayName: dayNames[i],
        isToday: dateStr === today.toISOString().split("T")[0],
      })
    }
    return dates
  }, [weekOffset])

  const weekLabel = useMemo(() => {
    if (weekDates.length < 2) return ""
    const start = weekDates[0].date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
    const end = weekDates[weekDates.length - 1].date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    return `${start} - ${end}`
  }, [weekDates])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalender Ketersediaan Fasilitas"
        subtitle="Visualisasi jadwal peminjaman yang sudah disetujui untuk setiap fasilitas kampus."
      />

      {/* Facility Selector & Week Nav */}
      <div className="bg-card rounded-2xl border border-border/60 p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pilih Fasilitas</label>
            <select
              value={activeId}
              onChange={(e) => setSelectedFasilitasId(e.target.value)}
              className="w-full sm:w-96 px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {state.fasilitas.filter((f) => f.isActive).map((f) => (
                <option key={f.id} value={f.id}>{f.nama} ({f.tipe})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setWeekOffset((w) => w - 1)} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-semibold text-foreground min-w-[180px] text-center">{weekLabel}</span>
            <button onClick={() => setWeekOffset((w) => w + 1)} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground cursor-pointer">Hari Ini</button>
            )}
          </div>
        </div>

        {selectedFasilitas && (
          <div className="flex items-center gap-4 pt-2 border-t border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{selectedFasilitas.lokasi}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Kapasitas: {selectedFasilitas.kapasitas}</span>
            </div>
            <Badge variant={getTipeBadgeVariant(selectedFasilitas.tipe)} size="sm">{selectedFasilitas.tipe}</Badge>
          </div>
        )}
      </div>

      {/* Weekly Calendar Grid */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60">
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16 bg-muted/30">Jam</th>
                {weekDates.map((day) => (
                  <th key={day.dateStr} className={`px-2 py-3 text-center font-semibold min-w-[120px] ${day.isToday ? "bg-primary/5 text-primary" : "text-muted-foreground"}`}>
                    <span className="block text-xs">{day.dayName}</span>
                    <span className={`block text-sm mt-0.5 ${day.isToday ? "text-primary font-bold" : "text-foreground"}`}>
                      {day.date.getDate()}
                    </span>
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
                      const dayBookings = getBookingsForDate(state.peminjaman, selectedFasilitasId, day.dateStr)
                      const occupant = isSlotOccupied(dayBookings, hour)

                      if (occupant) {
                        // Check if this is the start slot of the booking
                        const [startH] = occupant.jamMulai.split(":").map(Number)
                        const isStart = hour === startH

                        if (isStart) {
                          const [endH] = occupant.jamSelesai.split(":").map(Number)
                          const span = endH - startH

                          return (
                            <td key={day.dateStr} rowSpan={span} className="px-1 py-1 align-top">
                              <div className={`h-full rounded-lg p-1.5 text-[10px] leading-tight ${
                                occupant.status === "DISETUJUI"
                                  ? "bg-emerald-100 border border-emerald-300 text-emerald-900"
                                  : "bg-amber-100 border border-amber-300 text-amber-900"
                              }`}>
                                <span className="font-bold block truncate">{occupant.keperluan}</span>
                                <span className="text-[9px] opacity-75 block mt-0.5">{occupant.namaMahasiswa}</span>
                                <span className="text-[9px] opacity-75 font-mono">{occupant.jamMulai}-{occupant.jamSelesai}</span>
                              </div>
                            </td>
                          )
                        }
                        // Non-start cells within a rowSpan are skipped
                        return null
                      }

                      return (
                        <td key={day.dateStr} className={`px-1 py-2 text-center ${day.isToday ? "bg-primary/[0.02]" : ""}`}>
                          <span className="text-muted-foreground/30">—</span>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-200 border border-emerald-400" />
          <span>Disetujui</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-200 border border-amber-400" />
          <span>Menunggu Konfirmasi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted border border-border" />
          <span>Slot Tersedia</span>
        </div>
      </div>
    </div>
  )
}
