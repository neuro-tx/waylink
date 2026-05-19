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

const itineraryDaySchema = z.object({
  dayNumber: z.number(),
  title: z.string().min(1, "Title required"),
  description: z.string().min(1, "Description required"),
  activities: z.array(z.string()).optional(),
  mealsIncluded: z.array(z.string()).optional(),
  accommodationInfo: z.string().optional(),
});

export const experienceSchema = z.object({
  experienceType: z.string().min(1, "Required"),
  difficultyLevel: z.string().optional(),
  durationCount: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be positive"),
  durationUnit: z.enum(["minutes", "hours", "days"]),
  included: z.array(z.string()).optional(),
  notIncluded: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  ageRestriction: z.string().optional(),
  itinerary: z.array(itineraryDaySchema).optional(),
});

const stopSchema = z.object({
  locationName: z.string().min(1, "Required"),
  arrivalTime: z.string().min(1, "Required"),
  departureTime: z.string().min(1, "Required"),
});

export const scheduleSchema = z.object({
  variantId: z.string().min(1, "variant Id is required"),
  label: z.string().optional(),
  departureDate: z.string().min(1, "Departure date required"),
  arrivalDate: z.string().min(1, "Arrival date required"),
  duration: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Positive number"),
  checkInTime: z.string().optional(),
  stops: z.array(stopSchema).optional(),
});

export const transportSchema = z.object({
  transportType: z.string().min(1, "Required"),
  hasDirectRoute: z.boolean().default(true),
  transportClass: z.string().optional(),
  seatType: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  luggageAllowance: z.string().optional(),
  extraLuggageFee: z.string().optional(),
  departureAddress: z.string().optional(),
  arrivalAddress: z.string().optional(),
  importantNotes: z.array(z.string()).optional(),
});

export type ProductForm = z.infer<typeof productSchema>;
export type VariantForm = z.infer<typeof variantSchema>;
export type ExperienceForm = z.infer<typeof experienceSchema>;
export type TransportForm = z.infer<typeof transportSchema>;
export type ScheduleType = z.infer<typeof scheduleSchema>;
