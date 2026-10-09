import { getStatusKrs } from "@/server/modules/akademik"
import { getAuthUser } from "@/server/shared/auth"
import { unauthorized } from "@/server/shared/errors"
import { fail, ok } from "@/server/shared/http"
import { requireRole } from "@/server/shared/rbac"

export async function GET(req: Request) {
  try {
    const user = await getAuthUser(req)
    if (!user) throw unauthorized()
    requireRole(user, "MAHASISWA")
    return ok(await getStatusKrs(user.userId))
  } catch (error) {
    return fail(error)
  }
}
