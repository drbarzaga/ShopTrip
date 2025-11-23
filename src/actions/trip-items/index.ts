"use server";

import { db } from "@/db";
import { tripItem, trip } from "@/db/schema";
import { success, failure } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/actions";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";

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
      return await failure("Item not found");
    }

    if (itemData[0].tripUserId !== session.user.id) {
      return await failure("You don't have permission to modify this item");
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

    return await success(undefined, purchased ? "Item marked as purchased" : "Item marked as not purchased");
  } catch (error) {
    console.error("Error toggling item purchased:", error);
    const message =
      (error as Error).message || "An error occurred while updating the item";
    return await failure(message);
  }
}

