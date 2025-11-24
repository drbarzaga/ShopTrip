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

    // Almacenar el OneSignal User ID asociado con el usuario
    // Por ahora, lo almacenamos en la tabla fcm_tokens con un formato especial
    // En producción, podrías crear una tabla separada para OneSignal IDs
    
    const tokenId = crypto.randomUUID();
    const onesignalToken = JSON.stringify({
      type: "onesignal",
      userId: onesignalUserId,
      endpoint: `onesignal://${onesignalUserId}`,
    });

    // Verificar si ya existe
    const existing = await db
      .select({ id: fcmToken.id })
      .from(fcmToken)
      .where(eq(fcmToken.userId, session.user.id))
      .limit(1);

    if (existing.length > 0) {
      // Actualizar token existente
      await db
        .update(fcmToken)
        .set({
          token: onesignalToken,
          deviceInfo: "OneSignal",
          updatedAt: new Date(),
        })
        .where(eq(fcmToken.userId, session.user.id));
    } else {
      // Crear nuevo token
      await db.insert(fcmToken).values({
        id: tokenId,
        userId: session.user.id,
        token: onesignalToken,
        deviceInfo: "OneSignal",
      });
    }

    console.log(`[OneSignal Register] Successfully registered OneSignal User ID`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[OneSignal Register] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

