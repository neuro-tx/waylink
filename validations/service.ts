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

export const variantSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  capacity: z
    .string()
    .min(1, "Required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) > 0 && Number.isInteger(Number(v)),
      "Must be a positive whole number",
    ),
  status: z.enum(["available", "sold_out", "cancelled"]).default("available"),
  adultPrice: z
    .string()
    .min(1, "Required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0,
      "Must be a valid number",
    ),
  childPrice: z
    .string()
    .min(1, "Required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= 0,
      "Must be a valid number",
    ),
  infantPrice: z.string().default("0.00"),
});

export type ProductForm = z.infer<typeof productSchema>;
export type VariantForm = z.infer<typeof variantSchema>;
