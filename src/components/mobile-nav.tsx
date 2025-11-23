"use client";

import { Plus, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg md:hidden safe-area-inset-bottom">
      <div className="grid grid-cols-2 h-16">
        <CreateTripDialog
          trigger={
            <Button
              variant="ghost"
              className="h-full rounded-none flex-col gap-1 hover:bg-primary/10 active:bg-primary/20 touch-manipulation"
              aria-label="Create new trip"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-medium">New Trip</span>
            </Button>
          }
        />
        <Link href="/trips" className="contents">
          <Button
            variant="ghost"
            className={`h-full rounded-none flex-col gap-1 hover:bg-primary/10 active:bg-primary/20 touch-manipulation ${
              pathname?.startsWith("/trips") ? "bg-primary/10" : ""
            }`}
            aria-label="View trips"
          >
            <List className="h-5 w-5" />
            <span className="text-xs font-medium">Trips</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
}
