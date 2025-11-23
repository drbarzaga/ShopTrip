"use server";

import { db } from "@/db";
import { trip } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getRecentTrips(userId: string, limit: number = 5) {
  try {
    const recentTrips = await db
      .select({
        id: trip.id,
        name: trip.name,
        slug: trip.slug,
        destination: trip.destination,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
      })
      .from(trip)
      .where(eq(trip.userId, userId))
      .orderBy(desc(trip.updatedAt))
      .limit(limit);

    return recentTrips;
  } catch (error) {
    console.error("Error getting recent trips:", error);
    return [];
  }
}

