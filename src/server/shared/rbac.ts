import { ROLE_MENUS, type UserRole } from "@/lib/constants"
import type { AuthUser } from "./auth"
import { forbidden } from "./errors"

/**
 * Prefix route yang boleh diakses tiap role, diturunkan dari ROLE_MENUS
 * (segmen pertama setiap href menu), jadi tidak ada daftar kedua yang perlu dirawat.
 */
export const ROLE_ROUTE_PREFIXES: Record<UserRole, string[]> = Object.fromEntries(
  (Object.keys(ROLE_MENUS) as UserRole[]).map((role) => [
    role,
    [...new Set(ROLE_MENUS[role].map((item) => `/${item.href.split("/")[1]}`))],
  ])
) as Record<UserRole, string[]>

export function isAllowedRoute(role: UserRole, path: string): boolean {
  const pathname = path.split(/[?#]/)[0]
  return ROLE_ROUTE_PREFIXES[role].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

/** Melempar AppError 403 bila user tidak memiliki salah satu role yang diminta. */
export function requireRole(user: AuthUser, ...roles: UserRole[]): void {
  if (!roles.includes(user.role)) {
    throw forbidden()
  }
}
