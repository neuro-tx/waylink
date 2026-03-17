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

export type WishlistFormValues = z.infer<typeof wishlistFormSchema>;
