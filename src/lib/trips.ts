"use server";

import { db } from "@/db";
import { trip } from "@/db/schema";
import { eq, desc, or, inArray, and, isNull } from "drizzle-orm";
import { getUserOrganizations } from "@/actions/organizations";

export async function getRecentTrips(userId: string, limit: number = 5) {
  try {
    // Obtener todas las organizaciones de las que el usuario es miembro
    const userOrganizations = await getUserOrganizations(userId);
    const organizationIds = userOrganizations.map(org => org.id);

    // Construir condiciones: viajes de las organizaciones del usuario O viajes personales (sin organización) creados por el usuario
    const conditions = [
      // Viajes personales del usuario (sin organización)
      and(
        eq(trip.userId, userId),
        isNull(trip.organizationId)
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
      .where(whereCondition)
      .orderBy(desc(trip.updatedAt))
      .limit(limit);

    return recentTrips;
  } catch (error) {
    console.error("Error getting recent trips:", error);
    return [];
  }
}

