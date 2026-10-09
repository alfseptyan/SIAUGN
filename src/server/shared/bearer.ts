import { jwtVerify } from "jose"

import type { UserRole } from "@/lib/constants"

const ROLES: readonly string[] = [
  "SUPER_ADMIN",
  "DOSEN",
  "MAHASISWA",
  "DIREKTORAT_KEMAHASISWAAN",
  "PENGELOLA_FASILITAS",
  "MITRA_BEASISWA",
]

/**
 * Verifikasi JWT Bearer (HS256) dengan AUTH_SECRET.
 * Token harus memuat `sub` (id user) dan `role`. Mengembalikan null bila tidak valid.
 */
export async function verifyBearerToken(
  token: string,
  secret: string | undefined = process.env.AUTH_SECRET
): Promise<{ userId: string; role: UserRole } | null> {
  if (!secret) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    })
    const { sub, role } = payload
    if (typeof sub !== "string" || typeof role !== "string" || !ROLES.includes(role)) {
      return null
    }
    return { userId: sub, role: role as UserRole }
  } catch {
    return null
  }
}
