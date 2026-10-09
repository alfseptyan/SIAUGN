import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { AppError } from "./errors"

/** Respons sukses: { data }. Bentuk JSON ini stabil dan dipakai juga oleh aplikasi mobile. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init)
}

/** Respons gagal: { error: { code, message } } dengan status HTTP yang sesuai. */
export function fail(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.status })
  }
  if (error instanceof ZodError) {
    const message = error.issues.map((i) => i.message).join("; ") || "Input tidak valid."
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 })
  }
  console.error(error)
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." } },
    { status: 500 }
  )
}
