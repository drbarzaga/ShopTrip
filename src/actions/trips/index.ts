"use server";

import { db } from "@/db";
import { trip, member } from "@/db/schema";
import { createTripSchema } from "@/schemas/trip";
import { withValidation, success, failure } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/actions";
import { getSession, getActiveOrganizationId } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq, desc, or, inArray, and, isNull } from "drizzle-orm";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";
import { getUserOrganizations } from "@/actions/organizations";

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

      // Obtener organización activa para asociar el viaje
      const activeOrganizationId = await getActiveOrganizationId();

      await db.insert(trip).values({
        id: tripId,
        name: data.name,
        slug: uniqueSlug,
        destination: data.destination || null,
        userId: session.user.id,
        organizationId: activeOrganizationId || null,
        startDate: startDate,
        endDate: endDate,
      });

      return await success(
        { id: tripId, slug: uniqueSlug },
        "¡Viaje creado exitosamente!"
      );
    } catch (error) {
      const message =
        (error as Error).message || "Ocurrió un error al crear el viaje";
      return await failure(message, undefined, data);
    }
  });
};

export async function getTrips(userId: string) {
  try {
    // Obtener todas las organizaciones de las que el usuario es miembro
    const userOrganizations = await getUserOrganizations(userId);
    const organizationIds = userOrganizations.map((org) => org.id);

    // Construir condiciones: viajes de las organizaciones del usuario O viajes personales (sin organización) creados por el usuario
    const conditions = [
      // Viajes personales del usuario (sin organización)
      and(eq(trip.userId, userId), isNull(trip.organizationId)),
    ];

    // Si el usuario es miembro de organizaciones, agregar condición para viajes de esas organizaciones
    if (organizationIds.length > 0) {
      conditions.push(inArray(trip.organizationId, organizationIds));
    }

    // Si solo hay una condición, usar esa condición directamente; si hay múltiples, usar or()
    const whereCondition =
      conditions.length === 1 ? conditions[0] : or(...conditions);

    const trips = await db
      .select({
        id: trip.id,
        name: trip.name,
        slug: trip.slug,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        organizationId: trip.organizationId,
        createdAt: trip.createdAt,
        updatedAt: trip.updatedAt,
      })
      .from(trip)
      .where(whereCondition)
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

    if (tripData.length === 0) {
      return null;
    }

    const tripRecord = tripData[0];

    // Si el viaje es personal (sin organización), verificar que sea del usuario
    if (!tripRecord.organizationId) {
      if (tripRecord.userId !== userId) {
        return null;
      }
      return tripRecord;
    }

    // Si el viaje pertenece a una organización, verificar que el usuario sea miembro
    const membership = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, tripRecord.organizationId),
          eq(member.userId, userId)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return null;
    }

    return tripRecord;
  } catch (error) {
    console.error("Error getting trip:", error);
    return null;
  }
}
