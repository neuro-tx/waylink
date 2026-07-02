"use server";

import { adminAuth } from "@/lib/admin-auth";
import { MembersRoles } from "@/lib/admin-types";
import { getCurrentProvider } from "@/lib/provider-auth";
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

type ActorType = "admin" | "provider";
type BaseParams = {
  targetMemberId: string;
  newRole: Exclude<MembersRoles, "owner">;
  actor: ActorType;
};

type AdminParams = BaseParams & { actor: "admin"; providerId: string };
type ProviderParams = BaseParams & { actor: "provider"; providerId?: never };

type Params = AdminParams | ProviderParams;

export async function changeMemberRoleAction(params: Params) {
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
