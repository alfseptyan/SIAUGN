/** Error aplikasi dengan status HTTP dan kode stabil, agar mudah dijadikan respons JSON. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = "AppError"
  }

  toJSON() {
    return { error: { code: this.code, message: this.message } }
  }
}

export const unauthorized = (message = "Anda belum masuk. Silakan login terlebih dahulu.") =>
  new AppError(401, "UNAUTHORIZED", message)

export const forbidden = (message = "Anda tidak memiliki akses ke sumber daya ini.") =>
  new AppError(403, "FORBIDDEN", message)

export const notFound = (message = "Data tidak ditemukan.") =>
  new AppError(404, "NOT_FOUND", message)

export const badRequest = (message = "Permintaan tidak valid.") =>
  new AppError(400, "BAD_REQUEST", message)
