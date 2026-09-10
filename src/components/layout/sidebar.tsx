"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap,
  ChevronLeft,
  LogOut,
  LayoutDashboard,
  BookOpen,
  DoorOpen,
  Calendar,
  ClipboardList,
  BarChart3,
  Users,
  QrCode,
  PenLine,
  FileText,
  Award,
  Building2,
  FileEdit,
  CheckCircle,
  CalendarCheck,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn, getInitials } from "@/lib/utils"
import { ROLE_MENUS, ROLE_LABELS } from "@/lib/constants"
import type { UserRole, MenuItem } from "@/lib/constants"

// Map icon name string to actual component
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
  DoorOpen,
  Calendar,
  GraduationCap,
  ClipboardList,
  BarChart3,
  Users,
  QrCode,
  PenLine,
  FileText,
  Award,
  Building2,
  FileEdit,
  CheckCircle,
  CalendarCheck,
}

interface SidebarProps {
  user: {
    nama: string
    role: UserRole
    email: string
    avatarUrl?: string | null
  }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const menuItems = ROLE_MENUS[user.role] || []

  const isActive = (href: string) => {
    if (href === `/${pathname.split("/")[1]}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <h1 className="text-lg font-bold text-foreground whitespace-nowrap">
                SIAKAD
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "ml-auto p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
            isCollapsed && "ml-0 mt-0"
          )}
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isCollapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item: MenuItem) => {
            const Icon = iconMap[item.icon] || LayoutDashboard
            const active = isActive(item.href)

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  {/* Active indicator */}
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-sidebar-primary"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}

                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-colors",
                      active
                        ? "text-sidebar-primary"
                        : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )}
                  />

                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Badge */}
                  {item.badge && !isCollapsed && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User profile */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl",
            isCollapsed && "justify-center px-0"
          )}
        >
          <div className="w-9 h-9 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 text-sm font-bold shrink-0">
            {getInitials(user.nama)}
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 overflow-hidden min-w-0"
              >
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.nama}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {ROLE_LABELS[user.role]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isCollapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg hover:bg-danger-light text-muted-foreground hover:text-danger transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
