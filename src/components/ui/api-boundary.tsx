"use client"

import { AlertTriangle, Info } from "lucide-react"
import { useApi } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"

export function ApiError({ message }: { message: string }) {
  return (
    <div className="p-4 rounded-2xl border bg-rose-50 border-rose-200 text-rose-900 flex items-start gap-3 text-sm">
      <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
      <div>
        <strong className="font-bold block">Gagal memuat data</strong>
        <span>{message}</span>
      </div>
    </div>
  )
}

export function ApiLoading() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

/** Memuat data dari `url`, menampilkan skeleton/error, lalu merender `children(data)`. */
export function ApiBoundary<T>({
  url,
  children,
}: {
  url: string
  children: (data: T) => React.ReactNode
}) {
  const { data, error } = useApi<T>(url)
  if (error && !data) return <ApiError message={error} />
  if (!data) return <ApiLoading />
  return <>{children(data)}</>
}

/** Pengingat sementara: data dibaca dari database, sedangkan aksi tulis masih lewat store lokal. */
export function BannerModeTransisi() {
  return (
    <div className="p-3 rounded-xl border bg-amber-50 border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
      <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
      <span>
        <strong>Mode transisi:</strong> data ditampilkan dari database. Aksi simpan/ajukan pada halaman ini masih
        tersimpan sementara di perangkat dan belum muncul pada daftar sampai jalur tulis dipindahkan.
      </span>
    </div>
  )
}
