import z from "zod";

export const productSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be under 120 characters"),
  description: z.string().optional(),
  shortDescription: z
    .string()
    .max(160, "Must be under 160 characters")
    .optional(),
  basePrice: z
    .string()
    .min(1, "Base price is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Must be a valid positive number",
    ),
  currency: z.string().default("USD"),
});

export type ProductForm = z.infer<typeof productSchema>;
