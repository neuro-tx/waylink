"use server";

import { db } from "@/db";
import {
  bookingItems,
  bookings,
  location,
  products,
  productVariants,
} from "@/db/schemas";
import { inngest } from "@/inngest/client";
import { protectAction } from "@/lib/aj-actions";
import { PassengerType } from "@/lib/all-types";
import { getAuthSession } from "@/lib/auth-server";
import { and, eq, inArray } from "drizzle-orm";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface CreateBookingInput {
  variantId: string;
  productId: string;
  items: {
    passengerType: PassengerType;
    quantity: number;
    unitPrice: number;
  }[];
}

function generateOrderNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = Array.from(
    { length: 10 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  return `ORD-${random}`;
}

export async function createBookingAction(
  input: CreateBookingInput,
): Promise<ActionResult<{ bookingId: string; orderNumber: string }>> {
  const guard = await protectAction("user");

  if (!guard.ok) {
    return {
      error: guard?.message || "Security system unavailable. Try again later.",
      success: false,
    };
  }

  const session = await getAuthSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const userId = session.user.id;

  try {
    const result = await db.transaction(async (tx) => {
      const existing = await tx
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.userId, userId),
            eq(bookings.variantId, input.variantId),
            eq(bookings.productId, input.productId),
            inArray(bookings.status, ["pending", "confirmed"]),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        throw new Error("You already have a booking for this slot");
      }

      // Step 1: validate variant
      const variant = await tx.query.productVariants.findFirst({
        where: (v, { eq }) => eq(v.id, input.variantId),
        with: { product: { columns: { currency: true, status: true } } },
      });

      if (!variant) throw new Error("Variant not found");
      if (variant.status !== "available")
        throw new Error("This slot is no longer available");
      if (variant.productId !== input.productId)
        throw new Error("Variant does not belong to this product");
      if (variant.product.status !== "active")
        throw new Error("This product is not available for booking");

      if (!input.items.length) throw new Error("empty items not valid");

      const infantsCount = input.items
        .filter((i) => i.passengerType === "infant")
        .reduce((acc, i) => acc + i.quantity, 0);

      if (infantsCount > 6) {
        throw new Error("Maximum 6 infants allowed");
      }

      const totalParticipants = input.items.reduce((acc, i) => {
        if (i.passengerType === "infant") return acc; // if infants don't consume capacity (max 6)
        return acc + i.quantity;
      }, 0);

      const remainingCapacity = variant.capacity - variant.bookedCount;

      if (totalParticipants > remainingCapacity) {
        throw new Error(
          `Not enough capacity. Only ${remainingCapacity} spot${remainingCapacity === 1 ? "" : "s"} left.`,
        );
      }

      // Step 2: compute totals
      const totalAmount = input.items.reduce(
        (acc, i) => acc + i.unitPrice * i.quantity,
        0,
      );

      const orderNumber = generateOrderNumber();
      const currency = variant.product.currency ?? "USD";

      // Step 3: insert booking
      const [booking] = await tx
        .insert(bookings)
        .values({
          userId,
          productId: input.productId,
          variantId: input.variantId,
          orderNumber,
          participantsCount: totalParticipants,
          totalAmount: totalAmount.toFixed(2),
          currency,
          status: "pending",
        })
        .returning({ id: bookings.id, orderNumber: bookings.orderNumber });

      // Step 4: insert booking items
      const bookingItemsData = input.items.map((item) => ({
        bookingId: booking.id,
        passengerType: item.passengerType,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        totalPrice: (item.unitPrice * item.quantity).toString(),
      }));
      await tx.insert(bookingItems).values(bookingItemsData);

      // Step 5: increment bookedCount + maybe mark sold_out
      const newBookedCount = variant.bookedCount + totalParticipants;
      const newVariantStatus =
        newBookedCount >= variant.capacity ? "sold_out" : "available";

      await tx
        .update(productVariants)
        .set({ bookedCount: newBookedCount, status: newVariantStatus })
        .where(eq(productVariants.id, input.variantId));

      return { bookingId: booking.id, orderNumber: booking.orderNumber };
    });

    await inngest.send({
      name: "app/booking.created",
      data: { bookingId: result.bookingId },
    });

    return { success: true, data: result };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create booking";
    return { success: false, error: message };
  }
}

export async function cancelBookingAction(
  bookingId: string,
): Promise<ActionResult> {
  const guard = await protectAction("user");

  if (!guard.ok) {
    return {
      error: guard?.message || "Security system unavailable. Try again later.",
      success: false,
    };
  }

  const session = await getAuthSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const res = await db.transaction(async (tx) => {
      // Step 1: validate
      const booking = await tx.query.bookings.findFirst({
        where: (b, { eq, and }) =>
          and(eq(b.id, bookingId), eq(b.userId, session.user.id)),
        columns: {
          id: true,
          status: true,
          variantId: true,
          participantsCount: true,
          productId: true,
        },
      });

      if (!booking) throw new Error("Booking not found");
      if (!["pending", "confirmed"].includes(booking.status)) {
        throw new Error(`A ${booking.status} booking cannot be cancelled`);
      }

      const wasConfirmed = booking.status === "confirmed";

      // Step 2: cancel booking
      await tx
        .update(bookings)
        .set({ status: "cancelled", canceledAt: new Date() })
        .where(eq(bookings.id, bookingId));

      // Step 3: decrement bookedCount
      const variant = await tx.query.productVariants.findFirst({
        where: (v, { eq }) => eq(v.id, booking.variantId),
        columns: { bookedCount: true, capacity: true, status: true },
      });

      if (!variant) return;

      const newBookedCount = Math.max(
        0,
        variant.bookedCount - booking.participantsCount,
      );

      // Step 4: restore availability if it was sold_out
      const newVariantStatus =
        variant.status === "sold_out" && newBookedCount < variant.capacity
          ? "available"
          : variant.status;

      await tx
        .update(productVariants)
        .set({ bookedCount: newBookedCount, status: newVariantStatus })
        .where(eq(productVariants.id, booking.variantId));

      return {
        productId: booking.productId,
        variantId: booking.variantId,
        participantsCount: booking.participantsCount,
        wasConfirmed,
        variantAlreadyRestored: true,
      };
    });

    await inngest.send({
      name: "app/booking.cancelled",
      data: res,
    });

    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to cancel booking";
    console.error(err);
    return { success: false, error: message };
  }
}

