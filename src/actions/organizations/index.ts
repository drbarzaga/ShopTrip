"use server";

import { db } from "@/db";
import { organization, member, invitation } from "@/db/schema";
import {
  createOrganizationSchema,
  inviteMemberSchema,
} from "@/schemas/organization";
import { withValidation, success, failure } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/actions";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq, and, or, gt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateSlug, generateUniqueSlug } from "@/lib/utils";

// -------------------------------- Organization Actions --------------------------------

export const createOrganizationAction = async (
  prevState: ActionResult<{ id: string; slug: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string; slug: string }>> => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return withValidation(formData, createOrganizationSchema, async (data) => {
    try {
      const baseSlug = generateSlug(data.name);

      // Generar slug único
      const uniqueSlug = await generateUniqueSlug(baseSlug, async (slug) => {
        const existing = await db
          .select({ id: organization.id })
          .from(organization)
          .where(eq(organization.slug, slug))
          .limit(1);
        return existing.length > 0;
      });

      // Crear organización directamente en la base de datos
      // Usamos el método directo ya que Better Auth puede tener problemas con la API
      const orgId = crypto.randomUUID();
      const now = new Date();

      await db.insert(organization).values({
        id: orgId,
        name: data.name,
        slug: uniqueSlug,
        createdAt: now,
      });

      // Crear el miembro como owner
      const memberId = crypto.randomUUID();
      await db.insert(member).values({
        id: memberId,
        organizationId: orgId,
        userId: session.user.id,
        role: "owner",
        createdAt: now,
      });

      // Intentar sincronizar con Better Auth después de crear en la BD
      // Esto es opcional y no bloquea la creación si falla
      try {
        const headersList = await headers();
        await auth.api.setActiveOrganization({
          headers: headersList,
          body: {
            organizationId: orgId,
          },
        });
      } catch (syncError) {
        // Ignorar errores de sincronización, la organización ya está creada
        console.log(
          "Could not sync organization with Better Auth session, but organization was created successfully"
        );
      }

      return await success(
        { id: orgId, slug: uniqueSlug },
        "¡Organización creada exitosamente!"
      );
    } catch (error) {
      console.error("Error creating organization:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear la organización";
      return await failure(errorMessage, undefined, data);
    }
  });
};

export async function getUserOrganizations(userId: string) {
  try {
    const orgs = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        createdAt: organization.createdAt,
        role: member.role,
      })
      .from(organization)
      .innerJoin(member, eq(member.organizationId, organization.id))
      .where(eq(member.userId, userId));

    return orgs;
  } catch (error) {
    console.error("Error getting user organizations:", error);
    return [];
  }
}

export async function setActiveOrganization(organizationId: string) {
  "use server";
  try {
    const session = await getSession();
    if (!session) {
      redirect("/login");
    }

    const headersList = await headers();

    // Verificar que el usuario es miembro de la organización
    const membership = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          eq(member.userId, session.user.id)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return await failure("You are not a member of this organization");
    }

    // Cambiar organización activa usando Better Auth API
    await auth.api.setActiveOrganization({
      headers: headersList,
      body: {
        organizationId,
      },
    });

    return await success(undefined, "Organización activa cambiada exitosamente");
  } catch (error) {
    const message =
      (error as Error).message ||
      "Ocurrió un error al cambiar la organización activa";
    return await failure(message);
  }
}

export const inviteMemberAction = async (
  prevState: ActionResult<void> | null,
  formData: FormData
): Promise<ActionResult<void>> => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return withValidation(formData, inviteMemberSchema, async (data) => {
    try {
      // Verificar que el usuario tiene permisos para invitar (es owner o admin)
      const membership = await db
        .select()
        .from(member)
        .where(
          and(
            eq(member.organizationId, data.organizationId),
            eq(member.userId, session.user.id)
          )
        )
        .limit(1);

      if (membership.length === 0) {
        return await failure("No eres miembro de esta organización");
      }

      const userRole = membership[0].role;
      if (userRole !== "owner" && userRole !== "admin") {
        return await failure("Solo los propietarios y administradores pueden invitar miembros");
      }

      // Crear invitación directamente en la base de datos
      // Better Auth no expone inviteMember en su API, así que usamos el método directo
      const invitationId = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Invitación expira en 7 días

      // Normalizar el email antes de guardarlo
      const normalizedEmail = data.email.toLowerCase().trim();

      await db.insert(invitation).values({
        id: invitationId,
        organizationId: data.organizationId,
        email: normalizedEmail,
        role: data.role || "member",
        status: "pending",
        expiresAt: expiresAt,
        inviterId: session.user.id,
      });

      // Obtener información de la organización y el usuario que invita
      const orgData = await db
        .select({ name: organization.name })
        .from(organization)
        .where(eq(organization.id, data.organizationId))
        .limit(1);

      const inviterName = session.user.name || "Un usuario";

      // Enviar email de invitación (no bloqueamos si falla)
      try {
        const { sendInvitationEmail } = await import("@/lib/email/send-invitation");
        await sendInvitationEmail({
          to: data.email,
          organizationName: orgData[0]?.name || "una organización",
          inviterName,
          invitationId,
          role: data.role || "miembro",
        });
      } catch (emailError) {
        console.error("Error sending invitation email:", emailError);
        // No fallamos la acción si el email falla, solo lo registramos
      }

      return await success(undefined, "¡Invitación enviada exitosamente!");
    } catch (error) {
      console.error("Error sending invitation:", error);
      const message =
        (error as Error).message ||
        "Ocurrió un error al enviar la invitación";
      return await failure(message, undefined, data);
    }
  });
};

