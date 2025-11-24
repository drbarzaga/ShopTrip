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

    // Obtener OneSignal player IDs de los usuarios
    const tokens = await getUserFCMTokens(userIds);
    
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

    if (playerIds.length === 0) {
      console.warn(`[OneSignal] No OneSignal player IDs found for ${userIds.length} users`);
      console.warn(`[OneSignal] Users need to open the app and grant notification permissions`);
      return { success: false, error: "No OneSignal player IDs found" };
    }

    console.log(`[OneSignal] Found ${playerIds.length} OneSignal player IDs for ${userIds.length} users`);

    // Construir el cuerpo de la petición
    const requestBody: Record<string, unknown> = {
      app_id: appId,
      headings: { en: notification.title },
      contents: { en: notification.body },
      data: notification.data || {},
      include_player_ids: playerIds, // Enviar solo a los usuarios específicos
    };

    if (notification.url) {
      requestBody.url = notification.url;
    }

    console.log(`[OneSignal] Sending notification to ${playerIds.length} players`);

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

