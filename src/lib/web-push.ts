"use server";

import webpush from "web-push";
import { getUserFCMTokens } from "@/lib/fcm-tokens";

// Configurar VAPID keys
if (
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_EMAIL
) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Envía una notificación push a múltiples usuarios usando Web Push API
 */
export async function sendPushNotification(
  userIds: string[],
  notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }
): Promise<void> {
  try {
    // Obtener tokens de suscripción de los usuarios
    const tokens = await getUserFCMTokens(userIds);

    if (tokens.length === 0) {
      return; // No hay tokens registrados
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      ...notification.data,
    });

    // Enviar notificación a cada token
    const promises = tokens.map(async (token) => {
      try {
        await webpush.sendNotification(JSON.parse(token), payload);
      } catch (error: any) {
        // Si el token es inválido o expiró, eliminarlo
        if (error.statusCode === 410 || error.statusCode === 404) {
          const { removeFCMTokens } = await import("@/lib/fcm-tokens");
          await removeFCMTokens([token]);
        }
        console.error(`Error sending notification to token:`, error);
      }
    });

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
}

