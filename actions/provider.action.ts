"use server";

import { adminAuth } from "@/lib/admin-auth";
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
