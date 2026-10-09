import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { ROLE_DASHBOARD } from "@/lib/constants"
import { isAllowedRoute } from "@/server/shared/rbac"

const PUBLIC_ROUTES = ["/", "/login"]

// Pemeriksaan optimistis berbasis cookie sesi; otorisasi sebenarnya tetap di service/route handler.
export default auth((req) => {
  const { pathname } = req.nextUrl

  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next()

  if (!req.auth?.user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  const { role } = req.auth.user
  if (!isAllowedRoute(role, pathname)) {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[role] ?? "/login", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Lewati: api/auth, api/v1 (diautentikasi lewat getAuthUser di route handler),
     * aset _next, file metadata, dan berkas gambar statis di /public.
     */
    "/((?!api/auth|api/v1|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
