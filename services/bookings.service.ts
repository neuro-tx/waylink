import { db } from "@/db";
import { and, count, eq } from "drizzle-orm";
import { bookings } from "@/db/schemas/booking";
const BOOKINGS_PER_PAGE = 10;

const bookingWith = {
  items: true,
  variant: true,
  product: {
    with: {
      media: {
        where: (
          media: { isCover: boolean },
          { eq }: { eq: (...args: unknown[]) => unknown },
        ) => eq(media.isCover, true),
        limit: 1,
      },
    },
  },
} as any;

const getAllBookings = async (page = 1) => {
  const offset = (page - 1) * BOOKINGS_PER_PAGE;

  const [data, [{ total }]] = await Promise.all([
    db.query.bookings.findMany({
      with: {
        user: true,
        ...bookingWith,
      },
      limit: BOOKINGS_PER_PAGE,
      offset,
      orderBy: (booking, { desc }) => desc(booking.createdAt),
    }),
    db.select({ total: count() }).from(bookings),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / BOOKINGS_PER_PAGE),
  };
};

const getBookingsByUserId = async (userId: string, page = 1) => {
  const offset = (page - 1) * BOOKINGS_PER_PAGE;

  const [data, [{ total }]] = await Promise.all([
    db.query.bookings.findMany({
      where: (booking, { eq }) => eq(booking.userId, userId),
      with: bookingWith,
      limit: BOOKINGS_PER_PAGE,
      offset,
      orderBy: (booking, { desc }) => desc(booking.createdAt),
    }),
    db
      .select({ total: count() })
      .from(bookings)
      .where(eq(bookings.userId, userId)),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / BOOKINGS_PER_PAGE),
  };
};

const getBookingsByProductId = async (productId: string, page = 1) => {
  const offset = (page - 1) * BOOKINGS_PER_PAGE;

  const [data, [{ total }]] = await Promise.all([
    db.query.bookings.findMany({
      where: (booking, { eq }) => eq(booking.productId, productId),
      with: {
        user: true,
        ...bookingWith,
      },
      limit: BOOKINGS_PER_PAGE,
      offset,
      orderBy: (booking, { desc }) => desc(booking.createdAt),
    }),
    db
      .select({ total: count() })
      .from(bookings)
      .where(eq(bookings.productId, productId)),
  ]);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / BOOKINGS_PER_PAGE),
  };
};

const getBookingById = async (id: string) => {
  return db.query.bookings.findFirst({
    where: (booking, { eq }) => eq(booking.id, id),
    with: {
      user: true,
      ...bookingWith,
    },
  });
};

const getBookingStatsByUserId = async (userId: string) => {
  const rows = await db
    .select({ status: bookings.status, total: count() })
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .groupBy(bookings.status);

  const amountRows = await db.query.bookings.findMany({
    where: (booking, { eq, and, ne }) =>
      and(eq(booking.userId, userId), ne(booking.status, "cancelled")),
    columns: { totalAmount: true },
  });

  const totalInvested = amountRows.reduce(
    (acc, b) => acc + parseFloat(b.totalAmount),
    0,
  );

  const byStatus = Object.fromEntries(rows.map((r) => [r.status, r.total]));

  return {
    total: rows.reduce((acc, r) => acc + r.total, 0),
    completed: byStatus["completed"] ?? 0,
    confirmed: byStatus["confirmed"] ?? 0,
    totalInvested,
  };
};

export const bookingsService = {
  getAllBookings,
  getBookingById,
  getBookingsByUserId,
  getBookingsByProductId,
  getBookingStatsByUserId,
};
