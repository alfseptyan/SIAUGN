"use client"

import React, { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  PenLine,
  Save,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import {
  useAcademicStore,
  KomponenNilaiItem,
  SkalaNilaiItem,
  NilaiMahasiswaItem,
} from "@/lib/academic-store"
import {
  calculateWeightedFinalScore,
  convertScoreToGradeLetter,
} from "@/lib/academic-utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"

function DosenNilaiContent() {
  const searchParams = useSearchParams()
  const initialKelasId = searchParams.get("kelasId")

  const {
    enrichedKelas,
    state,
    getKomponenByKelas,
    getSkalaByKelas,
    saveNilaiMahasiswa,
    lockGradesForKelas,
    unlockGradesForKelas,
  } = useAcademicStore()

  // Dosen login: dos-1 (Dr. Ahmad Fauzi)
  const currentDosenId = "dos-1"
  const myClasses = enrichedKelas.filter((k) => k.dosenId === currentDosenId)

  const [selectedKelasId, setSelectedKelasId] = useState<string>(
    initialKelasId || myClasses[0]?.id || ""
  )

  useEffect(() => {
    if (initialKelasId) {
      setSelectedKelasId(initialKelasId)
    } else if (!selectedKelasId && myClasses.length > 0) {
      setSelectedKelasId(myClasses[0].id)
    }
  }, [initialKelasId, myClasses])

  const selectedKelas = enrichedKelas.find((k) => k.id === selectedKelasId)

  // Components & Scales for the selected class
  const components: KomponenNilaiItem[] = useMemo(() => {
    return selectedKelasId ? getKomponenByKelas(selectedKelasId) : []
  }, [selectedKelasId, getKomponenByKelas])

  const scales: SkalaNilaiItem[] = useMemo(() => {
    return selectedKelasId ? getSkalaByKelas(selectedKelasId) : []
  }, [selectedKelasId, getSkalaByKelas])

  // Students enrolled in this class
  const enrolledStudents = useMemo(() => {
    if (!selectedKelasId) return []
    return state.krs
      .filter((k) => k.kelasId === selectedKelasId && k.status === "DISETUJUI")
      .map((k) => ({
        krsId: k.id,
        mahasiswa: state.mahasiswa.find((m) => m.id === k.mahasiswaId),
      }))
      .filter((item) => Boolean(item.mahasiswa))
  }, [selectedKelasId, state.krs, state.mahasiswa])

  // Local editable score buffer: Record<mahasiswaId, { scores: Record<compId, number>, finalAdjusted?: number }>
  const [scoreBuffer, setScoreBuffer] = useState<
    Record<
      string,
      {
        scores: Record<string, number>
        finalAdjusted?: number
      }
    >
  >({})

  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [saveToast, setSaveToast] = useState(false)

  // Initialize buffer from store
  useEffect(() => {
    if (!selectedKelasId) return
    const initialBuf: Record<
      string,
      { scores: Record<string, number>; finalAdjusted?: number }
    > = {}

    for (const { mahasiswa } of enrolledStudents) {
      if (!mahasiswa) continue
      const existingGrade = state.nilai.find(
        (n) => n.kelasId === selectedKelasId && n.mahasiswaId === mahasiswa.id
      )
      if (existingGrade) {
        initialBuf[mahasiswa.id] = {
          scores: { ...existingGrade.scores },
          finalAdjusted: existingGrade.nilaiAkhirFinal,
        }
      } else {
        initialBuf[mahasiswa.id] = {
          scores: {},
          finalAdjusted: undefined,
        }
      }
    }
    setScoreBuffer(initialBuf)
  }, [selectedKelasId, state.nilai, enrolledStudents])

  // Check if class is locked
  const isClassLocked = useMemo(() => {
    const grades = state.nilai.filter((n) => n.kelasId === selectedKelasId)
    return grades.length > 0 && grades.every((n) => Boolean(n.lockedAt))
  }, [selectedKelasId, state.nilai])

  // Handle score change per component
  const handleScoreChange = (
    mahasiswaId: string,
    componentId: string,
    valStr: string
  ) => {
    const num = Math.min(Math.max(Number(valStr) || 0, 0), 100)
    setScoreBuffer((prev) => {
      const currentStudent = prev[mahasiswaId] || { scores: {} }
      return {
        ...prev,
        [mahasiswaId]: {
          ...currentStudent,
          scores: {
            ...currentStudent.scores,
            [componentId]: num,
          },
        },
      }
    })
  }

  // Handle manual adjustment (FR-1.9)
  const handleAdjustmentChange = (mahasiswaId: string, valStr: string) => {
    const num = valStr === "" ? undefined : Math.min(Math.max(Number(valStr) || 0, 0), 100)
    setScoreBuffer((prev) => {
      const currentStudent = prev[mahasiswaId] || { scores: {} }
      return {
        ...prev,
        [mahasiswaId]: {
          ...currentStudent,
          finalAdjusted: num,
        },
      }
    })
  }

  // Save drafts
  const handleSaveDraft = () => {
    if (!selectedKelasId) return
    for (const mhsId of Object.keys(scoreBuffer)) {
      const data = scoreBuffer[mhsId]
      saveNilaiMahasiswa(selectedKelasId, mhsId, data.scores, data.finalAdjusted)
    }
    setSaveToast(true)
    setTimeout(() => setSaveToast(false), 2500)
  }

  // Lock grades confirm (FR-1.10)
  const handleConfirmLock = () => {
    handleSaveDraft()
    lockGradesForKelas(selectedKelasId)
    setIsLockModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lembar Penilaian Mahasiswa"
        subtitle="Input skor evaluasi mahasiswa per komponen, hitung rata-rata otomatis, sesuaikan nilai final, dan kunci nilai ke KHS (FR-1.8 s/d FR-1.10)."
      />

      {/* Class Selector & Lock Status Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1 w-full md:w-auto">
          <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider">
            Pilih Kelas Ampuan:
          </label>
          <select
            value={selectedKelasId}
            onChange={(e) => setSelectedKelasId(e.target.value)}
            className="text-base font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer w-full md:w-96"
          >
            {myClasses.map((k) => (
              <option key={k.id} value={k.id}>
                {k.mataKuliah?.kode} - {k.mataKuliah?.nama} (Kelas {k.namaKelas})
              </option>
            ))}
          </select>
        </div>

        {/* Status indicator & lock actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant={isClassLocked ? "success" : "warning"}
            size="md"
            dot
          >
            {isClassLocked
              ? "Nilai Terkunci (Resmi di KHS)"
              : "Draf Terbuka (Dapat Diubah)"}
          </Badge>

          {!isClassLocked ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Save className="h-3.5 w-3.5" />}
                onClick={handleSaveDraft}
              >
                Simpan Draf
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Lock className="h-3.5 w-3.5" />}
                onClick={() => setIsLockModalOpen(true)}
              >
                Kunci Nilai (FR-1.10)
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Unlock className="h-3.5 w-3.5" />}
              onClick={() => unlockGradesForKelas(selectedKelasId)}
            >
              Buka Kunci Nilai
            </Button>
          )}
        </div>
      </div>

      {/* Locked Alert Notice */}
      {isClassLocked && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/70 rounded-xl text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <strong className="font-semibold block">
                Nilai kelas ini telah dikunci resmi!
              </strong>
              <span>
                Nilai akhir dan huruf mutu telah otomatis diterbitkan pada Kartu Hasil Studi (KHS) seluruh mahasiswa terdaftar.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Spreadsheet / Grading Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">
              Daftar Penilaian Peserta ({enrolledStudents.length} Mahasiswa)
            </span>
            <span className="text-2xs text-slate-400 font-mono">
              • Skala: {scales.map((s) => s.huruf).join(", ")}
            </span>
          </div>

          <Link
            href={`/dosen/kelas/${selectedKelasId}`}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Ubah Bobot / Skala Nilai</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {enrolledStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Belum ada mahasiswa terdaftar di kelas ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5 sticky left-0 bg-slate-50/90 backdrop-blur-xs z-10 w-60">
                    Mahasiswa
                  </th>
                  {components.map((comp) => (
                    <th
                      key={comp.id}
                      className="px-3 py-3.5 text-center whitespace-nowrap min-w-[100px]"
                    >
                      <div>{comp.nama}</div>
                      <span className="text-2xs font-mono text-emerald-700 font-bold lowercase">
                        ({comp.bobotPersen}%)
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-3.5 text-center min-w-[120px] bg-slate-100/50">
                    <div>Nilai Otomatis</div>
                    <span className="text-2xs font-normal text-slate-400">
                      (Rata-rata Berbobot)
                    </span>
                  </th>
                  <th className="px-3 py-3.5 text-center min-w-[120px] bg-emerald-50/40 text-emerald-950">
                    <div>Nilai Final (FR-1.9)</div>
                    <span className="text-2xs font-normal text-emerald-700">
                      (Penyesuaian)
                    </span>
                  </th>
                  <th className="px-4 py-3.5 text-center min-w-[90px] font-bold">
                    Huruf Mutu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolledStudents.map(({ mahasiswa }, idx) => {
                  if (!mahasiswa) return null
                  const buf = scoreBuffer[mahasiswa.id] || { scores: {} }
                  const autoScore = calculateWeightedFinalScore(buf.scores, components)
                  const finalScore =
                    buf.finalAdjusted !== undefined ? buf.finalAdjusted : autoScore
                  const gradeLetter = convertScoreToGradeLetter(finalScore, scales)

                  return (
                    <tr
                      key={mahasiswa.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Student Info (Sticky Left) */}
                      <td className="px-4 py-3 sticky left-0 bg-white hover:bg-slate-50/60 z-10">
                        <div className="font-semibold text-slate-900 text-xs">
                          {mahasiswa.nama}
                        </div>
                        <div className="text-2xs text-slate-400 font-mono">
                          {mahasiswa.nim}
                        </div>
                      </td>

                      {/* Component Inputs */}
                      {components.map((comp) => {
                        const rawScore = buf.scores[comp.id] ?? ""
                        return (
                          <td key={comp.id} className="px-2 py-2 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step="0.5"
                              disabled={isClassLocked}
                              value={rawScore}
                              placeholder="0"
                              onChange={(e) =>
                                handleScoreChange(
                                  mahasiswa.id,
                                  comp.id,
                                  e.target.value
                                )
                              }
                              className="w-16 px-1.5 py-1 text-center font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white disabled:opacity-75 disabled:bg-slate-100"
                            />
                          </td>
                        )
                      })}

                      {/* Auto Calculated Score */}
                      <td className="px-3 py-2 text-center bg-slate-50/40">
                        <span className="font-mono font-bold text-xs text-slate-800">
                          {autoScore.toFixed(1)}
                        </span>
                      </td>

                      {/* Final Adjusted Score (FR-1.9) */}
                      <td className="px-2 py-2 text-center bg-emerald-50/20">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          disabled={isClassLocked}
                          value={buf.finalAdjusted ?? ""}
                          placeholder={autoScore.toFixed(1)}
                          onChange={(e) =>
                            handleAdjustmentChange(mahasiswa.id, e.target.value)
                          }
                          className="w-20 px-2 py-1 text-center font-bold text-xs bg-white border border-emerald-300 rounded-lg text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-slate-100"
                        />
                      </td>

                      {/* Grade Letter */}
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`inline-block font-extrabold text-xs px-2.5 py-1 rounded-md ${
                            gradeLetter === "A"
                              ? "bg-emerald-100 text-emerald-800"
                              : gradeLetter === "AB"
                              ? "bg-teal-100 text-teal-800"
                              : gradeLetter === "B"
                              ? "bg-sky-100 text-sky-800"
                              : gradeLetter === "C"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {gradeLetter}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Save Notification Toast */}
      {saveToast && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Draf skor nilai berhasil disimpan ke sistem!</span>
        </motion.div>
      )}

      {/* Modal Konfirmasi Kunci Nilai (FR-1.10) */}
      <Modal
        isOpen={isLockModalOpen}
        onClose={() => setIsLockModalOpen(false)}
        title="Kunci Nilai Perkuliahan (Finalize)"
        description={`Anda akan mengunci seluruh nilai untuk kelas ${selectedKelas?.mataKuliah?.nama} (${selectedKelas?.namaKelas}).`}
        footer={
          <>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsLockModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              type="button"
              leftIcon={<Lock className="h-3.5 w-3.5" />}
              onClick={handleConfirmLock}
            >
              Ya, Kunci Nilai Sekarang
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Sesuai aturan operasional akademik (FR-1.10):
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nilai akhir dan huruf mutu akan langsung terbit pada Kartu Hasil Studi (KHS) mahasiswa.</li>
            <li>Status lembar nilai akan berubah menjadi <strong>Terkunci (Read-Only)</strong>.</li>
            <li>Perubahan nilai setelah dikunci memerlukan persetujuan revisi ulang.</li>
          </ul>
        </div>
      </Modal>
    </div>
  )
}

export default function DosenNilaiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Memuat lembar nilai...</div>}>
      <DosenNilaiContent />
    </Suspense>
  )
}
