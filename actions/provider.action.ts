"use server";

import { db } from "@/db";
import { providers } from "@/db/schemas";
import { adminAuth } from "@/lib/admin-auth";
import { MembersRoles } from "@/lib/admin-types";
import { getCurrentProvider } from "@/lib/provider-auth";
import { buildSearchQuery } from "@/lib/query_parser/helpers";
import {
  getRevenueOverTime,
  getServicesStatus,
} from "@/services/analytics.service";
import { providerService } from "@/services/provider.service";
import { providerDashboard } from "@/services/providerBoard.service";

export const changeProviderStatus = async (
  providerId: string,
  targetStatus: any,
) => {
  const { admin, status } = await adminAuth();
  if (!admin || status !== "ok") throw new Error("Permission denied.");
  if (!providerId) throw new Error("Missing provider id");

  return await providerService.changeProviderStatus(providerId, targetStatus);
};

export const deleteProvider = async (providerId: string) => {
  const { admin, status } = await adminAuth();
  if (!admin || status !== "ok") throw new Error("Permission denied.");
  if (!providerId) throw new Error("Missing provider id");

  return await providerService.deleteProvider(providerId);
};

export const getProviderDetails = async (providerId: string) => {
  const { admin, status } = await adminAuth();
  if (!admin || status !== "ok") throw new Error("Permission denied.");

  if (!providerId) {
    throw new Error("Missing provider id");
  }

  try {
    const [data, bookingStatus, revenue, servicesStatus] = await Promise.all([
      providerService.getProviderData(providerId),
      providerDashboard.getBookingStatusBreakdown(providerId),
      getRevenueOverTime(providerId, "1y"),
      getServicesStatus(providerId),
    ]);

    return {
      data,
      bookingStatus,
      revenue,
      servicesStatus,
    };
  } catch {
    throw Error("Failed to get provider details");
  }
};

export async function changeMemberRoleAction(params: {
  targetMemberId: string;
  newRole: Exclude<MembersRoles, "owner">;
}) {
  const { provider, status, role, user } = await getCurrentProvider();
  if (!provider || status !== "ok") throw new Error("Permission denied.");

  if (role === "staff") throw new Error("Staff members cannot change roles.");

  if (user.id === params.targetMemberId)
    throw new Error("You cannot change your own role.");

  const result = await providerService.changeMemberRole(
    provider.id,
    params.targetMemberId,
    params.newRole,
    role ?? "staff",
  );

  return result;
}

export async function removeMemberAction(targetMemberId: string) {
  const { provider, status, role, user } = await getCurrentProvider();
  if (!provider || status !== "ok") throw new Error("Permission denied.");

  if (role === "staff") throw new Error("Staff members cannot remove members.");
  if (user.id === targetMemberId)
    throw new Error("You cannot remove yourself.");

  const result = await providerService.removeMember(
    provider.id,
    targetMemberId,
  );

  return result;
}

export async function getProvidersBySearch(search: string) {
  try {
    const whereSearch = buildSearchQuery(providers.name, search, "ilike");
    const data = await db.select().from(providers).where(whereSearch);

    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    console.error("getProvidersBySearch failed:", error);

    return {
      success: false,
      data: [],
      error: "Failed to fetch providers. Please try again.",
    };
  }
}

export async function setUserProvider(
  actor: "admin" | "provider",
  data: {
    userId: string;
    providerId: string;
    role: Exclude<MembersRoles, "owner">;
  },
) {
  if (actor === "admin") {
    const { admin, status } = await adminAuth();
    if (!admin || status !== "ok")
      return {
        success: true,
        error: "Permission denied.",
      };
  } else {
    const { provider, status } = await getCurrentProvider();
    if (!provider || status !== "ok")
      return {
        success: true,
        error: "Permission denied.",
      };
  }

  const res = await providerService.setProviderMember(
    data.userId,
    data.providerId,
    data.role,
  );
  
  return res;
}
