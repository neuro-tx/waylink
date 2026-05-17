import z from "zod";

const locationSchema = z.object({
  id: z.string().uuid(),
  city: z.string().min(1, "City is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  type: z.enum(["start", "end"]),
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country is required"),
  latitude: z
    .string()
    .min(1, "Required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= -90 && Number(v) <= 90,
      "Must be between -90 and 90",
    ),
  longitude: z
    .string()
    .min(1, "Required")
    .refine(
      (v) => !isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180,
      "Must be between -180 and 180",
    ),
});

export const locationValidator = locationSchema.omit({ id: true, slug: true });

export type LocationValType = z.infer<typeof locationValidator>;
export type LocationType = z.infer<typeof locationSchema>;
