import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getUnreadNotificationCount } from "@/lib/notifications";

/**
 * GET /api/notifications/count - Obtiene el conteo de notificaciones no leídas
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await getUnreadNotificationCount(session.user.id);

    return NextResponse.json({ count });
  } catch (error) {
    console.error("[Notifications Count API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

