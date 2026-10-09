import { z } from "zod"

export const khsQuerySchema = z.object({
  semester: z.coerce
    .number({ error: "Semester harus berupa angka." })
    .int()
    .min(1, "Semester minimal 1.")
    .max(14, "Semester maksimal 14.")
    .optional(),
})

export type KhsQuery = z.infer<typeof khsQuerySchema>
