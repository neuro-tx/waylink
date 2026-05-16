"use server";

import { db } from "@/db";
import { products, setupProgress } from "@/db/schemas";
import { ProductForm, productSchema } from "@/validations";
import { eq } from "drizzle-orm";
import z from "zod";
import { generateSlug } from "@/lib/utils";
import { getCurrentProvider } from "@/lib/provider-auth";

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
