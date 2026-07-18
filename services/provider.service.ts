import { db } from "@/db";
import {
  notifications,
  productReviews,
  products,
  providerInvites,
  providerMembers,
  providers,
  providerStats,
  user,
} from "@/db/schemas";
import { Invites, MembersRoles, ProviderMemebers } from "@/lib/admin-types";
import { NotificationType, Provider, ProviderStatus } from "@/lib/all-types";
import { ProviderStats } from "@/lib/panel-types";
import { parseQuery } from "@/lib/query_parser/analyzer";
import {
  buildSearchQuery,
  buildWhereConditions,
  mergeWhere,
} from "@/lib/query_parser/helpers";
import { generateSlug } from "@/lib/utils";
import { providerFormType } from "@/validations";
import {
  count,
  getTableColumns,
  sql,
  eq,
  desc,
  and,
  inArray,
  not,
} from "drizzle-orm";

const getProviders = async (url: string) => {
  const { query } = parseQuery(url);
  const limit = Number(query?.limit ?? 10);
  const offset = Number(query?.offset ?? 0);

  const providerSQL = buildWhereConditions(query?.where ?? {}, providers);
  const searchSQL = buildSearchQuery(
    providers.description,
    query?.search?.term,
    "ilike",
  );
  const final = mergeWhere(providerSQL, searchSQL);

  const { ...provider } = getTableColumns(providers);

  const [countRes, list] = await Promise.all([
    db.select({ total: count() }).from(providers).where(final),
    db
      .select({
        ...provider,
        totalProducts: providerStats.totalProducts,
        totalBookings: providerStats.totalBookings,
        avgRating: providerStats.avgRating,
        totalReviews: providerStats.totalReviews,
      })
      .from(providers)
      .leftJoin(providerStats, eq(provider.id, providerStats.providerId))
      .where(final)
      .orderBy(desc(providerStats.totalBookings))
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(countRes[0]?.total ?? 0);
  const pagination = {
    total,
    limit,
    offset,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
    hasNextPage: offset + limit < total,
    hasPrevPage: offset > 0,
  };

  return {
    data: list,
    pagination,
  };
};

const getProviderById = async (providerId: string) => {
  const provider = await db.query.providers.findFirst({
    where: (provider, { eq }) => eq(provider.id, providerId),
  });

  if (!provider) return null;
  return provider;
};

const providerReviewState = async (providerId: string) => {
  const [reviews, [stats]] = await Promise.all([
    db
      .select({
        id: productReviews.id,
        authorName: user.name,
        authorImage: user.image,
        rating: productReviews.rating,
        body: productReviews.comment,
        createdAt: productReviews.createdAt,
      })
      .from(productReviews)
      .innerJoin(products, eq(productReviews.productId, products.id))
      .leftJoin(user, eq(productReviews.userId, user.id))
      .where(eq(products.providerId, providerId))
      .orderBy(desc(productReviews.createdAt))
      .limit(5),

    db
      .select({
        totalReviews: providerStats.totalReviews,
        totalServices: providerStats.totalProducts,
        avgRating: providerStats.avgRating,
        fiveStar: sql<number>`count(*) filter (where ${productReviews.rating} = 5)`,
        fourStar: sql<number>`count(*) filter (where ${productReviews.rating} = 4)`,
        threeStar: sql<number>`count(*) filter (where ${productReviews.rating} = 3)`,
        twoStar: sql<number>`count(*) filter (where ${productReviews.rating} = 2)`,
        oneStar: sql<number>`count(*) filter (where ${productReviews.rating} = 1)`,
      })
      .from(products)
      .leftJoin(productReviews, eq(productReviews.productId, products.id))
      .leftJoin(
        providerStats,
        eq(products.providerId, providerStats.providerId),
      )
      .where(eq(products.providerId, providerId))
      .groupBy(
        providerStats.totalReviews,
        providerStats.totalProducts,
        providerStats.avgRating,
      ),
  ]);

  return {
    reviews,
    stats,
  };
};

const getProviderProducts = async (
  providerId: string,
  specialState: boolean,
  limit: number,
  page: number,
) => {
  const offset = (page - 1) * limit;
  const whereClause = specialState
    ? eq(products.providerId, providerId)
    : and(
        eq(products.providerId, providerId),
        not(inArray(products.status, ["draft", "paused"])),
      );

  const [countResult, items] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause),
    db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(products.createdAt)
      .limit(limit)
      .offset(offset),
  ]);

  const total = Number(countResult?.[0]?.count ?? 0);
  const pagination = {
    total,
    limit,
    offset,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
    hasNextPage: offset + limit < total,
    hasPrevPage: offset > 0,
  };

  return {
    items,
    pagination,
  };
};

