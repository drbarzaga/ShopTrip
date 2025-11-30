import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod, organization } from "better-auth/plugins";
import { schema } from "@/db/schema";
import { sendResetPasswordEmail } from "@/lib/email/send-reset-password";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // Cambiar a false para requerir verificación
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({
        to: user.email,
        resetLink: url,
        userName: user.name || undefined,
      });
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const callbackURL = `${baseUrl}/dashboard?verified=true`;

      // Construir la URL de verificación
      // Si la URL es relativa, convertirla a absoluta
      let verificationUrl: string;
      if (url.startsWith("http://") || url.startsWith("https://")) {
        // URL absoluta
        const urlObj = new URL(url);
        urlObj.searchParams.set("callbackURL", callbackURL);
        verificationUrl = urlObj.toString();
      } else {
        // URL relativa - construir URL absoluta
        const urlObj = new URL(url, baseUrl);
        urlObj.searchParams.set("callbackURL", callbackURL);
        verificationUrl = urlObj.toString();
      }

      await sendWelcomeEmail({
        to: user.email,
        userName: user.name || "Usuario",
        verificationUrl,
        token,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 86400, // 24 hours
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    nextCookies(),
    lastLoginMethod(),
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
});
