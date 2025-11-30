"use server";

import { getAppName } from "../utils";
import { resend, FROM_EMAIL } from "./resend";
import { WelcomeEmail } from "./templates/welcome";
import { render } from "@react-email/render";

interface SendWelcomeEmailParams {
  to: string;
  userName: string;
  verificationUrl: string;
  token?: string;
}

export async function sendWelcomeEmail({
  to,
  userName,
  verificationUrl,
  token,
}: SendWelcomeEmailParams) {
  try {
    // Si Resend no está configurado, solo loguear y retornar éxito
    if (!resend) {
      console.log("Resend no está configurado. Email no enviado:", {
        to,
        userName,
        verificationUrl,
      });
      return { success: true, data: null };
    }

    // Construir la URL absoluta del logo
    // Asegurarse de que la URL sea accesible públicamente
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl) {
      console.warn(
        "NEXT_PUBLIC_APP_URL no está configurado. El logo puede no aparecer en el email."
      );
    }

    const logoUrl = baseUrl ? `${baseUrl}/icon.png` : null;

    // Log para debugging
    console.log("Logo URL:", logoUrl);
    console.log("Base URL:", baseUrl);

    const emailHtml = await render(
      WelcomeEmail({
        userName,
        verificationUrl,
        logoUrl,
        token,
      })
    );

    const { data, error } = await resend.emails.send({
      from: `${getAppName()} <${FROM_EMAIL}>`,
      to: [to],
      subject: `¡Bienvenido a ${getAppName()} ✈️!`,
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error };
  }
}
