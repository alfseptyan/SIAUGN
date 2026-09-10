"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  ClipboardList,
  QrCode,
  Award,
  Building2,
  PenLine,
} from "lucide-react"

const typeIcons = {
  krs: ClipboardList,
  presensi: QrCode,
  beasiswa: Award,
  fasilitas: Building2,
  nilai: PenLine,
}

const typeColors = {
  krs: "bg-blue-100 text-blue-600",
  presensi: "bg-emerald-100 text-emerald-600",
  beasiswa: "bg-amber-100 text-amber-600",
  fasilitas: "bg-cyan-100 text-cyan-600",
  nilai: "bg-purple-100 text-purple-600",
}

interface Activity {
  id: string
  text: string
  time: string
  type: "krs" | "presensi" | "beasiswa" | "fasilitas" | "nilai"
}

interface ActivityFeedProps {
  activities: Activity[]
  title?: string
}

export function ActivityFeed({
  activities,
  title = "Aktivitas Terbaru",
}: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-card rounded-2xl border border-border/50 shadow-card"
    >
      <div className="px-6 py-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="divide-y divide-border/30">
        {activities.map((activity, index) => {
          const Icon =
            typeIcons[activity.type] || ClipboardList
          const colorClass =
            typeColors[activity.type] || "bg-gray-100 text-gray-600"

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-start gap-3 px-6 py-4 hover:bg-muted/30 transition-colors"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  colorClass
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.time}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
