import { relations } from "drizzle-orm";
import { account, session, user } from "./public";
import {
  pricing,
  productMedia,
  productReviews,
  products,
  productScores,
  productStats,
  productVariants,
} from "./product";
import { bookingItems, bookings } from "./booking";
import { providerInvites, providerMembers, providers } from "./provider";
import { location } from "./shared";
import { plans, subscriptions } from "./plan";
import { experiences, itineraries } from "./experience";
import { transports, transportSchedules } from "./transport";
import { notifications, wishlistItems, wishlists } from "./engagement";

export const userRelations = relations(user, ({ one, many }) => ({
  sessions: many(session),
  accounts: many(account),
  bookings: many(bookings),
  reviews: many(productReviews),
  providerMemberships: many(providerMembers),
  providerInvitesAsInviter: many(providerInvites, {
    relationName: "inviter",
  }),
  providerInvitesAsAccepter: many(providerInvites, {
    relationName: "accepter",
  }),
  ownedProviders: one(providers, {
    fields: [user.id],
    references: [providers.ownerId],
  }),
  wishlists: many(wishlists),
  notifications: many(notifications),
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
      fields: [providerInvites.invitedBy],
      references: [user.id],
      relationName: "inviter",
    }),
    accepter: one(user, {
      fields: [providerInvites.acceptedBy],
      references: [user.id],
      relationName: "accepter",
    }),
  }),
);

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
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    bookings: many(bookings),
    pricing: one(pricing),
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
  variant: one(productVariants, {
    fields: [bookings.variantId],
    references: [productVariants.id],
  }),
  items: many(bookingItems),
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

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
  booking: one(bookings, {
    fields: [notifications.relatedBookingId],
    references: [bookings.id],
  }),
  product: one(products, {
    fields: [notifications.relatedProductId],
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
