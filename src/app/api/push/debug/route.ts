import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getUserFCMTokens } from "@/lib/fcm-tokens";

/**
 * Endpoint de diagnóstico para verificar el estado de las notificaciones
 * GET /api/push/debug
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokens = await getUserFCMTokens([session.user.id]);
    
    const playerIds: string[] = [];
    const tokenDetails: Array<{ type: string; userId?: string; endpoint?: string }> = [];
    
    for (const token of tokens) {
      try {
        const parsed = JSON.parse(token);
        tokenDetails.push({
          type: parsed.type || "unknown",
          userId: parsed.userId,
          endpoint: parsed.endpoint?.substring(0, 50),
        });
        
        if (parsed.type === "onesignal" && parsed.userId) {
          playerIds.push(parsed.userId);
        }
      } catch {
        tokenDetails.push({ type: "invalid JSON" });
      }
    }

    return NextResponse.json({
      userId: session.user.id,
      totalTokens: tokens.length,
      oneSignalPlayerIds: playerIds,
      tokenDetails: tokenDetails,
      hasOneSignalToken: playerIds.length > 0,
    });
  } catch (error) {
    console.error("[Push Debug] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

