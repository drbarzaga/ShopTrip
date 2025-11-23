"use server";

import { db } from "@/db";
import { trip, member } from "@/db/schema";
import { createTripSchema } from "@/schemas/trip";
import { withValidation, success, failure } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/actions";
import { getSession, getActiveOrganizationId } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq, desc, and, isNull } from "drizzle-orm";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";
import { getUserOrganizations } from "@/actions/organizations";
import { getUserRoleInTripOrganization } from "@/actions/trip-items";

/**
 * Verifica si el usuario puede eliminar un viaje (solo owner)
 */
export async function canUserDeleteTrip(
  userId: string,
  tripId: string
): Promise<boolean> {
  try {
    const tripData = await db
      .select({
        userId: trip.userId,
        organizationId: trip.organizationId,
      })
      .from(trip)
      .where(eq(trip.id, tripId))
      .limit(1);

    if (tripData.length === 0) {
      return false;
    }

    const tripRecord = tripData[0];

    // Si es un viaje personal, solo el creador puede eliminarlo
    if (!tripRecord.organizationId) {
      return tripRecord.userId === userId;
    }

    // Si es un viaje de organización, solo el owner puede eliminarlo
    const userRole = await getUserRoleInTripOrganization(userId, tripId);
    return userRole === "owner";
  } catch (error) {
    console.error("Error checking if user can delete trip:", error);
    return false;
  }
}

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

      // Enviar notificación en tiempo real
      try {
        const { notifyTripCreated } = await import("@/lib/notifications");
        await notifyTripCreated(tripId, data.name, session.user.name || "Usuario");
      } catch (error) {
        console.error("Error sending trip creation notification:", error);
        // No fallar la creación del viaje si falla la notificación
      }

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
    // Obtener organización activa
    const activeOrganizationId = await getActiveOrganizationId();

    // Si hay una organización activa, mostrar solo los viajes de esa organización
    if (activeOrganizationId) {
      // Verificar que el usuario sea miembro de la organización activa
      const userOrganizations = await getUserOrganizations(userId);
      const isMember = userOrganizations.some(
        (org) => org.id === activeOrganizationId
      );

      if (isMember) {
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
          .where(eq(trip.organizationId, activeOrganizationId))
          .orderBy(desc(trip.updatedAt));

        return trips;
      }
    }

    // Si no hay organización activa, mostrar solo viajes personales (sin organización)
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
      .where(and(eq(trip.userId, userId), isNull(trip.organizationId)))
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

export const updateTripAction = async (
  prevState: ActionResult<{ slug: string }> | null,
  formData: FormData
): Promise<ActionResult<{ slug: string }>> => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return withValidation(formData, createTripSchema, async (data) => {
    try {
      const tripId = formData.get("tripId") as string;
      
      if (!tripId) {
        return await failure("El ID del viaje es requerido");
      }

      // Verificar que el viaje existe
      const tripData = await db
        .select({
          id: trip.id,
          organizationId: trip.organizationId,
          userId: trip.userId,
        })
        .from(trip)
        .where(eq(trip.id, tripId))
        .limit(1);

      if (tripData.length === 0) {
        return await failure("Viaje no encontrado");
      }

      const tripRecord = tripData[0];

      // Verificar permisos: si es personal, debe ser el creador; si es de organización, debe ser owner o admin
      if (!tripRecord.organizationId) {
        if (tripRecord.userId !== session.user.id) {
          return await failure("No tienes permisos para editar este viaje");
        }
      } else {
        const userRole = await getUserRoleInTripOrganization(
          session.user.id,
          tripId
        );
        if (userRole !== "owner" && userRole !== "admin") {
          return await failure("Solo los propietarios y administradores pueden editar viajes");
        }
      }

      const startDate = data.startDate ? new Date(data.startDate) : null;
      const endDate = data.endDate ? new Date(data.endDate) : null;

      // Actualizar el viaje
      await db
        .update(trip)
        .set({
          name: data.name,
          destination: data.destination || null,
          startDate: startDate,
          endDate: endDate,
        })
        .where(eq(trip.id, tripId));

      // Obtener el slug actualizado
      const updatedTrip = await db
        .select({ slug: trip.slug })
        .from(trip)
        .where(eq(trip.id, tripId))
        .limit(1);

      // Enviar notificación en tiempo real
      try {
        const { notifyTripUpdated } = await import("@/lib/notifications");
        await notifyTripUpdated(
          tripId,
          data.name,
          session.user.name || "Usuario"
        );
      } catch (error) {
        console.error("Error sending trip update notification:", error);
        // No fallar la acción si falla la notificación
      }

      return await success(
        { slug: updatedTrip[0]?.slug || "" },
        "¡Viaje actualizado exitosamente!"
      );
    } catch (error) {
      const message =
        (error as Error).message || "Ocurrió un error al actualizar el viaje";
      return await failure(message, undefined, data);
    }
  });
};

/**
 * Elimina un viaje
 * Solo el owner puede eliminar viajes
 */
export async function deleteTripAction(
  tripId: string
): Promise<ActionResult<void>> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  try {
    // Verificar que el viaje existe y obtener información
    const tripData = await db
      .select({
        id: trip.id,
        userId: trip.userId,
        organizationId: trip.organizationId,
      })
      .from(trip)
      .where(eq(trip.id, tripId))
      .limit(1);

    if (tripData.length === 0) {
      return await failure("Viaje no encontrado");
    }

    const tripRecord = tripData[0];

    // Si es un viaje personal, solo el creador puede eliminarlo
    if (!tripRecord.organizationId) {
      if (tripRecord.userId !== session.user.id) {
        return await failure("Solo el propietario del viaje puede eliminarlo");
      }
    } else {
      // Si es un viaje de organización, solo el owner puede eliminarlo
      const userRole = await getUserRoleInTripOrganization(
        session.user.id,
        tripId
      );
      if (userRole !== "owner") {
        return await failure("Solo el propietario de la organización puede eliminar viajes");
      }
    }

    // Eliminar el viaje (los items se eliminarán automáticamente por cascade)
    await db.delete(trip).where(eq(trip.id, tripId));

    return await success(undefined, "Viaje eliminado exitosamente");
  } catch (error) {
    console.error("Error deleting trip:", error);
    const message =
      (error as Error).message || "Ocurrió un error al eliminar el viaje";
    return await failure(message);
  }
}
