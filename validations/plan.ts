import { z } from "zod";

export const planTierValues = [
  "business",
  "enterprise",
  "free",
  "pro",
] as const;

export const billingCycleValues = ["monthly", "yearly"] as const;

export const planSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Plan name is required")
      .max(100, "Plan name is too long"),

    tier: z.enum(planTierValues),
    price: z
      .number({
        error: "Price is required",
      })
      .int("Price must be a whole number")
      .min(0, "Price cannot be negative"),
    isFree: z.boolean().default(false),
    priorityBoost: z.coerce
      .number()
      .min(0, "Priority boost cannot be negative")
      .max(9.99, "Priority boost cannot exceed 9.99")
      .default(1),
    featuredInSearch: z.boolean().default(false),
    badgeLabel: z
      .string()
      .trim()
      .max(100, "Badge label is too long")
      .nullable()
      .optional(),
    billingCycle: z.enum(billingCycleValues).default("monthly"),
    commissionRate: z.coerce
      .number()
      .min(0, "Commission rate cannot be negative")
      .max(50.0, "Commission rate cannot exceed 50.00"),
    maxListings: z
      .number()
      .int("Max listings must be a whole number")
      .positive("Max listings must be greater than 0")
      .nullable()
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, "Description is too long")
      .nullable()
      .optional(),
    isActive: z.boolean().default(true),
    highlights: z
      .array(z.string().trim().min(1, "Highlight cannot be empty"))
      .default([]),
    trialEnabled: z.boolean().default(false),
    trialDays: z
      .number()
      .int("Trial days must be a whole number")
      .positive("Trial days must be greater than 0")
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    /**
     * CHECK (
     *   (is_free = true AND price = 0)
     *   OR (is_free = false AND price > 0)
     * )
     */
    if (data.isFree && data.price !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Free plans must have a price of 0.",
      });
    }

    if (!data.isFree && data.price <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["price"],
        message: "Paid plans must have a price greater than 0.",
      });
    }

    /**
     * CHECK ((trial_enabled = false OR trial_days > 0))
     */
    if (data.trialEnabled && !data.trialDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["trialDays"],
        message: "Trial days are required when trial is enabled.",
      });
    }

    if (
      data.trialEnabled &&
      data.trialDays !== undefined &&
      data.trialDays !== null &&
      data.trialDays <= 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["trialDays"],
        message: "Trial days must be greater than 0.",
      });
    }
  });

export type PlanFormValues = z.infer<typeof planSchema>;
