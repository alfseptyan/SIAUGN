import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ROLE_DASHBOARD } from "@/lib/constants"
import type { UserRole } from "@/lib/constants"

export default async function HomePage() {
  const session = await auth()

  if (session?.user) {
    const role = session.user.role as UserRole
    redirect(ROLE_DASHBOARD[role] || "/login")
  }

  redirect("/login")
}
