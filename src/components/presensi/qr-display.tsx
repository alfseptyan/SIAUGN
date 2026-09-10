"use client"

import React, { useEffect, useState } from "react"
import QRCode from "qrcode"
import { motion } from "framer-motion"
import {
  RotateCcw,
  Clock,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Key,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface QrDisplayProps {
  payload: string
  token: string
  expirySeconds: number
  onTokenExpire: () => void
  onManualRefresh: () => void
}

export function QrDisplay({
  payload,
  token,
  expirySeconds,
  onTokenExpire,
  onManualRefresh,
}: QrDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<number>(expirySeconds)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Generate QR image on payload change
  useEffect(() => {
    QRCode.toDataURL(payload, {
      width: 380,
      margin: 2,
      color: {
        dark: "#064e3b", // Deep emerald color
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Gagal generate QR Code:", err))

    setTimeLeft(expirySeconds)
  }, [payload, expirySeconds])

  // Countdown timer loop
  useEffect(() => {
    if (timeLeft <= 0) {
      onTokenExpire()
      setTimeLeft(expirySeconds)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onTokenExpire, expirySeconds])

  const progressPercent = (timeLeft / expirySeconds) * 100

  return (
    <div
      className={`relative bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col items-center justify-between transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none p-10 flex flex-col justify-center bg-slate-950 text-white"
          : "w-full max-w-md mx-auto"
      }`}
    >
      {/* Header with Countdown & Controls */}
      <div className="w-full flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Badge
            variant="success"
            size="md"
            dot
            className={isFullscreen ? "bg-emerald-950 text-emerald-300 border-emerald-800" : ""}
          >
            Sesi Aktif
          </Badge>
          <span
            className={`text-xs font-semibold ${
              isFullscreen ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Auto-Refresh 45s
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onManualRefresh}
            title="Refresh Token Sekarang"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isFullscreen
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Keluar Fullscreen" : "Mode Proyektor Fullscreen"}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isFullscreen
                ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
        {qrDataUrl ? (
          <motion.img
            key={payload}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            src={qrDataUrl}
            alt="Presensi QR Code"
            className={`object-contain ${
              isFullscreen ? "w-80 h-80 sm:w-96 sm:h-96" : "w-64 h-64"
            }`}
          />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-xs">
            Membuat QR Code...
          </div>
        )}

        {/* Circular pulse border */}
        <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/20 pointer-events-none" />
      </div>

      {/* Timer Bar */}
      <div className="w-full mt-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span
            className={`flex items-center gap-1 ${
              isFullscreen ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-emerald-500" />
            <span>Token Berganti Dalam:</span>
          </span>
          <span
            className={`font-mono font-bold text-sm ${
              timeLeft <= 10 ? "text-rose-500 animate-pulse" : "text-emerald-600"
            }`}
          >
            00:{timeLeft.toString().padStart(2, "0")} detik
          </span>
        </div>

        <div
          className={`w-full h-2 rounded-full overflow-hidden ${
            isFullscreen ? "bg-slate-800" : "bg-slate-100"
          }`}
        >
          <motion.div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeLeft <= 10 ? "bg-rose-500" : "bg-emerald-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Manual Token Display (Fallback FR-2.2) */}
      <div
        className={`w-full mt-4 p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
          isFullscreen
            ? "bg-slate-900 border-slate-800"
            : "bg-slate-50 border-slate-200/80"
        }`}
      >
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-emerald-500 shrink-0" />
          <div className="text-left">
            <span
              className={`block text-2xs uppercase tracking-wider font-semibold ${
                isFullscreen ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Kode Token Manual
            </span>
            <span
              className={`font-mono text-xs ${
                isFullscreen ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Input alternatif jika kamera terkendala:
            </span>
          </div>
        </div>

        <span className="font-mono text-xl font-extrabold tracking-widest text-emerald-600 bg-emerald-100/50 px-3 py-1 rounded-xl border border-emerald-300/40">
          {token}
        </span>
      </div>
    </div>
  )
}
