import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import Link from "next/link";
import { OrganizationSelector } from "@/components/organization-selector";
import { UserMenu } from "@/components/user-menu";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { getUserOrganizations } from "@/actions/organizations";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAppName } from "@/lib/utils";
import { LogoIcon } from "@/components/shared/logo";
import { HeaderDesktop } from "@/components/header-desktop";

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
      {/* Header móvil */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div className="px-4 py-3">
          {/* Primera fila: Logo y menú de usuario */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0 flex-1"
            >
              <LogoIcon className="h-9 w-9" />
              <h1 className="text-base font-semibold truncate">
                {getAppName()}
              </h1>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <NotificationsDropdown />
              <ThemeSelector />
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
      <HeaderDesktop
        organizations={organizations}
        activeOrganizationId={activeOrganizationId}
        userName={session.user.name}
        userEmail={session.user.email ?? null}
        userImage={session.user.image ?? null}
      />
    </>
  );
}
