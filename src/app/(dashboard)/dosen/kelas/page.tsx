"use client"

import React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  BookOpen,
  Calendar,
  Clock,
  DoorOpen,
  Users,
  Settings,
  PenLine,
  Lock,
  GraduationCap,
} from "lucide-react"
import { useAcademicStore } from "@/lib/academic-store"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DosenKelasListPage() {
  const { state, activePeriode, enrichedKelas } = useAcademicStore()

  // Dosen logged in: Dr. Ahmad Fauzi (dos-1)
  const currentDosenId = "dos-1"
  const myClasses = enrichedKelas.filter((k) => k.dosenId === currentDosenId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelas Perkuliahan Saya"
        subtitle={`Daftar kelas yang Anda ampu pada ${activePeriode?.nama || "Semester Ini"}. Atur komponen bobot nilai dan skala konversi per kelas.`}
        action={
          <Link href="/dosen/nilai">
            <Button variant="primary" leftIcon={<PenLine className="h-4 w-4" />}>
              Input Nilai Mahasiswa
            </Button>
          </Link>
        }
      />

      {/* Grid of Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myClasses.map((kelas, idx) => {
          const terisi = kelas.terisi || 0
          const classGrades = state.nilai.filter((n) => n.kelasId === kelas.id)
          const isLocked =
            classGrades.length > 0 && classGrades.every((g) => Boolean(g.lockedAt))

          return (
            <motion.div
              key={kelas.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        {kelas.mataKuliah?.kode}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                        Kelas {kelas.namaKelas}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {kelas.mataKuliah?.nama}
                    </h3>
                  </div>

                  <Badge
                    variant={
                      isLocked ? "success" : classGrades.length > 0 ? "warning" : "neutral"
                    }
                    size="sm"
                    dot
                  >
                    {isLocked
                      ? "Nilai Terkunci"
                      : classGrades.length > 0
                      ? "Draf Nilai"
                      : "Belum Dinilai"}
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      {kelas.hari}, {kelas.jamMulai} - {kelas.jamSelesai}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <DoorOpen className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>{kelas.ruangan?.nama}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>
                      <strong className="text-slate-900">{terisi}</strong> dari{" "}
                      {kelas.kuota} Mahasiswa
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <GraduationCap className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Min. Kehadiran: {kelas.ambangKehadiranPersen}%</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 flex items-center justify-between gap-3 mt-4">
                <Link
                  href={`/dosen/kelas/${kelas.id}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    leftIcon={<Settings className="h-3.5 w-3.5" />}
                  >
                    Setup Komponen & Skala
                  </Button>
                </Link>

                <Link
                  href={`/dosen/nilai?kelasId=${kelas.id}`}
                  className="flex-1"
                >
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    leftIcon={<PenLine className="h-3.5 w-3.5" />}
                  >
                    Input Nilai
                  </Button>
                </Link>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
