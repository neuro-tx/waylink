import { z } from "zod";

const optionalUrl = z
  .string()
  .url("Must be a valid URL")
  .optional()
  .or(z.literal(""));

const providerSchema = z.object({
  id: z.string().uuid().optional(),
  ownerId: z.string().min(1, "Owner ID is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),

  logo: optionalUrl,
  cover: optionalUrl,

  serviceType: z.enum(["transport", "experience"]),
  businessType: z.enum(["individual", "company", "agency"]),

  address: z.string().optional().nullable(),
  status: z
    .enum(["pending", "approved", "suspended", "inactive"])
    .optional()
    .default("pending"),
  isVerified: z.boolean().optional().default(false),
  businessPhone: z.string().optional().nullable(),
  businessEmail: z
    .string()
    .email("Invalid business email")
    .optional()
    .nullable(),
});

export const providerForm = providerSchema.omit({
  id: true,
  slug: true,
  status: true,
  ownerId: true,
});

export type providerFormType = z.infer<typeof providerForm>;
export type providerType = z.infer<typeof providerSchema>;
