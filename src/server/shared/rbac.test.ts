import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { AppError } from "./errors"
import { isAllowedRoute, requireRole } from "./rbac"

describe("isAllowedRoute", () => {
  it("mengizinkan route milik role sendiri", () => {
    assert.equal(isAllowedRoute("MAHASISWA", "/mahasiswa"), true)
    assert.equal(isAllowedRoute("MAHASISWA", "/mahasiswa/krs"), true)
    assert.equal(isAllowedRoute("DOSEN", "/dosen/kelas/k1"), true)
  })

  it("menolak route milik role lain", () => {
    assert.equal(isAllowedRoute("MAHASISWA", "/admin"), false)
    assert.equal(isAllowedRoute("MAHASISWA", "/admin/krs"), false)
    assert.equal(isAllowedRoute("DOSEN", "/mahasiswa"), false)
  })

  it("tidak tertipu prefix yang mirip", () => {
    assert.equal(isAllowedRoute("MAHASISWA", "/mahasiswa-palsu"), false)
  })
})

describe("requireRole", () => {
  const user = { userId: "u1", role: "MAHASISWA" as const }

  it("lolos bila role cocok", () => {
    assert.doesNotThrow(() => requireRole(user, "MAHASISWA", "DOSEN"))
  })

  it("melempar AppError 403 bila role tidak cocok", () => {
    assert.throws(
      () => requireRole(user, "SUPER_ADMIN"),
      (e) => e instanceof AppError && e.status === 403 && e.code === "FORBIDDEN"
    )
  })
})
