import { auth } from "@/lib/auth"
import type { UserRole } from "@/lib/constants"
import { db } from "./db"
import { verifyBearerToken } from "./bearer"

export interface AuthUser {
  userId: string
  role: UserRole
  mahasiswaId?: string
  dosenId?: string
}

/**
 * Identitas user dari server: header `Authorization: Bearer <jwt>` bila ada,
 * jika tidak dari cookie sesi NextAuth. Tidak pernah dari body/parameter request.
 * Role dan profil dibaca dari database sehingga user nonaktif/terhapus ditolak.
 */
export async function getAuthUser(req?: Request): Promise<AuthUser | null> {
  const header = req?.headers.get("authorization")
  let claims: { userId: string; role: UserRole } | null = null

  if (header) {
    const [scheme, token] = header.split(" ")
    if (scheme?.toLowerCase() !== "bearer" || !token) return null
    claims = await verifyBearerToken(token)
  } else {
    const session = await auth()
    if (session?.user?.id) {
      claims = { userId: session.user.id, role: session.user.role }
    }
  }
  if (!claims) return null

  const user = await db.user.findUnique({
    where: { id: claims.userId },
    select: {
      isActive: true,
      role: true,
      mahasiswa: { select: { id: true } },
      dosen: { select: { id: true } },
    },
  })
  if (!user || !user.isActive) return null

  return {
    userId: claims.userId,
    role: user.role,
    mahasiswaId: user.mahasiswa?.id,
    dosenId: user.dosen?.id,
  }
}
