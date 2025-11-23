"use server";

import { db } from "@/db";
import { organization, member } from "@/db/schema";
import { createOrganizationSchema, inviteMemberSchema } from "@/schemas/organization";
import { withValidation, success, failure } from "@/lib/actions/helpers";
import type { ActionResult } from "@/types/actions";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
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
        console.log("Could not sync organization with Better Auth session, but organization was created successfully");
      }

      return await success(
        { id: orgId, slug: uniqueSlug },
        "Organization created successfully!"
      );
    } catch (error) {
      console.error("Error creating organization:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred while creating the organization";
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

    return await success(undefined, "Active organization changed successfully");
  } catch (error) {
    const message =
      (error as Error).message || "An error occurred while changing active organization";
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
      const headersList = await headers();

      // Invitar miembro usando Better Auth API
      await auth.api.inviteMember({
        headers: headersList,
        body: {
          organizationId: data.organizationId,
          email: data.email,
          role: data.role,
        },
      });

      return await success(undefined, "Invitation sent successfully!");
    } catch (error) {
      const message =
        (error as Error).message || "An error occurred while sending the invitation";
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

