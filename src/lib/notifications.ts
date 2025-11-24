"use server";

import { db } from "@/db";
import { user, trip, tripItem, member } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getActiveOrganizationId } from "@/lib/auth-server";

export type NotificationType =
  | "trip_created"
  | "trip_updated"
  | "item_created"
  | "item_updated"
  | "item_purchased";

/**
 * Obtiene los usuarios que deberían recibir notificaciones para un viaje
 */
export async function getUsersToNotifyForTrip(tripId: string): Promise<string[]> {
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
      console.warn(`[Notifications] Trip ${tripId} not found`);
      return [];
    }

    const tripRecord = tripData[0];

    // Si el viaje no tiene organización, solo notificar al creador
    if (!tripRecord.organizationId) {
      return [tripRecord.userId];
    }

    // Si tiene organización, obtener todos los miembros
    const members = await db
      .select({ userId: member.userId })
      .from(member)
      .where(eq(member.organizationId, tripRecord.organizationId));

    return members.map((m) => m.userId);
  } catch (error) {
    console.error("[Notifications] Error getting users to notify:", error);
    return [];
  }
}

/**
 * Envía notificación usando OneSignal
 */
export async function createNotification(
  type: NotificationType,
  title: string,
  message: string,
  userIds: string[],
  tripId?: string,
  itemId?: string
): Promise<void> {
  try {
    const { sendOneSignalNotification } = await import("@/lib/onesignal-push");
    const url = tripId ? `/trips/${tripId}` : undefined;
    
    const result = await sendOneSignalNotification(userIds, {
      title,
      body: message,
      data: {
        type,
        tripId: tripId || "",
        itemId: itemId || "",
      },
      url,
    });
    
    if (result.success) {
      console.log(`[Notifications] OneSignal notification sent: ${result.messageId}`);
    } else {
      console.warn(`[Notifications] OneSignal notification failed: ${result.error}`);
    }
  } catch (error) {
    console.error("[Notifications] Error sending notification:", error);
  }
}

/**
 * Notifica cuando se crea un viaje
 */
export async function notifyTripCreated(
  tripId: string,
  tripName: string,
  creatorName: string
): Promise<void> {
  const userIds = await getUsersToNotifyForTrip(tripId);
  const activeOrgId = await getActiveOrganizationId();
  
  const title = activeOrgId 
    ? "Nuevo viaje creado"
    : "Viaje creado";
  const message = activeOrgId
    ? `${creatorName} creó el viaje "${tripName}"`
    : `Creaste el viaje "${tripName}"`;

  await createNotification(
    "trip_created",
    title,
    message,
    userIds,
    tripId
  );
}

/**
 * Notifica cuando se actualiza un viaje
 */
export async function notifyTripUpdated(
  tripId: string,
  tripName: string,
  updaterName: string
): Promise<void> {
  const userIds = await getUsersToNotifyForTrip(tripId);
  
  await createNotification(
    "trip_updated",
    "Viaje actualizado",
    `${updaterName} actualizó el viaje "${tripName}"`,
    userIds,
    tripId
  );
}

/**
 * Notifica cuando se crea un producto
 */
export async function notifyItemCreated(
  tripId: string,
  itemName: string,
  creatorName: string
): Promise<void> {
  const userIds = await getUsersToNotifyForTrip(tripId);
  
  await createNotification(
    "item_created",
    "Nuevo producto agregado",
    `${creatorName} agregó "${itemName}"`,
    userIds,
    tripId
  );
}

/**
 * Notifica cuando se actualiza un producto
 */
export async function notifyItemUpdated(
  tripId: string,
  itemName: string,
  updaterName: string
): Promise<void> {
  const userIds = await getUsersToNotifyForTrip(tripId);
  
  await createNotification(
    "item_updated",
    "Producto actualizado",
    `${updaterName} actualizó "${itemName}"`,
    userIds,
    tripId
  );
}

/**
 * Notifica cuando se marca un producto como comprado
 */
export async function notifyItemPurchased(
  tripId: string,
  itemName: string,
  purchaserName: string
): Promise<void> {
  const userIds = await getUsersToNotifyForTrip(tripId);
  
  await createNotification(
    "item_purchased",
    "Producto comprado",
    `${purchaserName} compró "${itemName}"`,
    userIds,
    tripId
  );
}
