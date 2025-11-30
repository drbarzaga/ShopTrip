"use server";

import { getAppName } from "../utils";
import { resend, FROM_EMAIL } from "./resend";
import { ResetPasswordEmail } from "./templates/reset-password";
import { render } from "@react-email/render";

interface SendResetPasswordEmailParams {
  to: string;
  resetLink: string;
  userName?: string;
}

export async function sendResetPasswordEmail({
  to,
  resetLink,
  userName,
}: SendResetPasswordEmailParams) {
  try {
    // Si Resend no está configurado, solo loguear y retornar éxito
    if (!resend) {
      console.log("Resend no está configurado. Email no enviado:", {
        to,
        resetLink,
      });
      return { success: true, data: null };
    }

    const emailHtml = await render(
      ResetPasswordEmail({
        resetLink,
        userName,
      })
    );

    const { data, error } = await resend.emails.send({
      from: `${getAppName()} <${FROM_EMAIL}>`,
      to: [to],
      subject: "Restablecer tu contraseña - ShopTrip",
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending reset password email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending reset password email:", error);
    return { success: false, error };
  }
}
