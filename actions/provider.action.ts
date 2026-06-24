"use server";

import { adminAuth } from "@/lib/admin-auth";
import { providerService } from "@/services/provider.service";

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
