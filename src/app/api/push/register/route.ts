import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { registerFCMToken } from "@/lib/fcm-tokens";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscription, deviceInfo } = body;

    if (!subscription || typeof subscription !== "string") {
      return NextResponse.json(
        { error: "Subscription is required" },
        { status: 400 }
      );
    }

    await registerFCMToken(session.user.id, subscription, deviceInfo);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error registering push subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

