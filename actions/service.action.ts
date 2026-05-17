"use server";

import { db } from "@/db";
import { products, productVariants, setupProgress } from "@/db/schemas";
import {
  ProductForm,
  productSchema,
  VariantForm,
  variantSchema,
} from "@/validations";
import { eq } from "drizzle-orm";
import z from "zod";
import { generateSlug } from "@/lib/utils";
import { getCurrentProvider } from "@/lib/provider-auth";
import { SetupProgress } from "@/lib/all-types";

async function requireProvider(secure?: boolean) {
  const { provider, role, status } = await getCurrentProvider();
  if (!provider || !role) throw new Error("Unauthorized.");

  if (secure) {
    if (status !== "ok") throw new Error("Permission denied.");
    const isPrivileged = role === "owner" || role === "manager";
    if (!isPrivileged) {
      throw new Error("Insufficient permissions.");
    }
  }

  return provider;
}

export async function getServiceSetup(id: string) {
  try {
    const [res] = await db
      .select()
      .from(setupProgress)
      .where(eq(setupProgress.productId, id))
      .limit(1);
    return res;
  } catch {
    return null;
  }
}

export async function updateSetupProgress(
  serviceId: string,
  data: Partial<SetupProgress>,
) {
  if (!serviceId)
    return {
      success: false,
      error: "Service id is missing",
    };

  try {
    await db
      .update(setupProgress)
      .set(data)
      .where(eq(setupProgress.productId, serviceId));

    return {
      success: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message ?? "Failed to update progress",
    };
  }
}

export async function createService(data: ProductForm) {
  try {
    const p = await requireProvider(true);
    const validate = z.safeParse(productSchema, data);
    if (!validate.success)
      return {
        success: false,
        error: "Validation error",
      };

    const result = await db.transaction(async (tx) => {
      const [res] = await tx
        .insert(products)
        .values({
          providerId: p.id,
          status: "draft",
          type: p.serviceType,
          slug: generateSlug(validate.data.title),
          ...(validate.data as any),
        })
        .returning({
          id: products.id,
        });

      await tx.insert(setupProgress).values({
        productId: res.id,
        mainInfo: true,
        hasScore: false,
      });

      return res.id;
    });

    if (!result)
      return {
        success: false,
        error: "Failed to save service",
      };

    return { success: true, result };
  } catch (err: any) {
    return {
      success: false,
      error: err.message ?? "Failed to save service",
    };
  }
}

export async function createVarinats(
  serviceId: string,
  variants: VariantForm[],
) {
  if (!serviceId) return { success: false, error: "Service id is missing" };

  if (!variants.length)
    return { success: false, error: "Variants cannot be empty" };

  try {
    await requireProvider(true);
    const validate = z.array(variantSchema).safeParse(variants);
    if (!validate.success) {
      return {
        success: false,
        error: "Validation error",
      };
    }

    const result = await db.transaction(async (tx) => {
      // Check service exists
      const [check] = await tx
        .select()
        .from(products)
        .where(eq(products.id, serviceId))
        .limit(1);

      if (!check) {
        return { success: false, error: "Main service not found" };
      }

      // transform and normalize variant data for database insertion
      const mapped = validate.data.map((v) => ({
        productId: serviceId,
        startDate: new Date(v.startDate),
        endDate: new Date(v.endDate),
        capacity: Number(v.capacity),
        adultPrice: v.adultPrice,
        childPrice: v.childPrice,
        infantPrice: v.infantPrice,
        status: v.status,
        name: v.name,
      }));

      // Create variants
      await tx.insert(productVariants).values(mapped);

      return {
        success: true,
        result: null,
      };
    });

    // update the setup progress
    if (result.success) {
      await updateSetupProgress(serviceId, {
        hasVariants: true,
      });
    }

    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message ?? "Failed to create variants",
    };
  }
}
