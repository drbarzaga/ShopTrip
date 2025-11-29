import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/db";
import { reminder, trip, notificationPreferences } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Endpoint de prueba para verificar la creación de recordatorios
 * Solo accesible en desarrollo
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    // Obtener preferencias del usuario
    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    // Obtener viajes del usuario con fecha de inicio
    const trips = await db
      .select({
        id: trip.id,
        name: trip.name,
        startDate: trip.startDate,
      })
      .from(trip)
      .where(eq(trip.userId, userId))
      .limit(10);

    // Obtener recordatorios existentes
    const reminders = await db
      .select()
      .from(reminder)
      .where(eq(reminder.userId, userId))
      .limit(10);

    return NextResponse.json({
      userId,
      preferences: prefs.length > 0 ? prefs[0] : null,
      trips: trips.map(t => ({
        id: t.id,
        name: t.name,
        startDate: t.startDate,
      })),
      reminders: reminders.map(r => ({
        id: r.id,
        tripId: r.tripId,
        reminderDate: r.reminderDate,
        message: r.message,
        sent: r.sent,
      })),
      diagnostics: {
        hasPreferences: prefs.length > 0,
        reminderEnabled: prefs.length > 0 ? prefs[0].reminderEnabled : false,
        reminderDaysBefore: prefs.length > 0 ? prefs[0].reminderDaysBefore : null,
        tripsWithStartDate: trips.filter(t => t.startDate !== null).length,
        totalReminders: reminders.length,
        unsentReminders: reminders.filter(r => !r.sent).length,
      },
    });
  } catch (error) {
    console.error("[Reminders Test] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

