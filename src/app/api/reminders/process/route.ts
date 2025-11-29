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
 * NOTA: Temporalmente desactivado - Vercel en su plan gratuito solo permite 1 cron job por día,
 * lo cual no es suficiente para procesar recordatorios de manera efectiva.
 * TODO: Reactivar cuando se migre a un plan que permita múltiples cron jobs o se use un servicio externo
 */
export async function POST(request: Request) {
  try {
    // Verificar que la solicitud viene de un origen autorizado
    // Vercel Cron Jobs puede enviar el header 'x-vercel-signature' o podemos usar Authorization
    const authHeader = request.headers.get("authorization");
    const vercelSignature = request.headers.get("x-vercel-signature");
    const expectedToken = process.env.CRON_SECRET;

    // Permitir si viene de Vercel Cron (tiene x-vercel-signature) o si tiene el token correcto
    // Si no hay CRON_SECRET configurado, permitir solo desde Vercel Cron
    const isVercelCron = !!vercelSignature;
    const hasValidToken =
      expectedToken && authHeader === `Bearer ${expectedToken}`;

    if (expectedToken && !isVercelCron && !hasValidToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Si no hay token configurado y no es Vercel Cron, rechazar
    if (!expectedToken && !isVercelCron) {
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 401 }
      );
    }

    // Obtener todos los usuarios
    const users = await db.select({ id: user.id }).from(user);

    let processedCount = 0;
    let sentCount = 0;

    for (const userRecord of users) {
      // Verificar si el usuario tiene recordatorios habilitados
      const prefsData = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userRecord.id))
        .limit(1);

      if (prefsData.length === 0 || !prefsData[0].reminderEnabled) {
        continue;
      }

      // Obtener recordatorios pendientes del usuario
      const pendingReminders = await getPendingReminders(userRecord.id);

      for (const reminderRecord of pendingReminders) {
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
        sentCount++;
      }

      processedCount += pendingReminders.length;
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      sent: sentCount,
    });
  } catch (error) {
    console.error("[Reminders API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
