"use server";

import { db } from "@/db";
import { tripItem, trip } from "@/db/schema";
import { success, failure, withValidation } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/actions";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { createTripItemSchema } from "@/schemas/trip-item";

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
    // Verificar que el item existe y pertenece a un trip del usuario
    const itemData = await db
      .select({
        itemId: tripItem.id,
        tripId: tripItem.tripId,
        tripUserId: trip.userId,
      })
      .from(tripItem)
      .innerJoin(trip, eq(tripItem.tripId, trip.id))
      .where(eq(tripItem.id, itemId))
      .limit(1);

    if (itemData.length === 0) {
      return await failure("Artículo no encontrado");
    }

    if (itemData[0].tripUserId !== session.user.id) {
      return await failure("No tienes permiso para modificar este artículo");
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

      // Verificar que el viaje existe y pertenece al usuario
      const tripData = await db
        .select({ id: trip.id, userId: trip.userId })
        .from(trip)
        .where(eq(trip.id, tripId))
        .limit(1);

      if (tripData.length === 0) {
        return await failure("Viaje no encontrado");
      }

      if (tripData[0].userId !== session.user.id) {
        return await failure("No tienes permiso para agregar artículos a este viaje");
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


