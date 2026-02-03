import z from "zod";

const locationSchema = z.object({
  id: z.uuid(),
  city: z
    .string({ message: "City is required" })
    .min(1, "City cannot be empty"),
  country: z
    .string({ message: "Country is required" })
    .min(1, "Country cannot be empty"),
  latitude: z
    .number()
    .min(-90, "Latitude must be >= -90")
    .max(90, "Latitude must be <= 90"),
  longitude: z
    .number()
    .min(-180, "Longitude must be >= -180")
    .max(180, "Longitude must be <= 180"),
  slug: z.string(),
  address: z.string({ message: "Address must be a string" }).nullable(),
});

export const locationValidator = locationSchema.omit({ id: true, slug: true });

export type LocationValType = z.infer<typeof locationValidator>;
export type LocationType = z.infer<typeof locationSchema>;
