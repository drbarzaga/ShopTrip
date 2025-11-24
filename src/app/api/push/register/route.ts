import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { registerFCMToken } from "@/lib/fcm-tokens";

export async function POST(request: NextRequest) {
  try {
    console.log("[Push Register] Received registration request");
    const session = await getSession();
    
    if (!session) {
      console.warn("[Push Register] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Push Register] User: ${session.user.id} (${session.user.name})`);

    const body = await request.json();
    const { subscription, deviceInfo } = body;

    if (!subscription || typeof subscription !== "string") {
      console.error("[Push Register] Missing or invalid subscription");
      return NextResponse.json(
        { error: "Subscription is required" },
        { status: 400 }
      );
    }

    // Parsear subscription para logging (sin exponer datos sensibles)
    try {
      const sub = JSON.parse(subscription);
      console.log(`[Push Register] Subscription endpoint: ${sub.endpoint?.substring(0, 50)}...`);
    } catch {
      console.log("[Push Register] Subscription is not valid JSON");
    }

    await registerFCMToken(session.user.id, subscription, deviceInfo);
    console.log(`[Push Register] Successfully registered token for user ${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Push Register] Error registering push subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

