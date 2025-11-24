"use server";

import { db } from "@/db";
import { user, trip, tripItem, member, notification } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
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
 * Envía notificación usando OneSignal y la guarda en la base de datos
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
    
    // Obtener el slug del viaje si hay tripId
    let url: string | undefined = undefined;
    if (tripId) {
      try {
        const tripData = await db
          .select({ slug: trip.slug })
          .from(trip)
          .where(eq(trip.id, tripId))
          .limit(1);
        
        if (tripData.length > 0) {
          url = `/trips/${tripData[0].slug}`;
        } else {
          url = "/trips"; // Fallback si no se encuentra el viaje
        }
      } catch (error) {
        console.error("[Notifications] Error getting trip slug:", error);
        url = "/trips"; // Fallback en caso de error
      }
    }
    
    // Enviar notificación push usando OneSignal
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
    
    // Guardar notificaciones en la base de datos para cada usuario
    try {
      const notificationPromises = userIds.map((userId) => {
        const notificationId = crypto.randomUUID();
        return db.insert(notification).values({
          id: notificationId,
          userId,
          type,
          title,
          message,
          tripId: tripId || null,
          itemId: itemId || null,
          read: false,
        });
      });
      
      await Promise.all(notificationPromises);
      console.log(`[Notifications] Saved ${userIds.length} notifications to database`);
    } catch (dbError) {
      console.error("[Notifications] Error saving notifications to database:", dbError);
      // No fallar si falla guardar en BD, la notificación push ya se envió
    }
  } catch (error) {
    console.error("[Notifications] Error sending notification:", error);
  }
}

/**
 * Obtiene las notificaciones de un usuario
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 50
): Promise<Array<{
  id: string;
  type: string;
  title: string;
  message: string;
  tripId: string | null;
  itemId: string | null;
  read: boolean;
  createdAt: Date;
}>> {
  try {
    const notifications = await db
      .select({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        tripId: notification.tripId,
        itemId: notification.itemId,
        read: notification.read,
        createdAt: notification.createdAt,
      })
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt))
      .limit(limit);

    return notifications;
  } catch (error) {
    console.error("[Notifications] Error getting user notifications:", error);
    return [];
  }
}

/**
 * Marca una notificación como leída
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    await db
      .update(notification)
      .set({ read: true })
      .where(
        and(
          eq(notification.id, notificationId),
          eq(notification.userId, userId)
        )
      );
    return true;
  } catch (error) {
    console.error("[Notifications] Error marking notification as read:", error);
    return false;
  }
}

/**
 * Marca todas las notificaciones de un usuario como leídas
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    await db
      .update(notification)
      .set({ read: true })
      .where(eq(notification.userId, userId));
    return true;
  } catch (error) {
    console.error("[Notifications] Error marking all notifications as read:", error);
    return false;
  }
}

/**
 * Obtiene el conteo de notificaciones no leídas de un usuario
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: notification.id })
      .from(notification)
      .where(
        and(
          eq(notification.userId, userId),
          eq(notification.read, false)
        )
      );
    return result.length;
  } catch (error) {
    console.error("[Notifications] Error getting unread notification count:", error);
    return 0;
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
  
  console.log(`[Notifications] notifyTripCreated - Trip: ${tripId}, Users: ${userIds.join(", ")}`);
  
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
  
  console.log(`[Notifications] notifyItemCreated - Trip: ${tripId}, Item: ${itemName}, Users: ${userIds.join(", ")}`);
  
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
