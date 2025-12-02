"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import { Plane } from "lucide-react";
import Link from "next/link";
import { OrganizationSelector } from "@/components/organization-selector";
import { UserMenu } from "@/components/user-menu";
import { NotificationsDropdown } from "@/components/notifications-dropdown";
import { getAppName } from "@/lib/utils";
import { LogoIcon } from "@/components/shared/logo";
import { HeaderStickySearch } from "@/components/header-sticky-search";

interface HeaderDesktopProps {
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    role: string | null;
  }>;
  activeOrganizationId: string | null;
  userName: string;
  userEmail: string | null;
  userImage: string | null;
}

export function HeaderDesktop({
  organizations,
  activeOrganizationId,
  userName,
  userEmail,
  userImage,
}: HeaderDesktopProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 hidden md:block">
      <div className="container mx-auto px-6 py-3.5 max-w-7xl relative">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center gap-3 flex-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all duration-200 group"
            >
              <div className="transition-transform duration-200 group-hover:scale-105">
                <LogoIcon className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
              <h1 className="text-lg font-semibold truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {getAppName()}
              </h1>
            </Link>
          </div>

          {/* Buscador sticky en el centro */}
          <HeaderStickySearch />

          <div className="flex items-center gap-2 flex-1 justify-end">
            <OrganizationSelector
              organizations={organizations}
              activeOrganizationId={activeOrganizationId}
            />
            <Link href="/trips">
              <Button variant="ghost" size="sm" className="gap-2">
                <Plane className="h-4 w-4" />
                <span>Mis Viajes</span>
              </Button>
            </Link>
            <NotificationsDropdown />
            <ThemeSelector />
            <ThemeToggle />
            <UserMenu
              userName={userName}
              userEmail={userEmail}
              userImage={userImage}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
