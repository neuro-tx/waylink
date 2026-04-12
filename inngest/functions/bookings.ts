import { db } from "@/db";
import {
  bookings,
  productReviews,
  productStats,
  productVariants,
} from "@/db/schemas";
import { and, eq, sql } from "drizzle-orm";
import { inngest } from "../client";
import { sendNotification } from "@/actions/notification.action";

/**
 * 1) BOOKING CREATED
 * Fired when a new booking is created with status "pending".
 * Purpose:
 * - Schedule an expiry check after 15 minutes to cancel unpaid bookings
 */
export const processBookingCreated = inngest.createFunction(
  { id: "booking-created", triggers: { event: "app/booking.created" } },
  async ({ event, step }) => {
    // Wait 15 minutes for the user to complete payment
    await step.sleep("wait-for-payment-window", "15m");

    await step.sendEvent("trigger-expiry-check", {
      name: "app/booking.expiry.check",
      data: {
        bookingId: event.data.bookingId,
      },
    });
  },
);

export const processBookingConfirmed = inngest.createFunction(
  { id: "booking-confirmed", triggers: { event: "app/booking.confirmed" } },
  async ({ event, step }) => {
    const {
      productId,
      variantId,
      totalAmount,
      userId,
      orderNumber,
      participantsCount,
    } = event.data;

    // Update productStats: increment bookingsCount, add revenue, update lastBookedAt
    await step.run("update-product-stats-on-confirm", async () => {
      await db
        .update(productStats)
        .set({
          bookingsCount: sql`${productStats.bookingsCount} + 1`,
          totalRevenue: sql`${productStats.totalRevenue} + ${totalAmount}`,
          lastBookedAt: new Date(),
        })
        .where(eq(productStats.productId, productId));
    });

    // Update variant: increment bookedCount and flip to sold_out if capacity is reached
    await step.run("update-variant-on-confirm", async () => {
      const variant = await db.query.productVariants.findFirst({
        where: (v, { eq }) => eq(v.id, variantId),
      });

      if (!variant) return;

      const newBookedCount = variant.bookedCount + participantsCount;
      const newStatus =
        newBookedCount >= variant.capacity ? "sold_out" : "available";

      await db
        .update(productVariants)
        .set({
          bookedCount: newBookedCount,
          status: newStatus,
        })
        .where(eq(productVariants.id, variantId));
    });

    await step.run("send-confirm-notification", async () => {
      await sendNotification({
        userId,
        type: "booking_confirmed",
        title: "Booking Confirmed 🎉",
        message: `Your booking "#${orderNumber}" has been confirmed successfully.`,
      });
    });
  },
);

/**
 * 3) BOOKING EXPIRY CHECK
 * Fired 15 minutes after booking creation (via processBookingCreated).
 * Purpose:
 * - Cancel the booking if still "pending" (payment not completed)
 * - Restore variant bookedCount so the spots open up again
 */
