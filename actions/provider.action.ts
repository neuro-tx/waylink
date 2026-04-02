"use server";

import { getAuthSession } from "@/lib/auth-server";
import { providerService } from "@/services/provider.service";
import { providerForm, providerFormType } from "@/validations";
import z from "zod";
import { sendNotification } from "./notification.action";

type ActionResponse = {
  success: boolean;
  message: string;
  state?: "auth" | "success" | "error" | "warn";
};

export const createProvider = async (
  data: providerFormType,
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "You have to be logged in to create a provider",
        state: "auth",
      };
    }

    const validate = z.safeParse(providerForm, data);
    if (!validate.success) {
      return {
        success: false,
        message: validate.error.issues[0]?.message || "Invalid form data",
        state: "error",
      };
    }

    await providerService.createProvider(validate.data, session.user.id);
    const notificationMessage = `Your provider "${validate.data.name}" has been created and is pending review. We will notify you once it's approved.`;

    await sendNotification({
      userId: session.user.id,
      type: "review_received",
      message: notificationMessage,
      title: "Provider Created",
    });

    return {
      success: true,
      message: "Provider created successfully",
      state: "success",
    };
  } catch (error: any) {
    const pgError = error?.cause ?? error;

    if (pgError?.code === "23505") {
      if (pgError?.constraint === "provider_owner_idx") {
        return {
          success: false,
          message: "You already have a provider profile.",
          state: "warn",
        };
      }

      return {
        success: false,
        message: "This record already exists.",
        state: "warn",
      };
    }

    return {
      success: false,
      message: "Failed to create a new provider",
      state: "error",
    };
  }
};

export const updateProvider = async (
  providerId: string,
  data: providerFormType,
) => {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "you have to be logged in to update the provider",
        state: "auth",
      };
    }

    const validate = z.safeParse(providerForm, data);
    if (!validate.success) {
      return {
        success: false,
        message: validate.error.issues[0]?.message || "Invalid form data",
      };
    }

    const res = await providerService.updateProvider(
      providerId,
      validate.data,
      session.user.id,
    );

    return {
      success: true,
      message: "Provider updated successfully",
      state: "success",
      data: res,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to update the provider",
      state: "error",
    };
  }
};

export const deleteProvider = async (
  providerId: string,
): Promise<ActionResponse> => {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return {
        success: false,
        message: "Unauthorized",
        state: "auth",
      };
    }

    await providerService.deleteProvider(providerId, session.user.id);

    return {
      success: true,
      message: "Provider deleted successfully",
      state: "success",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete the provider",
      state: "error",
    };
  }
};
