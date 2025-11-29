import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { db } from "@/db";
import { user, notificationPreferences, reminder, trip } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { markReminderAsSent } from "@/actions/reminders";
import { createNotification } from "@/lib/notifications";

/**
 * Endpoint de prueba para procesar recordatorios manualmente
 * Solo accesible cuando el usuario está autenticado (para desarrollo/testing)
 */
export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    console.log("[Reminders Process Now] Processing reminders for user:", userId);
    console.log("[Reminders Process Now] Current time:", now);

    // Verificar si el usuario tiene recordatorios habilitados
    const prefsData = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (prefsData.length === 0 || !prefsData[0].reminderEnabled) {
      return NextResponse.json({
        success: false,
        message: "Recordatorios no habilitados para este usuario",
        remindersEnabled: prefsData.length > 0 ? prefsData[0].reminderEnabled : false,
      });
    }

    // Obtener todos los recordatorios del usuario (incluso los futuros para diagnóstico)
    const allReminders = await db
      .select({
        id: reminder.id,
        tripId: reminder.tripId,
        reminderDate: reminder.reminderDate,
        message: reminder.message,
        sent: reminder.sent,
        tripName: trip.name,
      })
      .from(reminder)
      .innerJoin(trip, eq(reminder.tripId, trip.id))
      .where(eq(reminder.userId, userId));

    console.log(`[Reminders Process Now] Total reminders for user: ${allReminders.length}`);

    // Obtener solo los pendientes (fecha pasada y no enviados)
    const pendingReminders = allReminders.filter(
      (r) => !r.sent && new Date(r.reminderDate) <= now
    );

    console.log(`[Reminders Process Now] Pending reminders: ${pendingReminders.length}`);

    let sentCount = 0;
    const results = [];

    for (const reminderRecord of pendingReminders) {
      console.log(`[Reminders Process Now] Processing reminder ${reminderRecord.id}`);
      
      try {
        // Enviar notificación
        await createNotification(
          "trip_created",
          `Recordatorio: ${reminderRecord.tripName}`,
          reminderRecord.message ||
            `Tu viaje "${reminderRecord.tripName}" comienza pronto`,
          [userId],
          reminderRecord.tripId
        );

        // Marcar como enviado
        await markReminderAsSent(reminderRecord.id);
        sentCount++;
        
        results.push({
          id: reminderRecord.id,
          tripName: reminderRecord.tripName,
          status: "sent",
        });
      } catch (error) {
        console.error(`[Reminders Process Now] Error processing reminder ${reminderRecord.id}:`, error);
        results.push({
          id: reminderRecord.id,
          tripName: reminderRecord.tripName,
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: pendingReminders.length,
      sent: sentCount,
      results,
      allReminders: allReminders.map((r) => ({
        id: r.id,
        tripName: r.tripName,
        reminderDate: r.reminderDate,
        sent: r.sent,
        isPending: !r.sent && new Date(r.reminderDate) <= now,
        isFuture: new Date(r.reminderDate) > now,
      })),
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[Reminders Process Now] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

