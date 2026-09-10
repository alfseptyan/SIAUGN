"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { ROLE_DASHBOARD } from "@/lib/constants"
import type { UserRole } from "@/lib/constants"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email atau password salah. Silakan coba lagi.")
        setIsLoading(false)
        return
      }

      // Fetch session to get role for redirect
      const sessionRes = await fetch("/api/auth/session")
      const session = await sessionRes.json()
      const role = session?.user?.role as UserRole

      if (role && ROLE_DASHBOARD[role]) {
        router.push(ROLE_DASHBOARD[role])
      } else {
        router.push("/")
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      setIsLoading(false)
    }
  }

  // Demo accounts
  const demoAccounts = [
    { label: "Admin", email: "admin@siakad.ac.id", password: "admin123" },
    { label: "Dosen", email: "dosen@siakad.ac.id", password: "dosen123" },
    { label: "Mahasiswa", email: "mahasiswa@siakad.ac.id", password: "mhs123" },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute top-1/3 -right-10 w-60 h-60 rounded-full bg-white/5" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">SIAKAD</h1>
                <p className="text-sm text-white/70">Sistem Informasi Akademik</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-4">
              Satu Platform,
              <br />
              Semua Kebutuhan
              <br />
              Akademik.
            </h2>

            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              Mengelola akademik, presensi, beasiswa, dan layanan kemahasiswaan
              dalam satu sistem terintegrasi.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            className="flex flex-wrap gap-3 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {["Akademik", "Presensi QR", "Beasiswa", "Layanan"].map(
              (feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-white/90 border border-white/10"
                >
                  {feature}
                </span>
              )
            )}
          </motion.div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50/50">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">SIAKAD</h1>
              <p className="text-xs text-muted-foreground">
                Sistem Informasi Akademik
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-8 border border-border/50">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Selamat Datang
              </h2>
              <p className="text-muted-foreground mt-1">
                Masuk ke akun Anda untuk melanjutkan
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@siakad.ac.id"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4.5 h-4.5" />
                    ) : (
                      <Eye className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 rounded-xl bg-danger-light text-danger text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Demo accounts */}
          <motion.div
            className="mt-6 bg-white rounded-2xl shadow-card p-6 border border-border/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Akun Demo
            </p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email)
                    setPassword(account.password)
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-primary-100 hover:text-primary-700 transition-all duration-200 cursor-pointer"
                >
                  {account.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
