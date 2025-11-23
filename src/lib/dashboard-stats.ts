"use server";

import { db } from "@/db";
import { trip, tripItem } from "@/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

export async function getDashboardStats(userId: string) {
  try {
    // Get all trips for the user
    const userTrips = await db
      .select({ id: trip.id })
      .from(trip)
      .where(eq(trip.userId, userId));

    const tripIds = userTrips.map((t) => t.id);

    if (tripIds.length === 0) {
      return {
        totalTrips: 0,
        activeTrips: 0,
        completedTrips: 0,
        totalItems: 0,
        purchasedItems: 0,
        pendingItems: 0,
        totalSpent: 0,
        totalBudget: 0,
        averageItemPrice: 0,
      };
    }

    // Get total trips count
    const totalTrips = userTrips.length;

    // Get active trips (trips with endDate in the future or null)
    const activeTrips = await db
      .select({ id: trip.id })
      .from(trip)
      .where(
        and(
          eq(trip.userId, userId),
          sql`(${trip.endDate} IS NULL OR ${trip.endDate} > NOW())`
        )
      );

    const activeTripsCount = activeTrips.length;
    const completedTrips = totalTrips - activeTripsCount;

    // Get items statistics
    const itemsStats = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        purchased: sql<number>`COUNT(*) FILTER (WHERE ${tripItem.purchased} = true)::int`,
        totalSpent: sql<number>`COALESCE(SUM(${tripItem.price} * ${tripItem.quantity}) FILTER (WHERE ${tripItem.purchased} = true), 0)`,
        totalBudget: sql<number>`COALESCE(SUM(${tripItem.price} * ${tripItem.quantity}), 0)`,
        avgPrice: sql<number>`COALESCE(AVG(${tripItem.price}) FILTER (WHERE ${tripItem.purchased} = true), 0)`,
      })
      .from(tripItem)
      .where(inArray(tripItem.tripId, tripIds));

    const stats = itemsStats[0];

    return {
      totalTrips,
      activeTrips: activeTripsCount,
      completedTrips,
      totalItems: Number(stats?.total || 0),
      purchasedItems: Number(stats?.purchased || 0),
      pendingItems: Number(stats?.total || 0) - Number(stats?.purchased || 0),
      totalSpent: Number(stats?.totalSpent || 0),
      totalBudget: Number(stats?.totalBudget || 0),
      averageItemPrice: Number(stats?.avgPrice || 0),
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      totalTrips: 0,
      activeTrips: 0,
      completedTrips: 0,
      totalItems: 0,
      purchasedItems: 0,
      pendingItems: 0,
      totalSpent: 0,
      totalBudget: 0,
      averageItemPrice: 0,
    };
  }
}

