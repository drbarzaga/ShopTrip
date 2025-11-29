"use client";

import { Plus, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { CreateTripItemDialog } from "@/components/create-trip-item-dialog";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MobileNav() {
  const pathname = usePathname();
  const params = useParams();
  const [tripId, setTripId] = useState<string | null>(null);
  const [isLoadingTripId, setIsLoadingTripId] = useState(false);

  // Detectar si estamos en una página de productos de un viaje
  const isTripDetailPage = pathname?.startsWith("/trips/") && pathname !== "/trips" && params?.slug;

  // Obtener el tripId desde el slug
  useEffect(() => {
    if (isTripDetailPage && params?.slug && typeof params.slug === "string") {
      setIsLoadingTripId(true);
      // Obtener el tripId desde el slug usando la API
      fetch(`/api/trips/slug/${encodeURIComponent(params.slug)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch trip ID");
          }
          return res.json();
        })
        .then((data) => {
          if (data.tripId) {
            setTripId(data.tripId);
          }
        })
        .catch((error) => {
          console.error("Error fetching trip ID:", error);
          setTripId(null);
        })
        .finally(() => {
          setIsLoadingTripId(false);
        });
    } else {
      setTripId(null);
    }
  }, [isTripDetailPage, params?.slug]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden safe-area-inset-bottom">
      <div className="grid grid-cols-2 h-16">
        {isTripDetailPage && tripId ? (
          <CreateTripItemDialog
            tripId={tripId}
            trigger={
              <Button
                variant="ghost"
                className="h-full rounded-none flex-col gap-1 hover:bg-accent touch-manipulation"
                aria-label="Agregar nuevo artículo"
                disabled={isLoadingTripId}
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs font-medium">Agregar Artículo</span>
              </Button>
            }
          />
        ) : (
          <CreateTripDialog
            trigger={
              <Button
                variant="ghost"
                className="h-full rounded-none flex-col gap-1 hover:bg-accent touch-manipulation"
                aria-label="Crear nuevo viaje"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs font-medium">Nuevo Viaje</span>
              </Button>
            }
          />
        )}
        <Link href="/trips" className="contents">
          <Button
            variant="ghost"
            className={`h-full rounded-none flex-col gap-1 hover:bg-accent touch-manipulation ${
              pathname?.startsWith("/trips") ? "bg-accent text-accent-foreground" : ""
            }`}
            aria-label="Ver viajes"
          >
            <List className="h-5 w-5" />
            <span className="text-xs font-medium">Viajes</span>
          </Button>
        </Link>
      </div>
    </nav>
  );
}
