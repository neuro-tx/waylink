"use server";

import { db } from "@/db";
import {
  experiences,
  itineraries,
  location,
  products,
  productVariants,
  setupProgress,
  transports,
  transportSchedules,
} from "@/db/schemas";
import {
  ExperienceForm,
  experienceSchema,
  locationValidator,
  LocationValType,
  ProductForm,
  productSchema,
  scheduleSchema,
  ScheduleType,
  TransportForm,
  transportSchema,
  VariantForm,
  variantSchema,
} from "@/validations";
import { and, eq, inArray, InferInsertModel } from "drizzle-orm";
import z from "zod";
import { generateSlug, getDistanceFromLocations } from "@/lib/utils";
import { getCurrentProvider } from "@/lib/provider-auth";
import {
  DifficultyLevel,
  ExperienceType,
  SeatType,
  SetupProgress,
  TransportClass,
  TransportType,
} from "@/lib/all-types";
import { locationSlugGenerator } from "@/lib/helpers";

type LocationInsert = InferInsertModel<typeof location>;
type ActionResponse =
  | { success: true; result: any[] }
  | { success: false; error: string };

type ActionResult<T = null> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

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
): Promise<ActionResult> {
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

      if (!service) throw new Error("Main service not found");

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
        success: true as const,
        data: null,
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

export async function getServiceVariants(
  serviceId: string,
): Promise<ActionResponse> {
  if (!serviceId) {
    return { success: false, error: "Service id is missing" };
  }

  try {
    const p = await requireProvider(true);
    // block any one access to the varinats
    const [service] = await db
      .select({
        provider: products.providerId,
      })
      .from(products)
      .where(eq(products.id, serviceId))
      .limit(1);
    if (!service)
      return {
        success: false,
        error: "Service not found",
      };

    if (service.provider !== p.id)
      return {
        success: false,
        error: "You do not have permission to access this service.",
      };
    const result = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, serviceId));

    return { success: true, result };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch variants",
    };
  }
}

export async function createTransportDetails(
  serviceId: string,
  metaData: TransportForm,
): Promise<ActionResult> {
  if (!serviceId) {
    return {
      success: false,
      error: "Service id is missing",
    };
  }
  if (!metaData) {
    return {
      success: false,
      error: "Empty data not allowed",
    };
  }

  try {
    const p = await requireProvider(true);

    const validate = transportSchema.safeParse(metaData);
    if (!validate.success) {
      return {
        success: false,
        error: "Validation error",
      };
    }

    const data = validate.data;

    const result = await db.transaction(async (tx) => {
      // validate service and permission && get location data
      const [[service], locs] = await Promise.all([
        tx
          .select({ id: products.id, provider: products.providerId })
          .from(products)
          .where(eq(products.id, serviceId))
          .limit(1),
        tx
          .select({
            lat: location.latitude,
            lon: location.longitude,
            type: location.type,
          })
          .from(location)
          .where(eq(location.productId, serviceId)),
      ]);

      if (!service) throw new Error("Main service not found");
      if (service.provider !== p.id)
        throw new Error("You do not have permission to access this service.");
      if (!locs.length) throw new Error("Location data has not been added yet");

      // validate start/end points
      const hasStart = locs.some((loc) => loc.type === "start");
      const hasEnd = locs.some((loc) => loc.type === "end");

      if (!hasStart || !hasEnd)
        throw new Error("Both start and end locations are required");

      // calculate distance
      const distance = Math.round(getDistanceFromLocations(locs));

      // create transport
      await tx.insert(transports).values({
        productId: service.id,
        transportType: data.transportType as TransportType,
        seatType: data.seatType as SeatType,
        transportClass: data.transportClass as TransportClass,
        hasDirectRoute: data.hasDirectRoute,
        distance,
        amenities: data.amenities ?? null,
        arrivalAddress: data.arrivalAddress ?? null,
        departureAddress: data.departureAddress ?? null,
        extraLuggageFee: data.extraLuggageFee ?? null,
        importantNotes: data.importantNotes ?? null,
        luggageAllowance: data.luggageAllowance ?? null,
      });

      return {
        success: true as const,
        data: null,
      };
    });

    return result;
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function createSchedules(
  serviceId: string,
  schedules: ScheduleType[],
): Promise<ActionResult> {
  if (!serviceId) {
    return {
      success: false,
      error: "Service id is missing",
    };
  }

  try {
    const provider = await requireProvider();
    const validate = z.array(scheduleSchema).safeParse(schedules);
    if (!validate.success) {
      return {
        success: false,
        error: "Some schedule data is invalid. Please review and try again.",
      };
    }

    const data = validate.data;
    const variantIds = [...new Set(data.map((schedule) => schedule.variantId))];
    const uniqueVariantIds = [...new Set(variantIds)];

    const result = await db.transaction(async (tx) => {
      const [[service], variants] = await Promise.all([
        tx
          .select({
            id: products.id,
            providerId: products.providerId,
          })
          .from(products)
          .where(eq(products.id, serviceId))
          .limit(1),

        tx
          .select({
            id: productVariants.id,
          })
          .from(productVariants)
          .where(
            and(
              eq(productVariants.productId, serviceId),
              inArray(productVariants.id, variantIds),
            ),
          ),
      ]);

      // validate service existence
      if (!service)
        throw new Error("The requested service could not be found.");
      // validate provider ownership
      if (service.providerId !== provider.id)
        throw new Error(
          "You do not have permission to manage schedules for this service.",
        );
      // ensure all submitted variants belong to this service
      const validVariantIds = new Set(variants.map((v) => v.id));

      if (uniqueVariantIds.some((id) => !validVariantIds.has(id)))
        throw new Error("Some selected variants are invalid or unavailable.");

      // transform schedules into database shape
      const mappedSchedules = data.map((schedule) => ({
        variantId: schedule.variantId,
        departureTime: new Date(schedule.departureDate),
        arrivalTime: new Date(schedule.arrivalDate),
        duration: Number(schedule.duration),
        checkInTime: schedule.checkInTime ?? null,
        stops: schedule.stops ?? [],
      }));

      await tx.insert(transportSchedules).values(mappedSchedules);

      return {
        success: true as const,
        data: null,
      };
    });

    // update setup progress after successful creation
    if (result.success) {
      await updateSetupProgress(serviceId, {
        hasMetadata: true,
      });
    }

    return result;
  } catch (error) {
    console.error("Create schedules error:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to create schedules right now. Please try again.",
    };
  }
}
