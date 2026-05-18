"use server";

import { db } from "@/db";
import {
  experiences,
  itineraries,
  location,
  products,
  productVariants,
  setupProgress,
} from "@/db/schemas";
import {
  ExperienceForm,
  experienceSchema,
  locationValidator,
  LocationValType,
  ProductForm,
  productSchema,
  VariantForm,
  variantSchema,
} from "@/validations";
import { eq, InferInsertModel } from "drizzle-orm";
import z from "zod";
import { generateSlug } from "@/lib/utils";
import { getCurrentProvider } from "@/lib/provider-auth";
import {
  DifficultyLevel,
  ExperienceType,
  SetupProgress,
} from "@/lib/all-types";
import { locationSlugGenerator } from "@/lib/helpers";

type LocationInsert = InferInsertModel<typeof location>;

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

export async function createLocations(
  serviceId: string,
  locations: LocationValType[],
) {
  if (!serviceId) return { success: false, error: "Service id is missing" };
  if (!locations.length)
    return { success: false, error: "Location items cannot be empty" };

  try {
    await requireProvider(true);
    const validate = z.array(locationValidator).safeParse(locations);
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

      if (!check) return { success: false, error: "Main service not found" };

      // 2. normalize + generate slug
      const mapped: LocationInsert[] = locations.map((l) => {
        const slug = locationSlugGenerator({
          city: l.city,
          country: l.country,
          type: l.type,
        });

        return {
          productId: serviceId,
          city: l.city,
          slug,
          type: l.type,
          address: l.address,
          country: l.country,
          latitude: String(l.latitude),
          longitude: String(l.longitude),
        };
      });
      // insert the data
      await tx.insert(location).values(mapped);

      return {
        success: true,
        result: null,
      };
    });

    // update the setup progress
    if (result.success) {
      await updateSetupProgress(serviceId, {
        hasLocation: true,
      });
    }

    return result;
  } catch (err: any) {
    return {
      success: false,
      error: err.message ?? "Failed to create locations",
    };
  }
}

export async function creatExperienceDetails(
  serviceId: string,
  metaData: ExperienceForm,
) {
  if (!serviceId) return { success: false, error: "Service id is missing" };
  if (!metaData) return { success: false, error: "Empty data not allowed" };

  try {
    await requireProvider(true);
    const validate = experienceSchema.safeParse(metaData);
    if (!validate.success) {
      return {
        success: false,
        error: "Validation error",
      };
    }

    const data = validate.data;
    const { itinerary } = data;

    // validate itinerary before transaction
    if (
      data.durationUnit === "days" &&
      itinerary?.length &&
      itinerary.length !== Number(data.durationCount)
    ) {
      throw new Error(
        `Itinerary count (${itinerary.length}) does not match duration count (${data.durationCount})`,
      );
    }

    // validate duplicate day numbers
    if (itinerary?.length) {
      const dayNumbers = itinerary.map(
        (item, index) => item.dayNumber ?? index + 1,
      );
      const uniqueDays = new Set(dayNumbers);
      if (uniqueDays.size !== itinerary.length) {
        throw new Error("Duplicate itinerary day numbers are not allowed");
      }
    }

    const result = await db.transaction(async (tx) => {
      // check service exists
      const [service] = await tx
        .select()
        .from(products)
        .where(eq(products.id, serviceId))
        .limit(1);

      if (!service) {
        throw new Error("Main service not found");
      }

      // create experience
      const [experience] = await tx
        .insert(experiences)
        .values({
          productId: serviceId,
          experienceType: data.experienceType as ExperienceType,
          difficultyLevel: data.difficultyLevel as DifficultyLevel,
          durationCount: Number(data.durationCount),
          durationUnit: data.durationUnit,
          included: data.included ?? [],
          notIncluded: data.notIncluded ?? [],
          requirements: data.requirements ?? [],
          ageRestriction: data.ageRestriction ?? null,
        })
        .returning();

      // create itinerary rows
      if (itinerary?.length) {
        const mapped = itinerary.map((item, index) => ({
          experienceId: experience.id,
          dayNumber: item.dayNumber ?? index + 1,
          title: item.title,
          description: item.description,
          activities: item.activities ?? [],
          mealsIncluded: item.mealsIncluded ?? [],
          accommodationInfo: item.accommodationInfo ?? null,
        }));

        await tx.insert(itineraries).values(mapped);
      }

      return {
        success: true,
        result: null,
      };
    });

    if (result.success) {
      await updateSetupProgress(serviceId, {
        hasMetadata: true,
      });
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}
