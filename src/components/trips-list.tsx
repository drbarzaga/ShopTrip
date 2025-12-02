"use client";

import { useState, useEffect } from "react";
import { TripCard } from "@/components/trip-card";
import { ViewSelector, type ViewMode } from "@/components/view-selector";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Plane } from "lucide-react";
import { CreateTripDialog } from "@/components/create-trip-dialog";
import { DashboardTripDialog } from "@/components/dashboard-trip-dialog";
import { cn } from "@/lib/utils";

interface Trip {
  id: string;
  name: string;
  slug: string;
  destination: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

interface TripsListProps {
  trips: Trip[];
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  };
  showViewSelector?: boolean;
  storageKey?: string;
  className?: string;
}

const DEFAULT_VIEW: ViewMode = "list";
const STORAGE_KEY_PREFIX = "trips-view-mode";

export function TripsList({
  trips,
  emptyState,
  showViewSelector = true,
  storageKey = "default",
  className,
}: TripsListProps) {
  const [view, setView] = useState<ViewMode>(DEFAULT_VIEW);

  // Cargar preferencia de vista desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}-${storageKey}`);
    if (stored && (stored === "list" || stored === "grid" || stored === "compact" || stored === "cards")) {
      setView(stored as ViewMode);
    }
  }, [storageKey]);

  // Guardar preferencia de vista en localStorage
  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}-${storageKey}`, newView);
  };

  // Estado vacío
  if (trips.length === 0) {
    if (emptyState) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
            {emptyState.icon || <MapPin className="h-12 w-12 text-muted-foreground mb-4" />}
            <h3 className="text-lg font-semibold mb-2">{emptyState.title}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {emptyState.description}
            </p>
            {emptyState.action}
          </CardContent>
        </Card>
      );
    }
    return null;
  }

  // Determinar el layout según la vista
  const getContainerClasses = () => {
    switch (view) {
      case "grid":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
      case "compact":
        return "space-y-2";
      case "cards":
        return "space-y-4";
      default:
        return "space-y-4";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selector de vista */}
      {showViewSelector && trips.length > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">Vista:</span>
            <ViewSelector view={view} onViewChange={handleViewChange} />
          </div>
        </div>
      )}

      {/* Lista de viajes */}
      <div className={getContainerClasses()}>
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} view={view} />
        ))}
      </div>
    </div>
  );
}