export const expirePendingBooking = inngest.createFunction(
  {
    id: "booking-expiry-check",
    triggers: { event: "app/booking.expiry.check" },
  },
  async ({ event, step }) => {
    let notifyUserId: string | null = null;

    const result = await step.run(
      "expire-pending-booking-transaction",
      async () => {
        return db.transaction(async (tx) => {
          const booking = await tx.query.bookings.findFirst({
            where: (b, { eq }) => eq(b.id, event.data.bookingId),
          });

          if (!booking) {
            return { expired: false, reason: "not_found" as const };
          }

          // Already paid/confirmed/cancelled/etc -> do nothing
          if (booking.status !== "pending") {
            return { expired: false, reason: "not_pending" as const };
          }

          const variant = await tx.query.productVariants.findFirst({
            where: (v, { eq }) => eq(v.id, booking.variantId),
          });

          if (!variant) {
            // Variant is missing — still cancel the booking
            await tx
              .update(bookings)
              .set({ status: "cancelled", updatedAt: new Date() })
              .where(eq(bookings.id, booking.id));

            return {
              expired: true,
              reason: "variant_missing" as const,
            };
          }

          const newBookedCount = Math.max(
            0,
            variant.bookedCount - booking.participantsCount,
          );
          const newVariantStatus =
            newBookedCount < variant.capacity ? "available" : "sold_out";

          // Cancel the booking (only if still pending — guard against race conditions)
          await tx
            .update(bookings)
            .set({ status: "cancelled", updatedAt: new Date() })
            .where(
              and(eq(bookings.id, booking.id), eq(bookings.status, "pending")),
            );

          // Restore the variant spots
          await tx
            .update(productVariants)
            .set({
              bookedCount: newBookedCount,
              status: newVariantStatus,
              updatedAt: new Date(),
            })
            .where(eq(productVariants.id, variant.id));

          notifyUserId = booking.userId;

          return {
            expired: true,
            productId: booking.productId,
            variantId: booking.variantId,
            participantsCount: booking.participantsCount,
            userId: booking.userId,
            reason: "expired" as const,
          };
        });
      },
    );

    // ✅ Send cancelled notification
    if (result.expired && notifyUserId) {
      const userId = notifyUserId;

      await step.run("send-cancel-notification", async () => {
        await sendNotification({
          userId,
          type: "booking_cancelled",
          title: "⏳ Booking Cancelled",
          message:
            "Your booking was cancelled because it wasn’t confirmed in time.",
        });
      });
    }

    // If booking expired, fire the cancelled event so productStats stay in sync
    if (result.expired && result.reason === "expired") {
      await step.sendEvent("fire-booking-cancelled-event", {
        name: "app/booking.cancelled",
        data: {
          productId: result.productId,
          variantId: result.variantId,
        },
      });
    }
  },
);

/**
 * 4) BOOKING CANCELLED
 * Fired when a confirmed booking is explicitly cancelled.
 * Purpose:
 * - Increment cancelledBookingsCount in productStats
 * - Restore variant bookedCount so the spots open up again
 */
export const processBookingCancelled = inngest.createFunction(
  { id: "booking-cancelled", triggers: { event: "app/booking.cancelled" } },
  async ({ event, step }) => {
    const { productId, variantId, participantsCount, wasConfirmed } =
      event.data;

    // Always update the cancelled count in stats
    await step.run("update-product-stats-on-cancel", async () => {
      await db
        .update(productStats)
        .set({
          cancelledBookingsCount: sql`${productStats.cancelledBookingsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(productStats.productId, productId));
    });

    // Only restore variant spots if the booking was previously confirmed
    // (pending bookings are already handled by expirePendingBooking)
    if (wasConfirmed && variantId && participantsCount) {
      await step.run("restore-variant-spots-on-cancel", async () => {
        const variant = await db.query.productVariants.findFirst({
          where: (v, { eq }) => eq(v.id, variantId),
        });

        if (!variant) return;

        const newBookedCount = Math.max(
          0,
          variant.bookedCount - participantsCount,
        );
        const newStatus =
          newBookedCount < variant.capacity ? "available" : "sold_out";

        await db
          .update(productVariants)
          .set({
            bookedCount: newBookedCount,
            status: newStatus,
          })
          .where(eq(productVariants.id, variantId));
      });
    }
  },
);

export const processBookingCompleted = inngest.createFunction(
  { id: "booking-completed", triggers: { event: "app/booking.completed" } },
  async ({ event, step }) => {
    const { productId, userId, orderNumber } = event.data;

    await step.run("update-product-stats-on-complete", async () => {
      await db
        .update(productStats)
        .set({
          completedBookingsCount: sql`${productStats.completedBookingsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(productStats.productId, productId));
    });

    await step.run("send-completion-notification", async () => {
      await sendNotification({
        userId,
        type: "booking_completed",
        title: "Booking Completed ✅",
        message: `We hope you enjoyed your experience! Booking "#${orderNumber}" is now complete. Leave a review to share your thoughts.`,
      });
    });
  },
);

export const bookingsFuncs = [
  processBookingCreated,
  processBookingConfirmed,
  expirePendingBooking,
  processBookingCancelled,
  processBookingCompleted,
];
