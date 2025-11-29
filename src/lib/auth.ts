import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod, organization } from "better-auth/plugins";
import { schema } from "@/db/schema";
import { sendResetPasswordEmail } from "@/lib/email/send-reset-password";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendResetPasswordEmail({
        to: user.email,
        resetLink: url,
        userName: user.name || undefined,
      });
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
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
