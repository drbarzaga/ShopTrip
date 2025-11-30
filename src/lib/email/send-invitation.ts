"use server";

import { getAppName } from "../utils";
import { resend, FROM_EMAIL } from "./resend";
import { InvitationEmail } from "@/components/email/templates/invitation";
import { render } from "@react-email/render";

interface SendInvitationEmailParams {
  to: string;
  organizationName: string;
  inviterName: string;
  invitationId: string;
  role?: string;
}

export async function sendInvitationEmail({
  to,
  organizationName,
  inviterName,
  invitationId,
  role = "miembro",
}: SendInvitationEmailParams) {
  try {
    // Si Resend no está configurado, solo loguear y retornar éxito
    if (!resend) {
      console.log("Resend no está configurado. Email no enviado:", {
        to,
        organizationName,
        inviterName,
      });
      return { success: true, data: null };
    }

    // El link lleva a la página de invitaciones donde el usuario puede aceptar
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL as string}/invitations/${invitationId}`;

    const emailHtml = await render(
      InvitationEmail({
        organizationName,
        inviterName,
        invitationLink,
        role,
      })
    );

    const { data, error } = await resend.emails.send({
      from: `${getAppName()} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Invitación para unirte a ${organizationName} en ShopTrip`,
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending invitation email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return { success: false, error };
  }
}
