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
    // Verificar que las VAPID keys estén configuradas
    if (
      !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
      !process.env.VAPID_PRIVATE_KEY ||
      !process.env.VAPID_EMAIL
    ) {
      console.warn(
        "VAPID keys not configured. Push notifications will not work."
      );
      return;
    }

    console.log(
      `[Push] Attempting to send notification to ${userIds.length} users`
    );
    console.log(
      `[Push] Notification: ${notification.title} - ${notification.body}`
    );

    // Obtener tokens de suscripción de los usuarios
    const tokens = await getUserFCMTokens(userIds);
    console.log(
      `[Push] Found ${tokens.length} tokens for ${userIds.length} users`
    );

    if (tokens.length === 0) {
      console.warn(`[Push] No tokens found for users: ${userIds.join(", ")}`);
      return; // No hay tokens registrados
    }

    // Formatear payload según especificación Web Push
    // El service worker espera title, body, data, tripId e itemId en el nivel superior
    const notificationData = notification.data || {};
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      ...notificationData, // Incluir tripId, itemId, type directamente en el nivel superior
      data: notificationData, // También mantener en data para compatibilidad
    });

    console.log(`[Push] Payload: ${payload}`);

    // Enviar notificación a cada token
    const results = await Promise.allSettled(
      tokens.map(async (token) => {
        try {
          const subscription = JSON.parse(token);
          console.log(
            `[Push] Sending to token: ${subscription.keys?.p256dh?.substring(0, 20)}...`
          );
          await webpush.sendNotification(subscription, payload);
          console.log(`[Push] Successfully sent notification`);
          return { success: true, token };
        } catch (error: unknown) {
          const pushError = error as {
            statusCode?: number;
            message?: string;
            endpoint?: string;
          };
          console.error(`[Push] Error sending notification:`, {
            statusCode: pushError.statusCode,
            message: pushError.message,
            endpoint: pushError.endpoint,
          });

          // Si el token es inválido o expiró, eliminarlo
          if (pushError.statusCode === 410 || pushError.statusCode === 404) {
            console.log(
              `[Push] Removing invalid token (status: ${pushError.statusCode})`
            );
            const { removeFCMTokens } = await import("@/lib/fcm-tokens");
            await removeFCMTokens([token]);
          }
          return { success: false, token, error: pushError };
        }
      })
    );

    const successful = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failed = results.length - successful;
    console.log(
      `[Push] Notification send complete: ${successful} successful, ${failed} failed`
    );
  } catch (error) {
    console.error("[Push] Error sending push notification:", error);
    throw error;
  }
}
