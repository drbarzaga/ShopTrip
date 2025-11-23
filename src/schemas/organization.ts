import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100, "Organization name is too long"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  organizationId: z.string().min(1, "Organization ID is required"),
  role: z.enum(["owner", "admin", "member"]).default("member"),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;


