"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  DoorOpen,
  User,
  LayoutGrid,
  List,
  BookOpen,
} from "lucide-react"
import { ApiBoundary } from "@/components/ui/api-boundary"
import type { JadwalDto, KelasDto } from "@/server/modules/akademik"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const DAYS = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"]

export default function MahasiswaJadwalPage() {
  return (
    <ApiBoundary<JadwalDto> url="/api/v1/mahasiswa/jadwal">
      {(data) => <JadwalContent data={data} />}
    </ApiBoundary>
  )
}

function JadwalContent({ data }: { data: JadwalDto }) {
  const activePeriode = data.periode
  const [viewMode, setViewMode] = useState<"TIMETABLE" | "LIST">("TIMETABLE")

  // Kelas yang diambil (KRS disetujui) pada periode aktif, dari database
  const myClasses: KelasDto[] = data.kelas

  // Group classes by day
  const classesByDay = useMemo(() => {
    const map: Record<string, KelasDto[]> = {}
    for (const day of DAYS) {
      map[day] = myClasses.filter((c) => c.hari.toUpperCase() === day)
    }
    return map
  }, [myClasses])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Perkuliahan Mingguan"
        subtitle={`Jadwal tatap muka perkuliahan semester aktif ${activePeriode?.nama || ""}.`}
        action={
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("TIMETABLE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "TIMETABLE"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kalender Mingguan</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "LIST"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Daftar Card</span>
            </button>
          </div>
        }
      />

      {/* VIEW 1: Weekly Timetable Grid */}
      {viewMode === "TIMETABLE" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {DAYS.map((day) => {
            const classesOnThisDay = classesByDay[day] || []
            const isToday =
              new Date()
                .toLocaleDateString("id-ID", { weekday: "long" })
                .toUpperCase() === day

            return (
              <div
                key={day}
                className={`rounded-2xl border p-4 flex flex-col min-h-[380px] ${
                  isToday
                    ? "bg-emerald-50/40 border-emerald-300/80 shadow-xs"
                    : "bg-white border-slate-200/80 shadow-xs"
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <span className="font-bold text-xs tracking-wider text-slate-800 uppercase">
                    {day}
                  </span>
                  {isToday ? (
                    <span className="text-2xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Hari Ini
                    </span>
                  ) : (
                    <span className="text-2xs text-slate-400 font-medium">
                      {classesOnThisDay.length} Kelas
                    </span>
                  )}
                </div>

                {/* Day Classes */}
                <div className="space-y-3 flex-1">
                  {classesOnThisDay.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-slate-400 text-xs py-10">
                      Tidak ada jadwal perkuliahan
                    </div>
                  ) : (
                    classesOnThisDay.map((c) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-2xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {c.mataKuliah?.kode}
                          </span>
                          <span className="text-2xs font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            Kelas {c.namaKelas}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                          {c.mataKuliah?.nama}
                        </h4>

                        <div className="space-y-1 text-2xs text-slate-500 pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-slate-700 font-semibold">
                            <Clock className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>
                              {c.jamMulai} - {c.jamSelesai}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DoorOpen className="h-3 w-3 text-teal-600 shrink-0" />
                            <span>{c.ruangan?.nama}</span>
                          </div>
                          <div className="flex items-center gap-1 line-clamp-1">
                            <User className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{c.dosen?.nama}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* VIEW 2: Detailed Card List */}
      {viewMode === "LIST" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myClasses.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {c.mataKuliah?.kode}
                  </span>
                  <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    Kelas {c.namaKelas}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    • {c.mataKuliah?.sks} SKS
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {c.mataKuliah?.nama}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {c.hari}, {c.jamMulai} - {c.jamSelesai}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DoorOpen className="h-3.5 w-3.5 text-teal-600" />
                    <span>{c.ruangan?.nama}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-slate-500">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Dosen: {c.dosen?.nama}</span>
                  </div>
                </div>
              </div>

              <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full shrink-0">
                Terjadwal
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
