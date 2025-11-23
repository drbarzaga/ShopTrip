"use server";

import { db } from "@/db";
import { user, trip, member, organization } from "@/db/schema";
import { success, failure } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/actions";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Elimina la cuenta del usuario y todos sus datos asociados
 */
export async function deleteAccountAction(): Promise<ActionResult<void>> {
  try {
    const session = await getSession();
    if (!session) {
      redirect("/login");
    }

    const userId = session.user.id;

    // 1. Eliminar todas las organizaciones donde el usuario es owner
    // Esto eliminará automáticamente (cascade): miembros, invitaciones y viajes de esas organizaciones
    const ownedOrganizations = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(
        and(
          eq(member.userId, userId),
          eq(member.role, "owner")
        )
      );

    for (const org of ownedOrganizations) {
      if (org.organizationId) {
        await db
          .delete(organization)
          .where(eq(organization.id, org.organizationId));
      }
    }

    // 2. Las membresías se eliminarán automáticamente cuando se elimine el usuario (onDelete: "cascade")

    // 3. Cerrar todas las sesiones antes de eliminar el usuario
    const headersList = await headers();
    try {
      await auth.api.signOut({
        headers: headersList,
      });
    } catch (error) {
      // Continuar aunque falle el signOut
      console.error("Error signing out:", error);
    }

    // 4. Eliminar el usuario
    // Esto eliminará automáticamente (cascade):
    // - sessions
    // - accounts  
    // - trips (viajes personales y viajes de organizaciones donde era owner)
    // - invitations (invitaciones enviadas por el usuario)
    // Los tripItems mantendrán addedBy y purchasedBy como null (onDelete: "set null")
    await db
      .delete(user)
      .where(eq(user.id, userId));

    return await success(undefined, "Cuenta eliminada exitosamente");
  } catch (error) {
    console.error("Error deleting account:", error);
    const message =
      (error as Error).message || "Ocurrió un error al eliminar la cuenta";
    return await failure(message);
  }
}

