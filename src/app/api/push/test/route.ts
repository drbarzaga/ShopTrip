import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { sendOneSignalNotification } from "@/lib/onesignal-push";

/**
 * Endpoint de prueba para enviar notificaciones push usando OneSignal
 * GET /api/push/test?userId=xxx&title=Test&body=Test message
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || session.user.id;
    const title = searchParams.get("title") || "Test Notification";
    const body = searchParams.get("body") || "This is a test notification";

    console.log(
      `[Push Test] Sending OneSignal test notification to user ${userId}`
    );

    // Verificar primero si el usuario tiene un Player ID registrado
    const { getUserFCMTokens } = await import("@/lib/fcm-tokens");
    const tokens = await getUserFCMTokens([userId]);

    let hasPlayerId = false;
    const playerIds: string[] = [];

    for (const token of tokens) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.type === "onesignal" && parsed.userId) {
          hasPlayerId = true;
          playerIds.push(parsed.userId);
        }
      } catch {
        // Ignore
      }
    }

    if (!hasPlayerId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No OneSignal Player ID found for this user. Please subscribe to notifications first.",
          userId,
          tokensFound: tokens.length,
        },
        { status: 400 }
      );
    }

    console.log(
      `[Push Test] Found ${playerIds.length} Player ID(s): ${playerIds.join(", ")}`
    );

    const result = await sendOneSignalNotification([userId], {
      title,
      body,
      data: {
        type: "test",
        tripId: "",
        itemId: "",
      },
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Test notification sent via OneSignal",
        messageId: result.messageId,
        userId,
        playerIds,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send notification",
          userId,
          playerIds,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Push Test] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
