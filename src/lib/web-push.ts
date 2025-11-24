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

    // Payload optimizado para iOS y otros navegadores
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      ...notificationData, // Incluir tripId, itemId, type directamente en el nivel superior
      data: notificationData, // También mantener en data para compatibilidad
      // Campos adicionales para mejor compatibilidad con iOS
      icon: "/icon.svg",
      badge: "/icon.svg",
    });

    console.log(`[Push] Payload: ${payload}`);
    console.log(`[Push] Payload length: ${payload.length} bytes`);

    // Enviar notificación a cada token
    const results = await Promise.allSettled(
      tokens.map(async (token) => {
        let subscription: ReturnType<typeof JSON.parse> | null = null;
        try {
          subscription = JSON.parse(token);
          const endpoint = subscription.endpoint || "";
          const isIOS = /apple/i.test(endpoint) || /safari/i.test(endpoint);

          console.log(
            `[Push] Sending to token: ${subscription.keys?.p256dh?.substring(0, 20)}...`
          );
          console.log(`[Push] Endpoint: ${endpoint.substring(0, 80)}...`);
          console.log(`[Push] Detected iOS: ${isIOS}`);

          // Opciones específicas para webpush
          const options = {
            TTL: 86400, // 24 horas
            urgency: "normal" as const,
          };

          await webpush.sendNotification(subscription, payload, options);
          console.log(
            `[Push] ✅ Successfully sent notification${isIOS ? " (iOS)" : ""}`
          );
          return { success: true, token, isIOS };
        } catch (error: unknown) {
          const pushError = error as {
            statusCode?: number;
            message?: string;
            endpoint?: string;
            body?: string;
          };
          const endpoint = subscription?.endpoint || "";
          const isIOS = /apple/i.test(endpoint) || /safari/i.test(endpoint);

          console.error(
            `[Push] ❌ Error sending notification${isIOS ? " (iOS)" : ""}:`,
            {
              statusCode: pushError.statusCode,
              message: pushError.message,
              endpoint: endpoint.substring(0, 80),
              body: pushError.body,
            }
          );

          // Logging adicional para iOS
          if (isIOS) {
            console.error(`[Push] iOS-specific error details:`, {
              hasKeys: !!subscription?.keys,
              hasP256dh: !!subscription?.keys?.p256dh,
              hasAuth: !!subscription?.keys?.auth,
              endpointType: endpoint.includes("apple") ? "Apple Push" : "Other",
            });
          }

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
