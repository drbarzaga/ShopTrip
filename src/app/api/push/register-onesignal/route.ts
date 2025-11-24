import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/db";
import { fcmToken } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Registra el OneSignal User ID para un usuario
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { onesignalUserId } = body;

    if (!onesignalUserId || typeof onesignalUserId !== "string") {
      return NextResponse.json(
        { error: "OneSignal User ID is required" },
        { status: 400 }
      );
    }

    console.log(`[OneSignal Register] Registering OneSignal User ID ${onesignalUserId} for user ${session.user.id}`);

    // Almacenar el OneSignal User ID (Player ID) asociado con el usuario
    // Usamos la tabla fcm_tokens para almacenar los OneSignal Player IDs
    const onesignalToken = JSON.stringify({
      type: "onesignal",
      userId: onesignalUserId,
      endpoint: `onesignal://${onesignalUserId}`,
    });

    // Verificar si ya existe un token de OneSignal para este usuario
    const existing = await db
      .select({ id: fcmToken.id, token: fcmToken.token })
      .from(fcmToken)
      .where(eq(fcmToken.userId, session.user.id));

    // Buscar si ya existe este player ID específico
    const existingOneSignal = existing.find((t) => {
      try {
        const parsed = JSON.parse(t.token);
        return parsed.type === "onesignal" && parsed.userId === onesignalUserId;
      } catch {
        return false;
      }
    });

    if (existingOneSignal) {
      // Ya existe este player ID, actualizar timestamp
      console.log(`[OneSignal Register] Player ID already registered, updating timestamp`);
      await db
        .update(fcmToken)
        .set({
          updatedAt: new Date(),
        })
        .where(eq(fcmToken.id, existingOneSignal.id));
    } else {
      // Crear nuevo registro para este player ID
      const tokenId = crypto.randomUUID();
      const deviceInfo = `OneSignal | ${new Date().toISOString()}`;
      
      await db.insert(fcmToken).values({
        id: tokenId,
        userId: session.user.id,
        token: onesignalToken,
        deviceInfo: deviceInfo,
      });
      console.log(`[OneSignal Register] New player ID registered: ${onesignalUserId}`);
    }

    console.log(`[OneSignal Register] Successfully registered OneSignal User ID ${onesignalUserId} for user ${session.user.id}`);
    return NextResponse.json({ 
      success: true,
      userId: session.user.id,
      onesignalUserId: onesignalUserId 
    });
  } catch (error) {
    console.error("[OneSignal Register] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

