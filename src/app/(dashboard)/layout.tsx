import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import type { UserRole } from "@/lib/constants"
import { ROLE_DASHBOARD } from "@/lib/constants"

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = {
    id: session.user.id,
    nama: session.user.nama,
    role: session.user.role as UserRole,
    email: session.user.email || "",
    avatarUrl: session.user.image,
  }

  return <DashboardLayout user={user}>{children}</DashboardLayout>
}
