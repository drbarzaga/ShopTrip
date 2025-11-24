"use server";

import { db } from "@/db";
import { fcmToken } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

/**
 * Registra un token de suscripción push para un usuario
 */
export async function registerFCMToken(
  userId: string,
  subscription: string, // JSON string de la suscripción push
  deviceInfo?: string
): Promise<void> {
  try {
    // Verificar si el token ya existe
    const existing = await db
      .select({ id: fcmToken.id })
      .from(fcmToken)
      .where(eq(fcmToken.token, subscription))
      .limit(1);

    if (existing.length > 0) {
      // Actualizar el token existente
      await db
        .update(fcmToken)
        .set({
          userId,
          deviceInfo: deviceInfo || null,
          updatedAt: new Date(),
        })
        .where(eq(fcmToken.token, subscription));
    } else {
      // Crear nuevo token
      const tokenId = crypto.randomUUID();
      await db.insert(fcmToken).values({
        id: tokenId,
        userId,
        token: subscription,
        deviceInfo: deviceInfo || null,
      });
    }
  } catch (error) {
    console.error("Error registering push token:", error);
    throw error;
  }
}

/**
 * Obtiene todos los tokens FCM de los usuarios especificados
 */
export async function getUserFCMTokens(userIds: string[]): Promise<string[]> {
  try {
    if (userIds.length === 0) {
      console.log("[FCM] No user IDs provided");
      return [];
    }

    console.log(`[FCM] Fetching tokens for ${userIds.length} users: ${userIds.join(", ")}`);

    const tokens = await db
      .select({ token: fcmToken.token })
      .from(fcmToken)
      .where(inArray(fcmToken.userId, userIds));

    console.log(`[FCM] Found ${tokens.length} tokens in database`);
    
    const tokenStrings = tokens.map((t) => t.token);
    
    // Log token details (sin exponer información sensible)
    tokenStrings.forEach((token, index) => {
      try {
        const parsed = JSON.parse(token);
        console.log(`[FCM] Token ${index + 1}: endpoint=${parsed.endpoint?.substring(0, 50)}...`);
      } catch {
        console.log(`[FCM] Token ${index + 1}: (invalid JSON)`);
      }
    });

    return tokenStrings;
  } catch (error) {
    console.error("[FCM] Error getting FCM tokens:", error);
    return [];
  }
}

/**
 * Elimina tokens FCM inválidos
 */
export async function removeFCMTokens(tokens: string[]): Promise<void> {
  try {
    if (tokens.length === 0) {
      return;
    }

    await db.delete(fcmToken).where(inArray(fcmToken.token, tokens));
  } catch (error) {
    console.error("Error removing FCM tokens:", error);
  }
}

/**
 * Elimina todos los tokens FCM de un usuario
 */
export async function removeUserFCMTokens(userId: string): Promise<void> {
  try {
    await db.delete(fcmToken).where(eq(fcmToken.userId, userId));
  } catch (error) {
    console.error("Error removing user FCM tokens:", error);
  }
}

