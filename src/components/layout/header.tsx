"use client"

import { Bell, Search, Menu } from "lucide-react"
import { cn, getInitials } from "@/lib/utils"
import type { UserRole } from "@/lib/constants"
import { ROLE_LABELS } from "@/lib/constants"

interface HeaderProps {
  user: {
    nama: string
    role: UserRole
    email: string
  }
  title?: string
  subtitle?: string
  onMenuToggle?: () => void
}

export function Header({ user, title, subtitle, onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
          )}

          {/* Page title */}
          {title && (
            <div>
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border/50 w-64">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none flex-1"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-accent transition-colors cursor-pointer">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white" />
          </button>

          {/* User info (desktop) */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user.nama}</p>
              <p className="text-xs text-muted-foreground">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
            <div className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              "bg-primary-200 text-primary-800"
            )}>
              {getInitials(user.nama)}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
