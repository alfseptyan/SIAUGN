import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { SignJWT } from "jose"

import { verifyBearerToken } from "./bearer"

const SECRET = "rahasia-uji-minimal-32-karakter-xxxxxxxx"
const key = new TextEncoder().encode(SECRET)

const sign = (claims: Record<string, unknown>, sub = "usr-1", exp = "1h", secretKey = key) =>
  new SignJWT(claims).setProtectedHeader({ alg: "HS256" }).setSubject(sub).setExpirationTime(exp).sign(secretKey)

describe("verifyBearerToken", () => {
  it("menerima token valid", async () => {
    const token = await sign({ role: "MAHASISWA" })
    assert.deepEqual(await verifyBearerToken(token, SECRET), { userId: "usr-1", role: "MAHASISWA" })
  })

  it("menolak token yang ditandatangani secret lain", async () => {
    const token = await sign({ role: "MAHASISWA" }, "usr-1", "1h", new TextEncoder().encode("secret-lain-yang-berbeda-xxxxxxxxxxxx"))
    assert.equal(await verifyBearerToken(token, SECRET), null)
  })

  it("menolak token kedaluwarsa", async () => {
    const token = await sign({ role: "MAHASISWA" }, "usr-1", "-1h")
    assert.equal(await verifyBearerToken(token, SECRET), null)
  })

  it("menolak role tidak dikenal atau claim kurang", async () => {
    assert.equal(await verifyBearerToken(await sign({ role: "HACKER" }), SECRET), null)
    assert.equal(await verifyBearerToken(await sign({}), SECRET), null)
  })

  it("menolak token sampah dan secret kosong", async () => {
    assert.equal(await verifyBearerToken("bukan.jwt.valid", SECRET), null)
    assert.equal(await verifyBearerToken(await sign({ role: "DOSEN" }), ""), null)
  })
})
