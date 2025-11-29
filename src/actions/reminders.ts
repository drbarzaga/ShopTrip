"use server";

import { getSession } from "@/lib/auth-server";
import { db } from "@/db";
import { reminder, trip } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";

/**
 * Crea un recordatorio para un viaje
 */
export async function createReminderAction(
  tripId: string,
  reminderDate: Date,
  message?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getSession();
    if (!session) {
      console.error("[Reminders] No session found");
      return {
        success: false,
        message: "No autorizado",
      };
    }

    // Verificar que el viaje existe y pertenece al usuario
    const tripData = await db
      .select()
      .from(trip)
      .where(eq(trip.id, tripId))
      .limit(1);

    if (tripData.length === 0) {
      return {
        success: false,
        message: "Viaje no encontrado",
      };
    }

    const id = crypto.randomUUID();
    await db.insert(reminder).values({
      id,
      userId: session.user.id,
      tripId,
      reminderDate,
      message: message || null,
      sent: false,
    });
    revalidatePath("/settings");
    return {
      success: true,
      message: "Recordatorio creado correctamente",
      data: { id },
    };
  } catch (error) {
    console.error("[Reminders] Error creating reminder:", error);
    if (error instanceof Error) {
      console.error("[Reminders] Error details:", error.message, error.stack);
    }
    return {
      success: false,
      message: "Error al crear recordatorio",
    };
  }
}

/**
 * Obtiene los recordatorios pendientes de un usuario
 */
export async function getPendingReminders(userId: string): Promise<
  Array<{
    id: string;
    tripId: string;
    tripName: string;
    reminderDate: Date;
    message: string | null;
  }>
> {
  try {
    const reminders = await db
      .select({
        id: reminder.id,
        tripId: reminder.tripId,
        reminderDate: reminder.reminderDate,
        message: reminder.message,
        tripName: trip.name,
      })
      .from(reminder)
      .innerJoin(trip, eq(reminder.tripId, trip.id))
      .where(
        and(
          eq(reminder.userId, userId),
          eq(reminder.sent, false),
          lte(reminder.reminderDate, new Date())
        )
      );

    return reminders;
  } catch (error) {
    console.error("[Reminders] Error getting pending reminders:", error);
    return [];
  }
}

/**
 * Marca un recordatorio como enviado
 */
export async function markReminderAsSent(reminderId: string): Promise<void> {
  try {
    await db
      .update(reminder)
      .set({ sent: true })
      .where(eq(reminder.id, reminderId));
  } catch (error) {
    console.error("[Reminders] Error marking reminder as sent:", error);
  }
}

/**
 * Elimina un recordatorio
 */
export async function deleteReminderAction(
  reminderId: string
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        message: "No autorizado",
      };
    }

    // Verificar que el recordatorio pertenece al usuario
    const reminderData = await db
      .select()
      .from(reminder)
      .where(
        and(eq(reminder.id, reminderId), eq(reminder.userId, session.user.id))
      )
      .limit(1);

    if (reminderData.length === 0) {
      return {
        success: false,
        message: "Recordatorio no encontrado",
      };
    }

    await db.delete(reminder).where(eq(reminder.id, reminderId));

    revalidatePath("/settings");
    return {
      success: true,
      data: undefined as never,
      message: "Recordatorio eliminado correctamente",
    };
  } catch (error) {
    console.error("[Reminders] Error:", error);
    return {
      success: false,
      message: "Error al eliminar recordatorio",
    };
  }
}

/**
 * Obtiene los recordatorios de un usuario
 */
export async function getUserReminders(): Promise<
  Array<{
    id: string;
    tripId: string;
    tripName: string;
    reminderDate: Date;
    message: string | null;
    sent: boolean;
  }>
> {
  try {
    const session = await getSession();
    if (!session) {
      return [];
    }

    const reminders = await db
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
      .where(eq(reminder.userId, session.user.id))
      .orderBy(reminder.reminderDate);

    return reminders;
  } catch (error) {
    console.error("[Reminders] Error getting user reminders:", error);
    return [];
  }
}

/**
 * Sincroniza los recordatorios de un viaje
 * Elimina recordatorios no enviados existentes y crea uno nuevo si es necesario
 */
export async function syncTripReminders(
  tripId: string,
  userId: string,
  startDate: Date | null,
  tripName: string
): Promise<void> {
  try {
    // Eliminar recordatorios no enviados existentes del viaje
    await db
      .delete(reminder)
      .where(
        and(
          eq(reminder.tripId, tripId),
          eq(reminder.userId, userId),
          eq(reminder.sent, false)
        )
      );

    // Si hay fecha de inicio, crear nuevo recordatorio si el usuario tiene recordatorios habilitados
    if (startDate) {
      const { notificationPreferences } = await import("@/db/schema");
      const prefs = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);

      if (prefs.length > 0 && prefs[0].reminderEnabled) {
        const reminderDate = new Date(startDate);
        reminderDate.setDate(reminderDate.getDate() - prefs[0].reminderDaysBefore);

        // Solo crear recordatorio si la fecha es futura
        if (reminderDate > new Date()) {
          const id = crypto.randomUUID();
          await db.insert(reminder).values({
            id,
            userId,
            tripId,
            reminderDate,
            message: `Recordatorio: Tu viaje "${tripName}" comienza en ${prefs[0].reminderDaysBefore} día(s)`,
            sent: false,
          });
        }
      }
    }
  } catch (error) {
    console.error("[Reminders] Error syncing trip reminders:", error);
    // No lanzar error para no interrumpir la actualización del viaje
  }
}
