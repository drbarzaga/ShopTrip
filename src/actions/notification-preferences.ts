"use server";

import { getSession } from "@/lib/auth-server";
import { db } from "@/db";
import { notificationPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types/actions";

interface NotificationPreferencesData {
  tripCreated: boolean;
  tripUpdated: boolean;
  tripDeleted: boolean;
  itemCreated: boolean;
  itemUpdated: boolean;
  itemDeleted: boolean;
  itemPurchased: boolean;
  invitationReceived: boolean;
  invitationAccepted: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
}

export async function getNotificationPreferences(): Promise<NotificationPreferencesData> {
  try {
    const session = await getSession();
    if (!session) {
      // Retornar valores por defecto si no hay sesión
      return {
        tripCreated: true,
        tripUpdated: true,
        tripDeleted: true,
        itemCreated: true,
        itemUpdated: true,
        itemDeleted: true,
        itemPurchased: true,
        invitationReceived: true,
        invitationAccepted: true,
        reminderEnabled: false,
        reminderDaysBefore: 1,
      };
    }

    try {
      const prefs = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, session.user.id))
        .limit(1);

      if (prefs.length === 0) {
        // Crear preferencias por defecto
        const defaultPrefs: NotificationPreferencesData = {
          tripCreated: true,
          tripUpdated: true,
          tripDeleted: true,
          itemCreated: true,
          itemUpdated: true,
          itemDeleted: true,
          itemPurchased: true,
          invitationReceived: true,
          invitationAccepted: true,
          reminderEnabled: false,
          reminderDaysBefore: 1,
        };

        try {
          const id = crypto.randomUUID();
          await db.insert(notificationPreferences).values({
            id,
            userId: session.user.id,
            ...defaultPrefs,
          });
        } catch (insertError) {
          // Si falla la inserción (tabla no existe), retornar valores por defecto
          console.warn(
            "[Notification Preferences] Could not create default preferences, table may not exist:",
            insertError
          );
          return defaultPrefs;
        }

        return defaultPrefs;
      }

      const pref = prefs[0];
      return {
        tripCreated: pref.tripCreated,
        tripUpdated: pref.tripUpdated,
        tripDeleted: pref.tripDeleted,
        itemCreated: pref.itemCreated,
        itemUpdated: pref.itemUpdated,
        itemDeleted: pref.itemDeleted,
        itemPurchased: pref.itemPurchased,
        invitationReceived: pref.invitationReceived,
        invitationAccepted: pref.invitationAccepted,
        reminderEnabled: pref.reminderEnabled,
        reminderDaysBefore: pref.reminderDaysBefore,
      };
    } catch (dbError: unknown) {
      // Si la tabla no existe, retornar valores por defecto
      const error = dbError as { code?: string; message?: string };
      if (
        error?.code === "42P01" ||
        error?.message?.includes("does not exist")
      ) {
        console.warn(
          "[Notification Preferences] Table does not exist, returning defaults"
        );
        return {
          tripCreated: true,
          tripUpdated: true,
          tripDeleted: true,
          itemCreated: true,
          itemUpdated: true,
          itemDeleted: true,
          itemPurchased: true,
          invitationReceived: true,
          invitationAccepted: true,
          reminderEnabled: false,
          reminderDaysBefore: 1,
        };
      }
      throw dbError;
    }
  } catch (error) {
    console.error("[Notification Preferences] Error:", error);
    // Retornar valores por defecto en caso de error
    return {
      tripCreated: true,
      tripUpdated: true,
      tripDeleted: true,
      itemCreated: true,
      itemUpdated: true,
      itemDeleted: true,
      itemPurchased: true,
      invitationReceived: true,
      invitationAccepted: true,
      reminderEnabled: false,
      reminderDaysBefore: 1,
    };
  }
}

export async function updateNotificationPreferencesAction(
  data: NotificationPreferencesData
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        message: "No autorizado",
      };
    }

    // Validar días antes (1-7)
    if (data.reminderDaysBefore < 1 || data.reminderDaysBefore > 7) {
      return {
        success: false,
        message: "Los días antes del viaje deben estar entre 1 y 7",
      };
    }

    const existing = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, session.user.id))
      .limit(1);

    if (existing.length === 0) {
      // Crear nuevas preferencias
      const id = crypto.randomUUID();
      await db.insert(notificationPreferences).values({
        id,
        userId: session.user.id,
        ...data,
      });
    } else {
      // Actualizar preferencias existentes
      await db
        .update(notificationPreferences)
        .set(data)
        .where(eq(notificationPreferences.userId, session.user.id));
    }

    revalidatePath("/settings");
    return {
      success: true,
      data: undefined as never,
      message: "Preferencias actualizadas correctamente",
    };
  } catch (error) {
    console.error("[Notification Preferences] Error:", error);
    return {
      success: false,
      message: "Error al actualizar preferencias",
    };
  }
}
