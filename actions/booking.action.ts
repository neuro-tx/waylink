"use server";

import { db } from "@/db";
import { bookingItems, bookings, location, products, productVariants } from "@/db/schemas";
import { PassengerType } from "@/lib/all-types";
import { getAuthSession } from "@/lib/auth-server";
import { and, eq } from "drizzle-orm";

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
  const session = await getAuthSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const userId = session.user.id;

  try {
    const result = await db.transaction(async (tx) => {
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

      const totalParticipants = input.items.reduce(
        (acc, i) => acc + i.quantity,
        0,
      );
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
  const session = await getAuthSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await db.transaction(async (tx) => {
      // Step 1: validate
      const booking = await tx.query.bookings.findFirst({
        where: (b, { eq, and }) =>
          and(eq(b.id, bookingId), eq(b.userId, session.user.id)),
        columns: {
          id: true,
          status: true,
          variantId: true,
          participantsCount: true,
        },
      });

      if (!booking) throw new Error("Booking not found");
      if (!["pending", "confirmed"].includes(booking.status)) {
        throw new Error(`A ${booking.status} booking cannot be cancelled`);
      }

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
    });

    return { success: true, data: undefined };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to cancel booking";
    console.error(err)
    return { success: false, error: message };
  }
}

export async function rebookAction(
  originalBookingId: string,
): Promise<ActionResult<{ bookingId: string; orderNumber: string }>> {
  const session = await getAuthSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const result = await db.transaction(async (tx) => {
      // Step 1: fetch original booking
      const original = await tx.query.bookings.findFirst({
        where: (b, { eq, and }) =>
          and(eq(b.id, originalBookingId), eq(b.userId, session.user.id)),
        with: { items: true },
      });

      if (!original) throw new Error("Original booking not found");

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

    return { success: true, data: result };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to rebook";
    return { success: false, error: message };
  }
}

export async function confirmBookingAction(bookingId: string) {
  const session = await getAuthSession();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const userId = session.user.id;

  try {
    await db
      .update(bookings)
      .set({ status: "confirmed" })
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.userId, userId),
          eq(bookings.status, "pending"),
        ),
      );

    return { success: true, data: undefined };
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
      .where(
        and(eq(bookings.id, bookingId) ,eq(location.type ,"end")),
      );

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