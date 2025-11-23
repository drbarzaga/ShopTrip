"use server";

import { db } from "@/db";
import { tripItem, user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getTripItems(tripId: string) {
  try {
    const items = await db
      .select({
        id: tripItem.id,
        tripId: tripItem.tripId,
        name: tripItem.name,
        description: tripItem.description,
        price: tripItem.price,
        quantity: tripItem.quantity,
        purchased: tripItem.purchased,
        purchasedAt: tripItem.purchasedAt,
        purchasedBy: tripItem.purchasedBy,
        addedBy: tripItem.addedBy,
        createdAt: tripItem.createdAt,
        updatedAt: tripItem.updatedAt,
        // Información del usuario que compró
        purchasedByName: user.name,
        purchasedByImage: user.image,
      })
      .from(tripItem)
      .leftJoin(user, eq(tripItem.purchasedBy, user.id))
      .where(eq(tripItem.tripId, tripId))
      .orderBy(tripItem.createdAt);

    return items;
  } catch (error) {
    console.error("Error getting trip items:", error);
    return [];
  }
}