export async function getActiveOrganization(userId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    const headersList = await headers();
    const sessionData = await auth.api.getSession({
      headers: headersList,
    });

    const activeOrgId = sessionData?.session?.activeOrganizationId;
    if (!activeOrgId) {
      return null;
    }

    const org = await db
      .select()
      .from(organization)
      .where(eq(organization.id, activeOrgId))
      .limit(1);

    return org[0] || null;
  } catch (error) {
    console.error("Error getting active organization:", error);
    return null;
  }
}

export async function getOrganizationInvitations(organizationId: string) {
  try {
    const now = new Date();
    const invitations = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.organizationId, organizationId),
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, now)
        )
      )
      .orderBy(invitation.createdAt);

    return invitations;
  } catch (error) {
    console.error("Error getting organization invitations:", error);
    return [];
  }
}

export async function getUserInvitations(userEmail: string) {
  try {
    if (!userEmail || userEmail.trim() === "") {
      console.warn("getUserInvitations: userEmail is empty");
      return [];
    }

    const now = new Date();
    const invitations = await db
      .select({
        id: invitation.id,
        organizationId: invitation.organizationId,
        organizationName: organization.name,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        inviterId: invitation.inviterId,
      })
      .from(invitation)
      .innerJoin(organization, eq(organization.id, invitation.organizationId))
      .where(
        and(
          eq(invitation.email, userEmail.toLowerCase().trim()),
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, now)
        )
      )
      .orderBy(invitation.createdAt);

    console.log(`Found ${invitations.length} invitations for email: ${userEmail}`);
    return invitations;
  } catch (error) {
    console.error("Error getting user invitations:", error);
    return [];
  }
}

export async function acceptInvitationAction(invitationId: string) {
  "use server";
  try {
    const session = await getSession();
    if (!session) {
      redirect("/login");
    }

    // Normalizar el email del usuario
    const userEmail = (session.user.email || "").toLowerCase().trim();
    if (!userEmail) {
      return await failure("No se pudo obtener el email del usuario");
    }

    // Obtener la invitación
    const invitations = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.id, invitationId),
          eq(invitation.email, userEmail),
          eq(invitation.status, "pending")
        )
      )
      .limit(1);

    if (invitations.length === 0) {
      return await failure("Invitation not found or already processed");
    }

    const inv = invitations[0];

    // Verificar que no haya expirado
    if (new Date(inv.expiresAt) < new Date()) {
      return await failure("Invitation has expired");
    }

    // Verificar que el usuario no sea ya miembro
    const existingMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, inv.organizationId),
          eq(member.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      // Actualizar la invitación como aceptada aunque ya sea miembro
      await db
        .update(invitation)
        .set({ status: "accepted" })
        .where(eq(invitation.id, invitationId));
      return await failure("You are already a member of this organization");
    }

    // Crear el miembro
    const memberId = crypto.randomUUID();
    await db.insert(member).values({
      id: memberId,
      organizationId: inv.organizationId,
      userId: session.user.id,
      role: inv.role || "member",
      createdAt: new Date(),
    });

    // Actualizar la invitación como aceptada
    await db
      .update(invitation)
      .set({ status: "accepted" })
      .where(eq(invitation.id, invitationId));

    return await success(undefined, "¡Invitación aceptada exitosamente!");
  } catch (error) {
    console.error("Error accepting invitation:", error);
    const message =
      (error as Error).message ||
      "Ocurrió un error al aceptar la invitación";
    return await failure(message);
  }
}

export async function rejectInvitationAction(invitationId: string) {
  "use server";
  try {
    const session = await getSession();
    if (!session) {
      redirect("/login");
    }

    // Normalizar el email del usuario
    const userEmail = (session.user.email || "").toLowerCase().trim();
    if (!userEmail) {
      return await failure("No se pudo obtener el email del usuario");
    }

    // Actualizar la invitación como rechazada
    await db
      .update(invitation)
      .set({ status: "rejected" })
      .where(
        and(
          eq(invitation.id, invitationId),
          eq(invitation.email, userEmail)
        )
      );

    return await success(undefined, "Invitación rechazada");
  } catch (error) {
    console.error("Error rejecting invitation:", error);
    const message =
      (error as Error).message ||
      "Ocurrió un error al rechazar la invitación";
    return await failure(message);
  }
}

export async function deleteOrganizationAction(organizationId: string) {
  "use server";
  try {
    const session = await getSession();
    if (!session) {
      redirect("/login");
    }

    // Verificar que el usuario es owner de la organización
    const membership = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, organizationId),
          eq(member.userId, session.user.id)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return await failure("You are not a member of this organization");
    }

    if (membership[0].role !== "owner") {
      return await failure("Only the owner can delete the organization");
    }

    // Eliminar la organización (cascade eliminará miembros, invitaciones y viajes)
    await db.delete(organization).where(eq(organization.id, organizationId));

    return await success(undefined, "Organización eliminada exitosamente");
  } catch (error) {
    console.error("Error deleting organization:", error);
    const message =
      (error as Error).message ||
      "Ocurrió un error al eliminar la organización";
    return await failure(message);
  }
}