const createProvider = async (data: providerFormType, ownerId: string) => {
  const slug = generateSlug(data.name);

  const newProvider = await db
    .insert(providers)
    .values({
      slug,
      ...data,
      ownerId,
      status: "pending",
    })
    .returning();

  return newProvider[0];
};

const updateProvider = async (
  providerId: string,
  data: providerFormType,
  ownerId: string,
) => {
  const slug = generateSlug(data.name);

  const updated = await db
    .update(providers)
    .set({
      slug,
      ...data,
    })
    .where(and(eq(providers.id, providerId), eq(providers.ownerId, ownerId)))
    .returning();

  return updated[0];
};

const deleteProvider = async (providerId: string) => {
  const result = await db.transaction(async (tx) => {
    const [provider] = await tx
      .select()
      .from(providers)
      .where(eq(providers.id, providerId))
      .limit(1);

    if (!provider) {
      throw new Error("Provider not found");
    }

    const canDelete =
      provider.status === "inactive" || provider.status === "rejected";

    if (!canDelete) {
      throw new Error(
        `Providers with status '${provider.status}' cannot be deleted`,
      );
    }

    const [deleted] = await tx
      .delete(providers)
      .where(and(eq(providers.id, providerId)))
      .returning();

    await tx.insert(notifications).values({
      recipientType: "user",
      recipientId: provider.ownerId,
      type: "general",
      title: "🗑️ Provider Deleted",
      message: `Your provider "${provider.name}" has been permanently removed from the platform.`,
    });

    return deleted;
  });

  return {
    success: true,
    provider: result,
  };
};

type ProviderAction = "approved" | "rejected" | "suspended";
const PROVIDER_TRANSITIONS: Record<ProviderStatus, ProviderAction[]> = {
  pending: ["approved", "rejected"],
  approved: ["suspended"],
  inactive: [],
  suspended: ["approved"],
  rejected: [],
};

type NotificationConfig = {
  title: string;
  message: (providerName: string) => string;
};

const PROVIDER_ACTIONS: Record<
  string,
  {
    targetStatus: ProviderStatus;
    type: NotificationType;
    providerNotification: NotificationConfig;
    ownerNotification: NotificationConfig;
  }
> = {
  approved: {
    targetStatus: "approved",
    type: "provider_approved",
    providerNotification: {
      title: "🎉 Provider Approved",
      message: (providerName) =>
        `Great news! "${providerName}" has been approved and is now visible to customers. You can start managing services, receiving bookings, and growing your business on the platform.`,
    },
    ownerNotification: {
      title: "🎉 Your Provider Has Been Approved",
      message: (providerName) =>
        `Your provider "${providerName}" has been approved and is now live. Customers can now discover and book your services.`,
    },
  },
  rejected: {
    targetStatus: "rejected",
    type: "provider_rejected",
    providerNotification: {
      title: "⚠️ Provider Rejected",
      message: (providerName) =>
        `Unfortunately, "${providerName}" could not be approved at this time. Please review the submitted information, make any necessary updates, and submit it again for review.`,
    },
    ownerNotification: {
      title: "⚠️ Provider Application Rejected",
      message: (providerName) =>
        `Your provider "${providerName}" was not approved. Please review your provider information and resubmit it for another review.`,
    },
  },
  suspended: {
    targetStatus: "suspended",
    type: "provider_suspended",
    providerNotification: {
      title: "🚫 Provider Suspended",
      message: (providerName) =>
        `"${providerName}" has been suspended and is currently unavailable to customers. If you believe this was a mistake, please contact the platform support team.`,
    },
    ownerNotification: {
      title: "🚫 Provider Suspended",
      message: (providerName) =>
        `Your provider "${providerName}" has been suspended and is no longer visible to customers until further notice.`,
    },
  },
} as const;