export async function rebookAction(
  originalBookingId: string,
): Promise<ActionResult<{ bookingId: string; orderNumber: string }>> {
  const guard = await protectAction("user");

  if (!guard.ok) {
    return {
      error: guard?.message || "Security system unavailable. Try again later.",
      success: false,
    };
  }

  const session = await getAuthSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const result = await db.transaction(async (tx) => {
      // Step 0: fetch original booking
      const original = await tx.query.bookings.findFirst({
        where: (b, { eq, and }) =>
          and(eq(b.id, originalBookingId), eq(b.userId, session.user.id)),
        with: { items: true },
      });

      if (!original) throw new Error("Original booking not found");

      // Step 1: guard against duplicate active booking on the same variant
      const existing = await tx
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.userId, session.user.id),
            eq(bookings.variantId, original.variantId),
            eq(bookings.productId, original.productId),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        throw new Error("You already have a booking for this slot");
      }

      // Step 2: validate variant
      const variant = await tx.query.productVariants.findFirst({
        where: (v, { eq }) => eq(v.id, original.variantId),
      });

      if (!variant) throw new Error("The original slot no longer exists");
      if (variant.status !== "available") {
        throw new Error("This slot is no longer available for booking");
      }

      const remaining = variant.capacity - variant.bookedCount;
      if (original.participantsCount > remaining) {
        throw new Error(
          `Not enough capacity. Only ${remaining} spot${remaining === 1 ? "" : "s"} left.`,
        );
      }

      // Step 3: insert new booking
      const orderNumber = generateOrderNumber();

      const [newBooking] = await tx
        .insert(bookings)
        .values({
          userId: session.user.id,
          productId: original.productId,
          variantId: original.variantId,
          orderNumber,
          participantsCount: original.participantsCount,
          totalAmount: original.totalAmount,
          currency: original.currency,
          status: "pending",
        })
        .returning({ id: bookings.id, orderNumber: bookings.orderNumber });

      // Step 4: copy items
      await tx.insert(bookingItems).values(
        original.items.map((item) => ({
          bookingId: newBooking.id,
          passengerType: item.passengerType,
          quantity: item.quantity,
          unitPrice: item.unitPrice.toString(),
          totalPrice: item.totalPrice.toString(),
        })),
      );

      // Step 5: increment bookedCount
      const newBookedCount = variant.bookedCount + original.participantsCount;
      const newVariantStatus =
        newBookedCount >= variant.capacity ? "sold_out" : "available";

      await tx
        .update(productVariants)
        .set({ bookedCount: newBookedCount, status: newVariantStatus })
        .where(eq(productVariants.id, original.variantId));

      return { bookingId: newBooking.id, orderNumber: newBooking.orderNumber };
    });

    await inngest.send({
      name: "app/booking.created",
      data: { bookingId: result.bookingId },
    });

    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to rebook";
    return { success: false, error: message };
  }
}

export async function confirmBookingAction(
  bookingId: string,
): Promise<ActionResult<{ orderNumber: string }>> {
  const guard = await protectAction("user");

  if (!guard.ok) {
    return {
      error: guard?.message || "Security system unavailable. Try again later.",
      success: false,
    };
  }

  const session = await getAuthSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const userId = session.user.id;

  try {
    const result = await db.transaction(async (tx) => {
      // verify ownership and get data for the event
      const booking = await tx.query.bookings.findFirst({
        where: (b, { eq, and }) =>
          and(eq(b.id, bookingId), eq(b.userId, userId)),
        columns: {
          id: true,
          status: true,
          productId: true,
          variantId: true,
          totalAmount: true,
          orderNumber: true,
          participantsCount: true,
        },
      });

      if (!booking) throw new Error("Booking not found");
      if (booking.status !== "pending")
        throw new Error(`Cannot confirm a ${booking.status} booking`);

      await tx
        .update(bookings)
        .set({ status: "confirmed", updatedAt: new Date() })
        .where(eq(bookings.id, bookingId));

      return booking;
    });

    await inngest.send({
      name: "app/booking.confirmed",
      data: {
        bookingId: result.id,
        productId: result.productId,
        variantId: result.variantId,
        totalAmount: result.totalAmount,
        participantsCount: result.participantsCount,
        orderNumber: result.orderNumber,
        userId,
      },
    });

    return { success: true, data: { orderNumber: result.orderNumber } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to confirm booking";
    return { success: false, error: message };
  }
}

export async function getBookingLocationAction(bookingId: string) {
  try {
    const locations = await db
      .select({
        latitude: location.latitude,
        longitude: location.longitude,
      })
      .from(bookings)
      .innerJoin(productVariants, eq(bookings.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .innerJoin(location, eq(products.id, location.productId))
      .where(and(eq(bookings.id, bookingId), eq(location.type, "end")));

    if (!locations.length) {
      return {
        success: false,
        error: "Location not available for this booking",
      };
    }

    return { success: true, data: locations ?? [] };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to get location";
    return { success: false, error: message };
  }
}
