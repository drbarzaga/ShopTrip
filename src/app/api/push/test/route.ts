import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { sendPushNotification } from "@/lib/web-push";

/**
 * Endpoint de prueba para enviar notificaciones push
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

    console.log(`[Push Test] Sending test notification to user ${userId}`);

    await sendPushNotification([userId], {
      title,
      body,
      data: {
        type: "test",
        tripId: "",
        itemId: "",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test notification sent",
      userId,
    });
  } catch (error) {
    console.error("[Push Test] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}



