import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "El nombre de la organización es requerido").max(100, "El nombre de la organización es demasiado largo"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Dirección de correo inválida"),
  organizationId: z.string().min(1, "El ID de la organización es requerido"),
  role: z.enum(["owner", "admin", "member"]).default("member"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;


