import { relations } from "drizzle-orm";
import { account, session, user } from "./public";
import {
  productMedia,
  productReviews,
  products,
  productScores,
  productStats,
  productVariants,
} from "./product";
import { bookingItems, bookings } from "./booking";
import {
  providerInvites,
  providerMembers,
  providers,
  providerStats,
} from "./provider";
import { location } from "./shared";
import { plans, subscriptions } from "./plan";
import { experiences, itineraries } from "./experience";
import { transports, transportSchedules } from "./transport";
import { wishlistItems, wishlists } from "./engagement";

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  bookings: many(bookings),
  reviews: many(productReviews),
  providerMemberships: many(providerMembers),
  sentInvites: many(providerInvites, {
    relationName: "inviter",
  }),
  receivedInvites: many(providerInvites, {
    relationName: "accepter",
  }),
  ownedProviders: one(providers, {
    fields: [user.id],
    references: [providers.ownerId],
  }),
  wishlists: many(wishlists),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// ============================================
// PROVIDER RELATIONS
// ============================================
export const providerRelations = relations(providers, ({ one, many }) => ({
  owner: one(user, {
    fields: [providers.ownerId],
    references: [user.id],
  }),
  products: many(products),
  members: many(providerMembers),
  invites: many(providerInvites),
  subscriptions: many(subscriptions),
  bookings: many(bookings),
  stats: one(providerStats, {
    fields: [providers.id],
    references: [providerStats.providerId],
  }),
}));

export const providerMemberRelations = relations(
  providerMembers,
  ({ one }) => ({
    provider: one(providers, {
      fields: [providerMembers.providerId],
      references: [providers.id],
    }),
    user: one(user, {
      fields: [providerMembers.userId],
      references: [user.id],
    }),
  }),
);

export const providerInviteRelations = relations(
  providerInvites,
  ({ one }) => ({
    provider: one(providers, {
      fields: [providerInvites.providerId],
      references: [providers.id],
    }),
    inviter: one(user, {
      fields: [providerInvites.senderId],
      references: [user.id],
      relationName: "inviter",
    }),
    receiver: one(user, {
      fields: [providerInvites.receiverId],
      references: [user.id],
      relationName: "accepter",
    }),
  }),
);

export const providerStatsRelations = relations(providerStats, ({ one }) => ({
  provider: one(providers, {
    fields: [providerStats.providerId],
    references: [providers.id],
  }),
}));

// ============================================
// PLAN & SUBSCRIPTION RELATIONS
// ============================================
export const planRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  provider: one(providers, {
    fields: [subscriptions.providerId],
    references: [providers.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

// ============================================
// PRODUCT RELATIONS
// ============================================
export const productRelations = relations(products, ({ one, many }) => ({
  variants: many(productVariants),
  scores: one(productScores),
  media: many(productMedia),
  reviews: many(productReviews),
  stats: one(productStats),
  provider: one(providers, {
    fields: [products.providerId],
    references: [providers.id],
  }),
  locations: many(location),
  experience: one(experiences),
  transport: one(transports),
  wishlistItems: many(wishlistItems),
  bookings: many(bookings),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    bookings: many(bookings),
    transportSchedule: one(transportSchedules, {
      fields: [productVariants.id],
      references: [transportSchedules.variantId],
    }),
  }),
);

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(products, {
    fields: [productMedia.productId],
    references: [products.id],
  }),
}));

export const productScoreRelations = relations(productScores, ({ one }) => ({
  product: one(products, {
    fields: [productScores.productId],
    references: [products.id],
  }),
}));

export const productReviewRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  user: one(user, {
    fields: [productReviews.userId],
    references: [user.id],
  }),
}));

export const productStatsRelations = relations(productStats, ({ one }) => ({
  product: one(products, {
    fields: [productStats.productId],
    references: [products.id],
  }),
}));

// ============================================
// EXPERIENCE RELATIONS
// ============================================
export const experienceRelations = relations(experiences, ({ one, many }) => ({
  product: one(products, {
    fields: [experiences.productId],
    references: [products.id],
  }),
  itineraries: many(itineraries),
}));

export const itineraryRelations = relations(itineraries, ({ one }) => ({
  experience: one(experiences, {
    fields: [itineraries.experienceId],
    references: [experiences.id],
  }),
}));

// ============================================
// TRANSPORT RELATIONS
// ============================================
export const transportRelations = relations(transports, ({ one }) => ({
  product: one(products, {
    fields: [transports.productId],
    references: [products.id],
  }),
}));

export const transportSchedulesRelations = relations(
  transportSchedules,
  ({ one }) => ({
    varient: one(productVariants, {
      fields: [transportSchedules.variantId],
      references: [productVariants.id],
    }),
  }),
);

// ============================================
// BOOKING RELATIONS
// ============================================
export const bookingRelations = relations(bookings, ({ one, many }) => ({
  user: one(user, {
    fields: [bookings.userId],
    references: [user.id],
  }),
  product: one(products, {
    fields: [bookings.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [bookings.variantId],
    references: [productVariants.id],
  }),
  items: many(bookingItems),
  provider: one(providers, {
    fields: [bookings.productId],
    references: [providers.id],
  }),
}));

export const bookingItemsRelations = relations(bookingItems, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingItems.bookingId],
    references: [bookings.id],
  }),
}));

// ============================================
// ENGAGEMENT RELATIONS
// ============================================
export const wishlistRelations = relations(wishlists, ({ one, many }) => ({
  user: one(user, {
    fields: [wishlists.userId],
    references: [user.id],
  }),
  items: many(wishlistItems),
}));

export const wishlistItemRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.id],
  }),
  item: one(products, {
    fields: [wishlistItems.itemId],
    references: [products.id],
  }),
}));

// ============================================
// LOCATION RELATIONS
// ============================================
export const locationRelations = relations(location, ({ one }) => ({
  products: one(products, {
    fields: [location.productId],
    references: [products.id],
  }),
}));
