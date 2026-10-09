"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Printer,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  GraduationCap,
  Download,
} from "lucide-react"
import { useApi } from "@/lib/api-client"
import { ApiError, ApiLoading } from "@/components/ui/api-boundary"
import type { KhsDto } from "@/server/modules/akademik"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs } from "@/components/ui/tabs"

export default function MahasiswaNilaiPage() {
  // undefined = semester berjalan (ditentukan server)
  const [semester, setSemester] = useState<number | undefined>(undefined)
  const { data, error } = useApi<KhsDto>(
    `/api/v1/mahasiswa/khs${semester ? `?semester=${semester}` : ""}`
  )

  if (error && !data) return <ApiError message={error} />
  if (!data) return <ApiLoading />
  return <NilaiContent data={data} onSelectSemester={setSemester} />
}

function NilaiContent({
  data,
  onSelectSemester,
}: {
  data: KhsDto
  onSelectSemester: (semester: number) => void
}) {
  // Semua angka (IPS, IPK, predikat) dihitung di server memakai calculateGpaFromGrades
  const currentStudent = data.mahasiswa
  const pastCourses = data.riwayat
  const khsCourses = data.khs.mataKuliah
  const ipsResult = data.khs.ips
  const cumulativeResult = data.ipk
  const predikat = data.predikat
  const selectedSemester = data.khs.semester

  const [activeTab, setActiveTab] = useState<string>("khs")

  // Tabs
  const tabsConfig = [
    { id: "khs", label: "Kartu Hasil Studi (KHS)" },
    { id: "transkrip", label: "Transkrip Nilai Kumulatif (FR-1.12)" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="KHS & Transkrip Akademik"
        subtitle="Lihat hasil evaluasi studi resmi, kalkulasi IPS & IPK otomatis, serta unduh transkrip akademik (FR-1.10 s/d FR-1.12)."
        action={
          <Button
            variant="outline"
            leftIcon={<Printer className="h-4 w-4" />}
            onClick={() => window.print()}
          >
            Cetak Dokumen
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>IPK Kumulatif (FR-1.11)</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">
            {cumulativeResult.gpa.toFixed(2)}
          </div>
          <p className="text-2xs text-slate-400 mt-1.5 font-medium">
            Skala 4.00 • {predikat}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>IPS Semester {selectedSemester}</span>
            <GraduationCap className="h-4 w-4 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {ipsResult.gpa > 0 ? ipsResult.gpa.toFixed(2) : "-"}
          </div>
          <p className="text-2xs text-slate-400 mt-1.5 font-medium">
            {ipsResult.totalSks} SKS Terhitung
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Total SKS Lulus</span>
            <BookOpen className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">
            {cumulativeResult.totalSks}{" "}
            <span className="text-sm font-normal text-slate-400">/ 144 SKS</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full"
              style={{
                width: `${Math.min((cumulativeResult.totalSks / 144) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Predikat Akademik</span>
            <Award className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-base font-bold text-slate-900 leading-tight">
            {predikat}
          </div>
          <p className="text-2xs text-emerald-600 font-semibold mt-2">
            Status Mahasiswa: AKTIF
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs items={tabsConfig} activeId={activeTab} onChange={setActiveTab} />

      {/* TAB 1: KHS (Kartu Hasil Studi) */}
      {activeTab === "khs" && (
        <div className="space-y-4">
          {/* Semester Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Semester KHS:
              </span>
              <select
                value={selectedSemester}
                onChange={(e) => onSelectSemester(Number(e.target.value))}
                className="text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {[...data.khs.semesterTersedia].reverse().map((n) => (
                  <option key={n} value={n}>
                    Semester {n}
                    {n === currentStudent.semesterSekarang
                      ? " (Berjalan)"
                      : ` (${pastCourses.find((c) => c.semesterAmbil === n)?.periodeNama ?? "-"})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Formula IPS:{" "}
              <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">
                Σ(SKS × Bobot) / Σ(SKS)
              </code>
            </div>
          </div>

          {/* KHS Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden print:border-none print:shadow-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5 w-12 text-center">No</th>
                    <th className="px-6 py-3.5">Kode MK</th>
                    <th className="px-6 py-3.5">Mata Kuliah</th>
                    <th className="px-6 py-3.5 text-center">SKS</th>
                    <th className="px-6 py-3.5 text-center">Nilai Angka</th>
                    <th className="px-6 py-3.5 text-center">Huruf Mutu</th>
                    <th className="px-6 py-3.5 text-center">Bobot Indeks</th>
                    <th className="px-6 py-3.5 text-center">SKS × Indeks</th>
                    <th className="px-6 py-3.5 text-center">Status (FR-1.10)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {khsCourses.map((c, idx) => {
                    const sksBobot = c.isLocked ? c.sks * c.bobotIndeks : null

                    return (
                      <tr
                        key={c.id || idx}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-6 py-4 text-center text-xs text-slate-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-emerald-800">
                          {c.kodeMk}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {c.namaMk}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-800">
                          {c.sks}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-xs text-slate-700">
                          {c.isLocked && c.nilaiAkhir !== null && c.nilaiAkhir !== undefined
                            ? c.nilaiAkhir.toFixed(1)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {c.isLocked && c.nilaiHuruf ? (
                            <span className="inline-block font-extrabold text-xs px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              {c.nilaiHuruf}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">
                              Belum Terbit
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-xs font-bold text-slate-800">
                          {c.isLocked && c.nilaiHuruf
                            ? c.bobotIndeks.toFixed(1)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-center font-mono text-xs font-bold text-slate-800">
                          {sksBobot !== null ? sksBobot.toFixed(1) : "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            variant={c.isLocked ? "success" : "neutral"}
                            size="sm"
                            dot
                          >
                            {c.isLocked ? "Resmi Terkunci" : "Penilaian Dosen"}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-xs">
                      Total Semester Ini:
                    </td>
                    <td className="px-6 py-3 text-center text-xs text-emerald-800 font-extrabold">
                      {ipsResult.totalSks} SKS
                    </td>
                    <td colSpan={3} className="px-6 py-3 text-right text-xs">
                      Total Bobot (Σ SKS × N):
                    </td>
                    <td className="px-6 py-3 text-center text-xs font-extrabold">
                      {ipsResult.totalBobotSks.toFixed(1)}
                    </td>
                    <td className="px-6 py-3 text-center text-xs text-emerald-800 font-extrabold">
                      IPS: {ipsResult.gpa > 0 ? ipsResult.gpa.toFixed(2) : "-"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Official Transcript (FR-1.12) */}
      {activeTab === "transkrip" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-8 print:p-0 print:border-none print:shadow-none">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
                S
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  UNIVERSITAS SIAKAD TERPADU
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Jl. Pendidikan No. 123, Kampus Terpadu • Website: siakad.ac.id
                </p>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
                  TRANSKRIP AKADEMIK SEMENTARA (KUMULATIF)
                </p>
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5 font-medium text-slate-600">
              <div>Tanggal Cetak: {new Date().toLocaleDateString("id-ID")}</div>
              <div className="font-mono text-2xs text-slate-400">
                DOC-ID: TR-{currentStudent?.nim}-{Date.now().toString().slice(-6)}
              </div>
            </div>
          </div>

          {/* Student Identitas Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Nama Mahasiswa</span>
              <strong className="text-slate-900 font-bold text-sm">
                {currentStudent?.nama}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Nomor Induk Mahasiswa</span>
              <strong className="text-slate-900 font-mono font-bold text-sm">
                {currentStudent?.nim}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Program Studi</span>
              <strong className="text-slate-900 font-bold text-sm">
                {currentStudent?.programStudi}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Angkatan / Status</span>
              <strong className="text-slate-900 font-bold text-sm">
                {currentStudent?.angkatan} / AKTIF
              </strong>
            </div>
          </div>

          {/* Transcript Course Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 w-10 text-center">No</th>
                  <th className="px-4 py-2.5 w-24">Kode MK</th>
                  <th className="px-4 py-2.5">Nama Mata Kuliah</th>
                  <th className="px-4 py-2.5 text-center w-16">SKS</th>
                  <th className="px-4 py-2.5 text-center w-20">Huruf</th>
                  <th className="px-4 py-2.5 text-center w-20">Indeks</th>
                  <th className="px-4 py-2.5 text-center w-24">SKS × Indeks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastCourses.map((c, idx) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 font-mono font-semibold text-emerald-800">
                      {c.kodeMk}
                    </td>
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {c.namaMk}
                    </td>
                    <td className="px-4 py-2 text-center font-bold text-slate-800">
                      {c.sks}
                    </td>
                    <td className="px-4 py-2 text-center font-bold text-emerald-700">
                      {c.nilaiHuruf}
                    </td>
                    <td className="px-4 py-2 text-center font-mono">
                      {c.bobotIndeks.toFixed(1)}
                    </td>
                    <td className="px-4 py-2 text-center font-mono font-bold">
                      {(c.sks * c.bobotIndeks).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transcript Cumulative Summary & Signature Slot */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs">
            <div className="space-y-1.5 p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/50">
              <div>
                Total SKS Kumulatif Lulus:{" "}
                <strong className="text-slate-900 text-sm">
                  {cumulativeResult.totalSks} SKS
                </strong>
              </div>
              <div>
                Indeks Prestasi Kumulatif (IPK):{" "}
                <strong className="text-emerald-700 text-base font-extrabold">
                  {cumulativeResult.gpa.toFixed(2)}
                </strong>
              </div>
              <div>
                Predikat Kelulusan:{" "}
                <strong className="text-slate-900">{predikat}</strong>
              </div>
            </div>

            {/* Signature block for official print */}
            <div className="text-center space-y-1 sm:text-right pr-6">
              <p className="text-slate-500">
                Kota Akademik, {new Date().toLocaleDateString("id-ID")}
              </p>
              <p className="font-semibold text-slate-800">
                Ketua Program Studi Teknik Informatika
              </p>
              <div className="h-14 flex items-center justify-center sm:justify-end">
                <span className="text-xs font-mono text-emerald-800 font-bold border-b border-dashed border-emerald-600 pb-0.5">
                  [ Tanda Tangan Digital Tersertifikasi ]
                </span>
              </div>
              <p className="font-bold text-slate-900">Dr. Ahmad Fauzi, M.Kom.</p>
              <p className="text-2xs text-slate-400 font-mono">
                NIDN. 0412038501
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
