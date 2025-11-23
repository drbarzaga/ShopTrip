"use server";

import { db } from "@/db";
import { tripItem, trip, member } from "@/db/schema";
import { success, failure, withValidation } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/actions";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { createTripItemSchema } from "@/schemas/trip-item";

/**
 * Obtiene el rol del usuario en la organización de un viaje
 * Retorna 'owner' | 'admin' | 'member' | null si no es miembro o el viaje no tiene organización
 */
export async function getUserRoleInTripOrganization(
  userId: string,
  tripId: string
): Promise<"owner" | "admin" | "member" | null> {
  try {
    // Obtener el viaje y su organización
    const tripData = await db
      .select({
        organizationId: trip.organizationId,
        userId: trip.userId,
      })
      .from(trip)
      .where(eq(trip.id, tripId))
      .limit(1);

    if (tripData.length === 0) {
      return null;
    }

    const tripRecord = tripData[0];

    // Si el viaje no tiene organización, verificar si es el creador
    if (!tripRecord.organizationId) {
      return tripRecord.userId === userId ? "owner" : null;
    }

    // Si el viaje tiene organización, obtener el rol del usuario en esa organización
    const membership = await db
      .select({ role: member.role })
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

    return (membership[0].role as "owner" | "admin" | "member") || null;
  } catch (error) {
    console.error("Error getting user role in trip organization:", error);
    return null;
  }
}

/**
 * Marca un item como comprado o no comprado
 */
export async function toggleItemPurchasedAction(
  itemId: string,
  purchased: boolean
): Promise<ActionResult<void>> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  try {
    // Verificar que el item existe
    const itemData = await db
      .select({
        itemId: tripItem.id,
        tripId: tripItem.tripId,
      })
      .from(tripItem)
      .innerJoin(trip, eq(tripItem.tripId, trip.id))
      .where(eq(tripItem.id, itemId))
      .limit(1);

    if (itemData.length === 0) {
      return await failure("Artículo no encontrado");
    }

    // Verificar permisos basados en el rol del usuario en la organización del viaje
    const userRole = await getUserRoleInTripOrganization(
      session.user.id,
      itemData[0].tripId
    );

    // Solo owners y admins pueden marcar como comprado
    if (userRole !== "owner" && userRole !== "admin") {
      return await failure("Solo los propietarios y administradores pueden marcar artículos como comprados");
    }

    // Actualizar el estado de comprado
    await db
      .update(tripItem)
      .set({
        purchased,
        purchasedAt: purchased ? new Date() : null,
        purchasedBy: purchased ? session.user.id : null,
      })
      .where(eq(tripItem.id, itemId));

    return await success(undefined, purchased ? "Artículo marcado como comprado" : "Artículo marcado como no comprado");
  } catch (error) {
    console.error("Error toggling item purchased:", error);
    const message =
      (error as Error).message || "Ocurrió un error al actualizar el artículo";
    return await failure(message);
  }
}

/**
 * Crea un nuevo item para un viaje
 */
export const createTripItemAction = async (
  prevState: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return withValidation(formData, createTripItemSchema, async (data) => {
    try {
      const tripId = formData.get("tripId") as string;
      
      if (!tripId) {
        return await failure("El ID del viaje es requerido");
      }

      // Verificar que el viaje existe
      const tripData = await db
        .select({ id: trip.id })
        .from(trip)
        .where(eq(trip.id, tripId))
        .limit(1);

      if (tripData.length === 0) {
        return await failure("Viaje no encontrado");
      }

      // Verificar permisos basados en el rol del usuario en la organización del viaje
      const userRole = await getUserRoleInTripOrganization(
        session.user.id,
        tripId
      );

      // Solo owners y admins pueden agregar artículos
      if (userRole !== "owner" && userRole !== "admin") {
        return await failure("Solo los propietarios y administradores pueden agregar artículos");
      }

      const itemId = crypto.randomUUID();

      await db.insert(tripItem).values({
        id: itemId,
        tripId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        quantity: data.quantity,
        purchased: false,
        addedBy: session.user.id,
      });

      return await success({ id: itemId }, "¡Artículo agregado exitosamente!");
    } catch (error) {
      console.error("Error creating trip item:", error);
      const message =
        (error as Error).message || "Ocurrió un error al crear el artículo";
      return await failure(message, undefined, data);
    }
  });
}


