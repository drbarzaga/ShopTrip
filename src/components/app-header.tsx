import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plane } from "lucide-react";
import Link from "next/link";
import { OrganizationSelector } from "@/components/organization-selector";
import { UserMenu } from "@/components/user-menu";
import { getUserOrganizations } from "@/actions/organizations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAppName } from "@/lib/utils";
import { LogoIcon } from "@/components/shared/logo";

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
    <>
      {/* Header móvil - diseño optimizado */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
        <div className="px-3 py-2.5">
          {/* Primera fila: Logo y menú de usuario */}
          <div className="flex items-center justify-between mb-2.5 gap-2">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity min-w-0 flex-shrink"
            >
              <LogoIcon className="shrink-0 h-5 w-5" />
              <h1 className="text-sm font-semibold truncate">
                {getAppName()}
              </h1>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle />
              <UserMenu
                userName={session.user.name}
                userEmail={session.user.email}
                userImage={session.user.image}
              />
            </div>
          </div>
          {/* Segunda fila: Selector de organizaciones */}
          <div className="w-full">
            <OrganizationSelector
              organizations={organizations}
              activeOrganizationId={activeOrganizationId}
            />
          </div>
        </div>
      </header>
      
      {/* Header desktop */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <LogoIcon />
                <h1 className="text-lg font-semibold truncate">
                  {getAppName()}
                </h1>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <OrganizationSelector
                organizations={organizations}
                activeOrganizationId={activeOrganizationId}
              />
              <Link href="/trips">
                <Button variant="ghost" size="sm">
                  <Plane className="mr-2 h-4 w-4" />
                  My Trips
                </Button>
              </Link>
              <ThemeToggle />
              <UserMenu
                userName={session.user.name}
                userEmail={session.user.email}
                userImage={session.user.image}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

