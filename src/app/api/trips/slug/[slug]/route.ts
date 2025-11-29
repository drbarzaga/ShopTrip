import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { getTripBySlug } from "@/actions/trips";

/**
 * GET /api/trips/slug/[slug] - Obtiene el tripId de un viaje por su slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const tripData = await getTripBySlug(slug, session.user.id);

    if (!tripData) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ tripId: tripData.id });
  } catch (error) {
    console.error("[Trip ID API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

