import z from "zod";

export const wishlistFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Wishlist name is required")
    .max(80, "Wishlist name must be 80 characters or less"),

  description: z
    .string()
    .trim()
    .max(200, "Description must be 200 characters or less")
    .optional(),

  isPrivate: z.boolean().default(false),

  color: z
    .string()
    .trim()
    .regex(/^#([0-9A-Fa-f]{6})$/, "Color must be a valid hex color")
    .default("#e8734a"),
});

export const banSchema = z
  .object({
    reason: z.string().min(1, "Reason is required"),
    duration: z
      .string()
      .trim()
      .min(1, "Duration is required")
      .refine((v) => /^\d+$/.test(v), {
        message: "Duration must be a whole number",
      })
      .refine((v) => Number(v) > 0, {
        message: "Duration must be greater than 0",
      })
      .optional(),
    unit: z.enum(["m", "h", "d", "w", "mo"]).optional(),
    detail: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const hasDuration = data.duration !== undefined;
    const hasUnit = data.unit !== undefined;

    if (!hasDuration && !hasUnit) {
      return;
    }

    if (Number(data.duration) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["duration"],
        message: "Duration must be greater than 0.",
      });
    }
  });

export type BanSchema = z.infer<typeof banSchema>;
export type WishlistFormValues = z.infer<typeof wishlistFormSchema>;
