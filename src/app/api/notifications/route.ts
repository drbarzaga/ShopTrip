import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
} from "@/lib/notifications";

/**
 * GET /api/notifications - Obtiene las notificaciones del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const notifications = await getUserNotifications(session.user.id, limit);

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("[Notifications API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications - Marca notificaciones como leídas
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAll } = body;

    if (markAll) {
      const success = await markAllNotificationsAsRead(session.user.id);
      return NextResponse.json({ success });
    } else if (notificationId) {
      const success = await markNotificationAsRead(
        notificationId,
        session.user.id
      );
      return NextResponse.json({ success });
    } else {
      return NextResponse.json(
        { error: "notificationId or markAll is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[Notifications API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

