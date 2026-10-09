import { z } from "zod"

export const ringkasanQuerySchema = z.object({
  kelasId: z.string().min(1, "kelasId tidak boleh kosong.").optional(),
})

export type RingkasanQuery = z.infer<typeof ringkasanQuerySchema>
