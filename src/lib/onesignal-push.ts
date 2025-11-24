"use server";

import { getUserFCMTokens } from "@/lib/fcm-tokens";

/**
 * Envía notificaciones push usando OneSignal
 * OneSignal tiene mejor soporte para PWAs en iOS que Web Push nativo
 */

interface OneSignalNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
  url?: string;
}

/**
 * Envía notificación push usando OneSignal API
 */
export async function sendOneSignalNotification(
  userIds: string[],
  notification: OneSignalNotification
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_API_KEY;

    if (!appId || !apiKey) {
      console.warn("[OneSignal] App ID or API Key not configured");
      return { success: false, error: "OneSignal not configured" };
    }

    // Obtener tokens de suscripción (OneSignal usa los mismos tokens)
    const tokens = await getUserFCMTokens(userIds);
    
    if (tokens.length === 0) {
      console.warn("[OneSignal] No tokens found for users");
      return { success: false, error: "No tokens found" };
    }

    // Extraer OneSignal player IDs de los tokens almacenados
    const playerIds: string[] = [];
    
    for (const token of tokens) {
      try {
        const parsed = JSON.parse(token);
        // Si es un token de OneSignal, extraer el player ID
        if (parsed.type === "onesignal" && parsed.userId) {
          playerIds.push(parsed.userId);
        }
      } catch {
        // Ignorar tokens que no son de OneSignal
      }
    }

    // Si no hay player IDs de OneSignal, intentar enviar a todos los usuarios
    // o usar los tokens de Web Push como fallback
    const requestBody: Record<string, unknown> = {
      app_id: appId,
      headings: { en: notification.title },
      contents: { en: notification.body },
      data: notification.data || {},
    };

    if (notification.url) {
      requestBody.url = notification.url;
    }

    // Si tenemos player IDs específicos, usarlos; sino enviar a todos
    if (playerIds.length > 0) {
      requestBody.include_player_ids = playerIds;
      console.log(`[OneSignal] Sending to ${playerIds.length} specific players`);
    } else {
      // Enviar a todos los usuarios suscritos (útil para desarrollo)
      requestBody.included_segments = ["Subscribed Users"];
      console.log(`[OneSignal] No specific player IDs, sending to all subscribed users`);
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OneSignal] Error sending notification:", errorText);
      return { success: false, error: errorText };
    }

    const result = await response.json();
    console.log("[OneSignal] Notification sent successfully:", result.id);
    
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error("[OneSignal] Error:", error);
    return { success: false, error: String(error) };
  }
}

