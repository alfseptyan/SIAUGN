import { getRingkasan, ringkasanQuerySchema } from "@/server/modules/presensi"
import { getAuthUser } from "@/server/shared/auth"
import { unauthorized } from "@/server/shared/errors"
import { fail, ok } from "@/server/shared/http"
import { requireRole } from "@/server/shared/rbac"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) throw unauthorized()
    requireRole(user, "MAHASISWA")
    const { kelasId } = ringkasanQuerySchema.parse(Object.fromEntries(new URL(req.url).searchParams))
    return ok(await getRingkasan(user.userId, kelasId))
  } catch (error) {
    return fail(error)
  }
}
