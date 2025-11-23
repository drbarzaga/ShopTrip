import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getSession() {
  try {
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user) {
      return null;
    }

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function getActiveOrganizationId(): Promise<string | null> {
  try {
    const headersList = await headers();
    const sessionData = await auth.api.getSession({
      headers: headersList,
    });
    return sessionData?.session?.activeOrganizationId || null;
  } catch (error) {
    console.error("Error getting active organization:", error);
    return null;
  }
}

export async function signOut() {
  "use server";
  try {
    const headersList = await headers();
    await auth.api.signOut({
      headers: headersList,
    });
  } catch (error) {
    console.error("Error signing out:", error);
  }
}


