"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/constants"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    nama: string
    role: UserRole
    email: string
    avatarUrl?: string | null
  }
  title?: string
  subtitle?: string
}

export function DashboardLayout({
  children,
  user,
  title,
  subtitle,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full lg:hidden"
            >
              <Sidebar user={user} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 right-[-48px] p-2 rounded-full bg-white shadow-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content - offset by sidebar width */}
      <div className={cn("lg:pl-[260px] transition-all duration-300")}>
        <Header
          user={user}
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