async function changeProviderStatus(
  providerId: string,
  action: ProviderAction,
) {
  const [provider] = await db
    .select()
    .from(providers)
    .where(eq(providers.id, providerId))
    .limit(1);

  if (!provider) {
    throw new Error("Provider not found");
  }

  const allowedActions =
    PROVIDER_TRANSITIONS[provider.status as ProviderStatus];

  if (!allowedActions.includes(action)) {
    throw new Error(
      `Cannot perform '${action}' from status '${provider.status}'`,
    );
  }

  const config = PROVIDER_ACTIONS[action];

  const result = await db.transaction(async (tx) => {
    const isVerified =
      config.targetStatus === "approved"
        ? true
        : config.targetStatus === "rejected"
          ? false
          : provider.isVerified;

    const [updated] = await tx
      .update(providers)
      .set({
        status: config.targetStatus,
        isVerified,
      })
      .where(eq(providers.id, provider.id))
      .returning();

    await tx.insert(notifications).values([
      {
        recipientType: "provider",
        recipientId: provider.id,
        type: config.type,
        title: config.providerNotification.title,
        message: config.providerNotification.message(provider.name),
      },
      {
        recipientType: "user",
        recipientId: provider.ownerId,
        type: config.type,
        title: config.ownerNotification.title,
        message: config.ownerNotification.message(provider.name),
      },
    ]);

    return updated;
  });

  return {
    success: true,
    provider: result,
  };
}

async function providerInvitesMembers(providerId: string) {
  const [members, invites] = await Promise.all([
    db
      .select({
        providerId: providerMembers.providerId,
        userId: user.id,
        role: providerMembers.role,
        name: user.name,
        email: user.email,
        avatar: user.image,
        createdAt: providerMembers.createdAt,
        updatedAt: providerMembers.updatedAt,
      })
      .from(providerMembers)
      .innerJoin(user, eq(providerMembers.userId, user.id))
      .where(eq(providerMembers.providerId, providerId)),
    db
      .select()
      .from(providerInvites)
      .where(eq(providerInvites.providerId, providerId)),
  ]);

  return {
    members,
    invites,
  };
}

async function getProviderData(providerId: string) {
  const [[provider], members, [status]] = await Promise.all([
    db.select().from(providers).where(eq(providers.id, providerId)).limit(1),
    db
      .select({
        providerId: providerMembers.providerId,
        userId: user.id,
        role: providerMembers.role,
        name: user.name,
        email: user.email,
        avatar: user.image,
        createdAt: providerMembers.createdAt,
        updatedAt: providerMembers.updatedAt,
      })
      .from(providerMembers)
      .innerJoin(user, eq(providerMembers.userId, user.id))
      .where(eq(providerMembers.providerId, providerId)),
    db
      .select()
      .from(providerStats)
      .where(eq(providerStats.providerId, providerId))
      .limit(1),
  ]);

  if (!provider) throw new Error("provider not found");

  return {
    provider: provider as Provider,
    members: members as ProviderMemebers[],
    status: status as ProviderStats,
  };
}

const ROLE_NOTIFICATION: Record<
  MembersRoles,
  { title: string; description: (name: string) => string }
> = {
  owner: {
    title: "👑 Ownership transferred",
    description: (name) =>
      `${name} is now the owner of this provider. All admin privileges have been granted.`,
  },
  manager: {
    title: "🛡️ Role updated to Manager",
    description: (name) =>
      `${name} has been promoted to manager and can now manage listings, bookings, and team members.`,
  },
  staff: {
    title: "👤 Role updated to Staff",
    description: (name) =>
      `${name} has been set to staff. They can view and manage assigned tasks only.`,
  },
};

const ROLE_PERMISSIONS: Record<MembersRoles, MembersRoles[]> = {
  owner: ["manager", "staff"],
  manager: ["staff"],
  staff: [],
};

