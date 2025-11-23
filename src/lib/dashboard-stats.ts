"use server";

import { db } from "@/db";
import { trip, tripItem } from "@/db/schema";
import { eq, and, sql, inArray, or } from "drizzle-orm";
import { getUserOrganizations } from "@/actions/organizations";

export async function getDashboardStats(userId: string) {
  try {
    // Obtener todas las organizaciones de las que el usuario es miembro
    const userOrganizations = await getUserOrganizations(userId);
    const organizationIds = userOrganizations.map(org => org.id);

    // Construir condiciones: viajes de las organizaciones del usuario O viajes personales (sin organización) creados por el usuario
    const conditions = [
      // Viajes personales del usuario (sin organización)
      and(
        eq(trip.userId, userId),
        eq(trip.organizationId, null)
      )
    ];

    // Si el usuario es miembro de organizaciones, agregar condición para viajes de esas organizaciones
    if (organizationIds.length > 0) {
      conditions.push(inArray(trip.organizationId, organizationIds));
    }

    // Si solo hay una condición, usar esa condición directamente; si hay múltiples, usar or()
    const whereCondition = conditions.length === 1 
      ? conditions[0] 
      : or(...conditions);

    // Get all trips accessible to the user
    const userTrips = await db
      .select({ id: trip.id })
      .from(trip)
      .where(whereCondition);

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
          whereCondition,
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

