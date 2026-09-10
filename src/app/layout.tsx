import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "SIAKAD — Sistem Informasi Akademik",
    template: "%s | SIAKAD",
  },
  description:
    "Sistem Informasi Akademik Terintegrasi — Mengelola akademik, presensi, beasiswa, dan layanan kemahasiswaan dalam satu platform.",
  keywords: ["siakad", "akademik", "universitas", "sistem informasi"],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
