"use server";

import { db } from "@/db";
import { trip } from "@/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { getUserOrganizations } from "@/actions/organizations";
import { getActiveOrganizationId } from "@/lib/auth-server";

export async function getRecentTrips(userId: string, limit: number = 5) {
  try {
    // Obtener organización activa
    const activeOrganizationId = await getActiveOrganizationId();

    // Si hay una organización activa, mostrar solo los viajes de esa organización
    if (activeOrganizationId) {
      // Verificar que el usuario sea miembro de la organización activa
      const userOrganizations = await getUserOrganizations(userId);
      const isMember = userOrganizations.some(org => org.id === activeOrganizationId);

      if (isMember) {
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
          .where(eq(trip.organizationId, activeOrganizationId))
          .orderBy(desc(trip.updatedAt))
          .limit(limit);

        return recentTrips;
      }
    }

    // Si no hay organización activa, mostrar solo viajes personales (sin organización)
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
      .where(and(eq(trip.userId, userId), isNull(trip.organizationId)))
      .orderBy(desc(trip.updatedAt))
      .limit(limit);

    return recentTrips;
  } catch (error) {
    console.error("Error getting recent trips:", error);
    return [];
  }
}

