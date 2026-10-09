"use client"

import { useEffect, useState } from "react"

interface ApiState<T> {
  url: string
  data?: T
  error?: string
  /** Data terakhir yang berhasil dimuat, dipertahankan saat URL berganti (mis. ganti semester). */
  last?: T
}

/** Membaca respons standar API: { data } atau { error: { code, message } }. */
export async function fetchApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "same-origin" })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(body?.error?.message ?? "Gagal memuat data dari server.")
  }
  return body.data as T
}

/** Hook GET sederhana untuk komponen klien. `loading` true selama data untuk `url` ini belum tiba. */
export function useApi<T>(url: string) {
  const [state, setState] = useState<ApiState<T>>({ url: "" })

  useEffect(() => {
    let cancelled = false
    fetchApi<T>(url)
      .then((data) => {
        if (!cancelled) setState({ url, data, last: data })
      })
      .catch((e: Error) => {
        if (!cancelled) setState((s) => ({ url, error: e.message, last: s.last }))
      })
    return () => {
      cancelled = true
    }
  }, [url])

  const current = state.url === url
  return {
    data: current ? (state.data ?? state.last) : state.last,
    error: current ? state.error : undefined,
    loading: !current,
  }
}
