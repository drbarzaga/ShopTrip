import { redirect } from "next/navigation";
import { getSession, signOut } from "@/lib/auth-server";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Plane, Building2 } from "lucide-react";
import Link from "next/link";
import { OrganizationSelector } from "@/components/organization-selector";
import { getUserOrganizations, getActiveOrganization } from "@/actions/organizations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

async function handleSignOut() {
  "use server";
  await signOut();
  redirect("/login");
}

export async function AppHeader() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Obtener organizaciones del usuario y organización activa
  const organizations = await getUserOrganizations(session.user.id);
  
  // Obtener organización activa de la sesión
  let activeOrganizationId: string | null = null;
  try {
    const headersList = await headers();
    const sessionData = await auth.api.getSession({
      headers: headersList,
    });
    activeOrganizationId = sessionData?.session?.activeOrganizationId || null;
  } catch (error) {
    console.error("Error getting active organization:", error);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-background">
              {session.user.image && (
                <AvatarImage
                  src={session.user.image}
                  alt={session.user.name || ""}
                />
              )}
              <AvatarFallback className="text-sm font-semibold">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold truncate">
                {session.user.name || session.user.email}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <OrganizationSelector
              organizations={organizations}
              activeOrganizationId={activeOrganizationId}
            />
            <Link href="/trips">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Plane className="mr-2 h-4 w-4" />
                My Trips
              </Button>
            </Link>
            <ThemeToggle />
            <form action={handleSignOut}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

