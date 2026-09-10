/**
 * Academic Utilities & Validation Engines
 * Modul 1 — Akademik Utama (FR-1.1 s/d FR-1.12)
 */

export interface TimeSlot {
  hari: string // "SENIN" | "SELASA" | "RABU" | "KAMIS" | "JUMAT" | "SABTU"
  jamMulai: string // "08:00"
  jamSelesai: string // "10:00"
}

export interface ConflictCheckResult {
  hasConflict: boolean
  type?: "RUANGAN" | "DOSEN" | "JADWAL_MAHASISWA" | "KUOTA" | "SKS" | "DUPLIKAT"
  message?: string
}

/**
 * Mengubah format jam "HH:mm" menjadi menit dari tengah malam.
 * Contoh: "08:30" -> 510
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const [hours, minutes] = timeStr.split(":").map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

/**
 * Cek apakah dua rentang waktu beririsan pada hari yang sama.
 */
export function isTimeOverlapping(
  hariA: string,
  startA: string,
  endA: string,
  hariB: string,
  startB: string,
  endB: string
): boolean {
  if (hariA.toUpperCase() !== hariB.toUpperCase()) return false
  const minStartA = timeToMinutes(startA)
  const minEndA = timeToMinutes(endA)
  const minStartB = timeToMinutes(startB)
  const minEndB = timeToMinutes(endB)

  // Overlap jika startA < endB dan endA > startB
  return minStartA < minEndB && minEndA > minStartB
}

/**
 * Validasi bentrok ruangan dan dosen saat Staff TU membuat/edit kelas (FR-1.3)
 */
export function checkKelasConflict(
  target: {
    id?: string
    ruanganId: string
    dosenId: string
    hari: string
    jamMulai: string
    jamSelesai: string
    ruanganNama?: string
    dosenNama?: string
    mataKuliahNama?: string
  },
  existingKelasList: Array<{
    id: string
    ruanganId: string
    dosenId: string
    hari: string
    jamMulai: string
    jamSelesai: string
    namaKelas: string
    ruangan?: { nama: string }
    dosen?: { nama: string }
    mataKuliah?: { nama: string }
  }>
): ConflictCheckResult {
  for (const kelas of existingKelasList) {
    // Lewatkan kelas yang sedang diedit
    if (target.id && kelas.id === target.id) continue

    const overlap = isTimeOverlapping(
      target.hari,
      target.jamMulai,
      target.jamSelesai,
      kelas.hari,
      kelas.jamMulai,
      kelas.jamSelesai
    )

    if (overlap) {
      // 1. Cek bentrok Ruangan
      if (kelas.ruanganId === target.ruanganId) {
        const rName = kelas.ruangan?.nama || "Ruangan yang dipilih"
        const mkName = kelas.mataKuliah?.nama || "Mata Kuliah lain"
        return {
          hasConflict: true,
          type: "RUANGAN",
          message: `Bentrok Ruangan: ${rName} sudah terpakai pada hari ${kelas.hari} pukul ${kelas.jamMulai} - ${kelas.jamSelesai} (${mkName} - Kelas ${kelas.namaKelas}).`,
        }
      }

      // 2. Cek bentrok Dosen
      if (kelas.dosenId === target.dosenId) {
        const dName = kelas.dosen?.nama || "Dosen yang dipilih"
        const mkName = kelas.mataKuliah?.nama || "Mata Kuliah lain"
        return {
          hasConflict: true,
          type: "DOSEN",
          message: `Bentrok Dosen: ${dName} sudah memiliki jadwal mengajar pada hari ${kelas.hari} pukul ${kelas.jamMulai} - ${kelas.jamSelesai} (${mkName} - Kelas ${kelas.namaKelas}).`,
        }
      }
    }
  }

  return { hasConflict: false }
}

/**
 * Validasi saat mahasiswa mengambil kelas di KRS (FR-1.4)
 */
