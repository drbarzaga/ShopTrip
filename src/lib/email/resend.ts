import { Resend } from "resend";

// Solo inicializar Resend si la API key está disponible
// Esto permite que la app funcione sin email en desarrollo
let resendInstance: Resend | null = null;

if (process.env.RESEND_API_KEY) {
  resendInstance = new Resend(process.env.RESEND_API_KEY);
}

export const resend = resendInstance;

// Usar el dominio verificado shoptrip.app
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "noreply@shoptrip.app";
