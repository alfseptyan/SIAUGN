import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format angka ke string dengan separator ribuan Indonesia
 * e.g. 1000 -> "1.000"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num)
}

/**
 * Format tanggal ke format Indonesia
 * e.g. "10 September 2026"
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

/**
 * Format tanggal dan waktu ke format Indonesia
 * e.g. "10 September 2026, 15:30"
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

/**
 * Truncate string to specified length with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

/**
 * Generate initials from a name
 * e.g. "Ahmad Septyan" -> "AS"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
