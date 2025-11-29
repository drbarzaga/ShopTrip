import { NextResponse } from "next/server";
import { db } from "@/db";
import { user, notificationPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getPendingReminders, markReminderAsSent } from "@/actions/reminders";
import { createNotification } from "@/lib/notifications";

/**
 * Procesa los recordatorios pendientes y envía notificaciones
 * Este endpoint debe ser llamado periódicamente (ej: cada hora) por un cron job
 * 
 * Compatible con:
 * - cron-job.org (recomendado)
 * - Vercel Cron Jobs
 * - Cualquier servicio de cron que pueda enviar headers HTTP
 */
export async function POST(request: Request) {
  try {
    // Verificar que la solicitud viene de un origen autorizado
    const authHeader = request.headers.get("authorization");
    const vercelSignature = request.headers.get("x-vercel-signature");
    const cronJobToken = request.headers.get("x-cron-job-token"); // Para cron-job.org
    const expectedToken = process.env.CRON_SECRET;

    // Permitir si viene de Vercel Cron (tiene x-vercel-signature)
    const isVercelCron = !!vercelSignature;
    
    // Permitir si tiene el token correcto en Authorization header
    const hasValidAuthToken =
      expectedToken && authHeader === `Bearer ${expectedToken}`;
    
    // Permitir si tiene el token correcto en header personalizado (cron-job.org)
    const hasValidCronJobToken =
      expectedToken && cronJobToken === expectedToken;

    // Si hay CRON_SECRET configurado, requerir autenticación
    if (expectedToken) {
      if (!isVercelCron && !hasValidAuthToken && !hasValidCronJobToken) {
        return NextResponse.json(
          { 
            error: "Unauthorized",
            message: "Missing or invalid CRON_SECRET token"
          }, 
          { status: 401 }
        );
      }
    } else {
      // Si no hay token configurado, solo permitir Vercel Cron
      if (!isVercelCron) {
        return NextResponse.json(
          { 
            error: "CRON_SECRET not configured",
            message: "Please set CRON_SECRET environment variable"
          },
          { status: 401 }
        );
      }
    }

    // Obtener todos los usuarios
    const users = await db.select({ id: user.id }).from(user);
    console.log("[Reminders API] Processing reminders for", users.length, "users");

    let processedCount = 0;
    let sentCount = 0;
    const now = new Date();
    console.log("[Reminders API] Current time:", now);

    for (const userRecord of users) {
      // Verificar si el usuario tiene recordatorios habilitados
      const prefsData = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userRecord.id))
        .limit(1);

      if (prefsData.length === 0 || !prefsData[0].reminderEnabled) {
        console.log(`[Reminders API] User ${userRecord.id}: reminders disabled or no preferences`);
        continue;
      }

      console.log(`[Reminders API] User ${userRecord.id}: reminders enabled, checking pending reminders`);

      // Obtener recordatorios pendientes del usuario
      const pendingReminders = await getPendingReminders(userRecord.id);
      console.log(`[Reminders API] User ${userRecord.id}: found ${pendingReminders.length} pending reminders`);

      for (const reminderRecord of pendingReminders) {
        console.log(`[Reminders API] Processing reminder ${reminderRecord.id} for trip "${reminderRecord.tripName}"`);
        console.log(`[Reminders API] Reminder date: ${reminderRecord.reminderDate}, Current date: ${now}`);
        
        // Enviar notificación
        await createNotification(
          "trip_created", // Usar tipo genérico para recordatorios
          `Recordatorio: ${reminderRecord.tripName}`,
          reminderRecord.message ||
            `Tu viaje "${reminderRecord.tripName}" comienza pronto`,
          [userRecord.id],
          reminderRecord.tripId
        );

        // Marcar como enviado
        await markReminderAsSent(reminderRecord.id);
        console.log(`[Reminders API] Reminder ${reminderRecord.id} marked as sent`);
        sentCount++;
      }

      processedCount += pendingReminders.length;
    }

    console.log("[Reminders API] Processing complete:", { processed: processedCount, sent: sentCount });

    return NextResponse.json({
      success: true,
      processed: processedCount,
      sent: sentCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[Reminders API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
