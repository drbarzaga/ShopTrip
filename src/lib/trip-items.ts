"use server";

import { db } from "@/db";
import { tripItem } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getTripItems(tripId: string) {
  try {
    const items = await db
      .select()
      .from(tripItem)
      .where(eq(tripItem.tripId, tripId))
      .orderBy(tripItem.createdAt);

    return items;
  } catch (error) {
    console.error("Error getting trip items:", error);
    return [];
  }
}


