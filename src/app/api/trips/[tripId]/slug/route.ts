import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/db";
import { trip } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/trips/[tripId]/slug - Obtiene el slug de un viaje por su ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tripId } = await params;

    const tripData = await db
      .select({ slug: trip.slug })
      .from(trip)
      .where(eq(trip.id, tripId))
      .limit(1);

    if (tripData.length === 0) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({ slug: tripData[0].slug });
  } catch (error) {
    console.error("[Trip Slug API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