export function validateStudentKrsEnrollment(
  targetKelas: {
    id: string
    mataKuliahId: string
    mataKuliahNama: string
    sks: number
    namaKelas: string
    hari: string
    jamMulai: string
    jamSelesai: string
    kuota: number
    terisi: number
  },
  enrolledKelasList: Array<{
    id: string
    mataKuliahId: string
    mataKuliahNama: string
    sks: number
    namaKelas: string
    hari: string
    jamMulai: string
    jamSelesai: string
  }>,
  maxSks = 24
): ConflictCheckResult {
  // 1. Validasi kuota kelas
  if (targetKelas.terisi >= targetKelas.kuota) {
    return {
      hasConflict: true,
      type: "KUOTA",
      message: `Kuota kelas ${targetKelas.mataKuliahNama} (${targetKelas.namaKelas}) sudah penuh (${targetKelas.terisi}/${targetKelas.kuota}).`,
    }
  }

  // 2. Validasi duplikasi mata kuliah
  const alreadyEnrolledMatkul = enrolledKelasList.find(
    (k) => k.mataKuliahId === targetKelas.mataKuliahId
  )
  if (alreadyEnrolledMatkul) {
    return {
      hasConflict: true,
      type: "DUPLIKAT",
      message: `Anda sudah mengambil mata kuliah "${targetKelas.mataKuliahNama}" pada Kelas ${alreadyEnrolledMatkul.namaKelas}.`,
    }
  }

  // 3. Validasi batas maksimal SKS
  const currentTotalSks = enrolledKelasList.reduce((acc, k) => acc + k.sks, 0)
  if (currentTotalSks + targetKelas.sks > maxSks) {
    return {
      hasConflict: true,
      type: "SKS",
      message: `Total SKS akan melebihi batas maksimal (${currentTotalSks + targetKelas.sks} > ${maxSks} SKS).`,
    }
  }

  // 4. Validasi bentrok jadwal dengan kelas yang sudah diambil
  for (const enrolled of enrolledKelasList) {
    const overlap = isTimeOverlapping(
      targetKelas.hari,
      targetKelas.jamMulai,
      targetKelas.jamSelesai,
      enrolled.hari,
      enrolled.jamMulai,
      enrolled.jamSelesai
    )

    if (overlap) {
      return {
        hasConflict: true,
        type: "JADWAL_MAHASISWA",
        message: `Jadwal bentrok: ${targetKelas.mataKuliahNama} (${targetKelas.hari} ${targetKelas.jamMulai}-${targetKelas.jamSelesai}) bertabrakan dengan ${enrolled.mataKuliahNama} (${enrolled.hari} ${enrolled.jamMulai}-${enrolled.jamSelesai}).`,
      }
    }
  }

  return { hasConflict: false }
}

/**
 * Menghitung nilai akhir otomatis berbobot (FR-1.8)
 */
export function calculateWeightedFinalScore(
  scores: Record<string, number | undefined>,
  components: Array<{ id: string; bobotPersen: number }>
): number {
  if (!components || components.length === 0) return 0
  let totalScore = 0
  let totalBobot = 0

  for (const comp of components) {
    const rawScore = scores[comp.id] ?? 0
    totalScore += rawScore * (comp.bobotPersen / 100)
    totalBobot += comp.bobotPersen
  }

  if (totalBobot === 0) return 0
  // Normalisasi jika bobot belum genap 100
  const normalized = (totalScore / totalBobot) * 100
  return Math.round(normalized * 100) / 100
}

/**
 * Konversi skor numerik ke huruf mutu berdasarkan skala kelas (FR-1.8)
 */
export function convertScoreToGradeLetter(
  score: number,
  scales: Array<{ huruf: string; skorMin: number; skorMax: number }>
): string {
  if (scales.length === 0) return "E"

  // Urutkan skala dari nilai skorMin tertinggi
  const sorted = [...scales].sort((a, b) => b.skorMin - a.skorMin)

  for (const scale of sorted) {
    if (score >= scale.skorMin && score <= scale.skorMax) {
      return scale.huruf
    }
  }

  // Fallback ke skala dengan skorMin terendah atau E
  return sorted[sorted.length - 1]?.huruf || "E"
}

/**
 * Konversi huruf mutu ke bobot indeks angka (4.0 scale)
 */
export function letterGradeToIndeks(huruf: string): number {
  switch (huruf.toUpperCase()) {
    case "A":
      return 4.0
    case "AB":
      return 3.5
    case "B":
      return 3.0
    case "BC":
      return 2.5
    case "C":
      return 2.0
    case "D":
      return 1.0
    case "E":
    default:
      return 0.0
  }
}

/**
 * Menghitung IPS / IPK otomatis (FR-1.11)
 */
export function calculateGpaFromGrades(
  courses: Array<{ sks: number; huruf?: string | null }>
): {
  gpa: number
  totalSks: number
  totalBobotSks: number
} {
  let totalSks = 0
  let totalBobotSks = 0

  for (const course of courses) {
    if (!course.huruf) continue
    const indeks = letterGradeToIndeks(course.huruf)
    totalSks += course.sks
    totalBobotSks += course.sks * indeks
  }

  const gpa = totalSks > 0 ? totalBobotSks / totalSks : 0.0
  return {
    gpa: Math.round(gpa * 100) / 100,
    totalSks,
    totalBobotSks: Math.round(totalBobotSks * 100) / 100,
  }
}

/**
 * Predikat kelulusan berdasarkan IPK kumulatif
 */
export function getPredikatKelulusan(ipk: number): string {
  if (ipk >= 3.51) return "Dengan Pujian (Cum Laude)"
  if (ipk >= 3.0) return "Sangat Memuaskan"
  if (ipk >= 2.76) return "Memuaskan"
  if (ipk >= 2.0) return "Cukup"
  return "Kurang"
}
