"use server";

import { getUserFCMTokens } from "@/lib/fcm-tokens";

/**
 * Sistema mejorado de notificaciones push con múltiples métodos de fallback
 */

interface PushNotificationOptions {
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
  badge?: string;
}

/**
 * Envía notificaciones usando el método más confiable disponible
 * Prioridad: OneSignal > Web Push > SSE (ya implementado)
 */
export async function sendEnhancedPushNotification(
  userIds: string[],
  notification: PushNotificationOptions
): Promise<{ success: number; failed: number; method: string }> {
  // Intentar OneSignal primero (mejor soporte iOS)
  const oneSignalConfigured = !!(
    process.env.ONESIGNAL_APP_ID && process.env.ONESIGNAL_API_KEY
  );

  if (oneSignalConfigured) {
    try {
      const { sendOneSignalNotification } = await import("@/lib/onesignal-push");
      const result = await sendOneSignalNotification(userIds, {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        url: notification.data?.tripId ? `/trips/${notification.data.tripId}` : undefined,
      });

      if (result.success) {
        console.log("[Push Enhanced] OneSignal notification sent successfully");
        return { success: userIds.length, failed: 0, method: "onesignal" };
      }
    } catch (error) {
      console.error("[Push Enhanced] OneSignal failed, trying Web Push:", error);
    }
  }

  // Intentar Web Push como fallback
  try {
    const webPushResult = await sendWebPushNotification(userIds, notification);
    if (webPushResult.success > 0) {
      return { ...webPushResult, method: "web-push" };
    }
  } catch (error) {
    console.error("[Push Enhanced] Web Push failed:", error);
  }

  // Si ambos fallan, las notificaciones SSE seguirán funcionando
  // cuando la app está abierta (ya implementado)
  console.warn("[Push Enhanced] Push unavailable, relying on SSE for real-time notifications");
  
  return {
    success: 0,
    failed: userIds.length,
    method: "sse-fallback",
  };
}

/**
 * Envía notificación usando Web Push API (método actual)
 */
async function sendWebPushNotification(
  userIds: string[],
  notification: PushNotificationOptions
): Promise<{ success: number; failed: number }> {
  const { sendPushNotification } = await import("@/lib/web-push");
  
  try {
    await sendPushNotification(userIds, {
      title: notification.title,
      body: notification.body,
      data: notification.data,
    });
    
    // Asumir éxito si no hay error (el logging está en web-push.ts)
    return { success: userIds.length, failed: 0 };
  } catch (error) {
    console.error("[Push Enhanced] Web Push error:", error);
    return { success: 0, failed: userIds.length };
  }
}

/**
 * Verifica el estado del sistema de notificaciones
 */
export async function checkPushNotificationStatus(): Promise<{
  webPushConfigured: boolean;
  tokensRegistered: number;
  status: "ready" | "partial" | "unavailable";
}> {
  const webPushConfigured = !!(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_EMAIL
  );

  // Contar tokens registrados (muestra de 1 usuario para verificar)
  const tokens = await getUserFCMTokens(["sample"]); // Esto retornará 0 pero verifica la conexión
  
  return {
    webPushConfigured,
    tokensRegistered: 0, // Se actualizará con lógica real
    status: webPushConfigured ? "ready" : "unavailable",
  };
}