async function changeMemberRole(
  providerId: string,
  targetMemberId: string,
  newRole: Exclude<MembersRoles, "owner">,
  actorRole: MembersRoles,
) {
  return await db.transaction(async (tx) => {
    const target = await tx.query.providerMembers.findFirst({
      where: (t, { and, eq: e }) =>
        and(e(t.userId, targetMemberId), e(t.providerId, providerId)),
      with: {
        user: { columns: { id: true, name: true, role: true } },
        provider: { columns: { id: true, name: true } },
      },
    });

    if (!target) throw new Error("Member not found.");
    // block the operation , may be a malicious attempt to change role of a member from another provider
    if (providerId !== target.providerId) throw new Error("Access denied.");
    if (target.user.role !== "provider")
      throw new Error("Only provider accounts can have their role changed.");

    const targetRole = target.role ?? "staff";

    if (targetRole === "owner")
      throw new Error(
        "Owner's role cannot be changed here. Use the ownership transfer action.",
      );

    if (!ROLE_PERMISSIONS[actorRole].includes(targetRole))
      throw new Error(
        `As a ${actorRole}, you don't have permission to update a ${targetRole}.`,
      );

    if (targetRole === newRole) {
      return {
        success: true,
        noOp: true,
        message: `${target.user.name} is already assigned the ${newRole} role.`,
      };
    }

    await tx
      .update(providerMembers)
      .set({ role: newRole })
      .where(
        and(
          eq(providerMembers.userId, targetMemberId),
          eq(providerMembers.providerId, providerId),
        ),
      );

    const notif = ROLE_NOTIFICATION[newRole];
    await tx.insert(notifications).values({
      recipientType: "user",
      recipientId: targetMemberId,
      type: "general",
      title: notif.title,
      message: notif.description(target.user.name),
    });

    return {
      success: true,
      noOp: false,
      message: `${target.user.name} is now assigned the ${newRole} role.`,
    };
  });
}

async function removeMember(providerId: string, targetMemberId: string) {
  return await db.transaction(async (tx) => {
    const target = await tx.query.providerMembers.findFirst({
      where: (t, { and, eq: e }) =>
        and(e(t.userId, targetMemberId), e(t.providerId, providerId)),
      with: {
        user: { columns: { id: true, name: true, role: true } },
        provider: { columns: { id: true, name: true } },
      },
    });

    if (!target) throw new Error("Member not found.");
    // block the operation , may be a malicious attempt to change role of a member from another provider
    if (providerId !== target.providerId) throw new Error("Access denied.");
    if (target.user.role !== "provider")
      throw new Error("Only provider accounts can be removed from a provider.");
    if (target.role === "owner")
      throw new Error("Owner cannot be removed from the provider.");

    await tx
      .delete(providerMembers)
      .where(
        and(
          eq(providerMembers.userId, targetMemberId),
          eq(providerMembers.providerId, providerId),
        ),
      );

    await tx
      .update(user)
      .set({ role: "user" })
      .where(eq(user.id, targetMemberId));

    await tx.insert(notifications).values({
      recipientType: "user",
      recipientId: targetMemberId,
      type: "general",
      title: "👋 Removed from Provider",
      message: `You have been removed from the provider "${target.provider.name}". You no longer have access to manage or view this provider's resources.`,
    });

    return {
      success: true,
      message: `${target.user.name} has been removed from the provider.`,
    };
  });
}

export async function setProviderMember(
  userId: string,
  providerId: string,
  role: Exclude<MembersRoles, "owner">,
) {
  try {
    await db.transaction(async (tx) => {
      const [[targetUser], [provider], [existingMember]] = await Promise.all([
        tx
          .select({
            id: user.id,
            name: user.name,
            role: user.role,
          })
          .from(user)
          .where(eq(user.id, userId)),

        tx
          .select({
            id: providers.id,
            name: providers.name,
          })
          .from(providers)
          .where(eq(providers.id, providerId)),

        tx
          .select()
          .from(providerMembers)
          .where(
            and(
              eq(providerMembers.userId, userId),
              eq(providerMembers.providerId, providerId),
            ),
          ),
      ]);

      if (!targetUser) throw new Error("User not found.");
      if (!provider) throw new Error("Provider not found.");
      if (existingMember)
        throw new Error("This user is already a member of the provider.");
      if (targetUser.role !== "user")
        throw new Error(
          "Only users with the 'user' role can be assigned as provider members.",
        );

      await tx.insert(providerMembers).values({
        providerId,
        userId,
        role,
      });

      await tx
        .update(user)
        .set({ role: "provider" })
        .where(eq(user.id, userId));

      await tx.insert(notifications).values({
        recipientId: userId,
        recipientType: "user",
        type: "general",
        title: `🎉 Welcome to ${provider.name}!`,
        message: `You have been added as a ${role} to ${provider.name}. You can now access the provider dashboard and start managing your assigned responsibilities.`,
      });
    });

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("setProviderMember failed:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

export const providerService = {
  getProviders,
  providerReviewState,
  getProviderById,
  getProviderProducts,
  createProvider,
  updateProvider,
  deleteProvider,
  changeProviderStatus,
  getProviderData,
  changeMemberRole,
  removeMember,
  providerInvitesMembers,
  setProviderMember
};
