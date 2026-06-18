import { z } from "zod";

export const sendNotificationSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title is too long"),
    type: z.enum([
      "booking_confirmed",
      "booking_cancelled",
      "booking_completed",
      "review_received",
      "provider_approved",
      "provider_rejected",
      "provider_suspended",
      "provider_invite",
      "system_announcement",
      "system_warning",
      "promotion",
      "general",
    ]),
    recipientType: z
      .enum(["user", "provider", "admin"])
      .nullable()
      .default(null),
    message: z
      .string()
      .trim()
      .min(5, "Message is required")
      .max(1000, "Message is too long"),

    broadcastAll: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.broadcastAll && !data.recipientType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipientType"],
        message: "Please select a recipient type.",
      });
    }

    if (data.broadcastAll && data.recipientType !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipientType"],
        message: "Recipient type must be empty when broadcasting to everyone.",
      });
    }
  });

export type SendNotificationValues = z.infer<typeof sendNotificationSchema>;
