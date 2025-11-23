"use server";

import { db } from "@/db";
import { trip } from "@/db/schema";
import { createTripSchema } from "@/schemas/trip";
import { withValidation, success, failure } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/actions";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";

// -------------------------------- Trips Actions --------------------------------

export const createTripAction = async (
  prevState: ActionResult<{ id: string; slug: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string; slug: string }>> => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return withValidation(formData, createTripSchema, async (data) => {
    try {
      const tripId = crypto.randomUUID();
      const baseSlug = generateSlug(data.name);

      // Generar slug único
      const uniqueSlug = await generateUniqueSlug(baseSlug, async (slug) => {
        const existing = await db
          .select({ id: trip.id })
          .from(trip)
          .where(eq(trip.slug, slug))
          .limit(1);
        return existing.length > 0;
      });

      const startDate = data.startDate ? new Date(data.startDate) : null;
      const endDate = data.endDate ? new Date(data.endDate) : null;

      await db.insert(trip).values({
        id: tripId,
        name: data.name,
        slug: uniqueSlug,
        destination: data.destination || null,
        userId: session.user.id,
        startDate: startDate,
        endDate: endDate,
      });

      return await success({ id: tripId, slug: uniqueSlug }, "Trip created successfully!");
    } catch (error) {
      const message =
        (error as Error).message || "An error occurred while creating the trip";
      return await failure(message, undefined, data);
    }
  });
};

export async function getTrips(userId: string) {
  try {
    const trips = await db
      .select({
        id: trip.id,
        name: trip.name,
        slug: trip.slug,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
      })
      .from(trip)
      .where(eq(trip.userId, userId))
      .orderBy(desc(trip.updatedAt));

    return trips;
  } catch (error) {
    console.error("Error getting trips:", error);
    return [];
  }
}

export async function getTripBySlug(tripSlug: string, userId: string) {
  try {
    const tripData = await db
      .select()
      .from(trip)
      .where(eq(trip.slug, tripSlug))
      .limit(1);

    if (tripData.length === 0 || tripData[0].userId !== userId) {
      return null;
    }

    return tripData[0];
  } catch (error) {
    console.error("Error getting trip:", error);
    return null;
  }
}