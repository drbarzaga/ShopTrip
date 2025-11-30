"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Calendar, Plane } from "lucide-react";

interface TripCardProps {
  readonly trip: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly destination: string | null;
    readonly startDate: Date | null;
    readonly endDate: Date | null;
  };
}

function formatDate(date: Date | null): string {
  if (!date) return "No establecida";
  // Usar los componentes de fecha directamente para evitar problemas de zona horaria
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();
  // Crear una nueva fecha con los componentes locales para formatear
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month, day));
}

function getDaysUntilTrip(startDate: Date | null): number | null {
  if (!startDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tripDate = new Date(startDate);
  tripDate.setHours(0, 0, 0, 0);
  
  const diffTime = tripDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

function formatDaysRemaining(days: number): string {
  if (days < 0) {
    return `Hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}`;
  }
  if (days === 0) {
    return "Hoy";
  }
  if (days === 1) {
    return "Mañana";
  }
  return `${days} días restantes`;
}

export function TripCard({ trip }: TripCardProps) {
  const daysRemaining = getDaysUntilTrip(trip.startDate);
  
  return (
    <Card className="group relative cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 active:shadow-md active:-translate-y-0.5 active:scale-[0.98]">
      <CardContent className="relative p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icono */}
          <div className="shrink-0">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-muted transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110 group-hover:rotate-3 group-active:bg-primary/10 group-active:scale-110 group-active:rotate-3">
              <Plane className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-all duration-300 group-hover:text-primary group-hover:-rotate-6 group-active:text-primary group-active:-rotate-6" />
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold leading-tight mb-2">
                  {trip.name}
                </h3>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary group-active:translate-x-1 group-active:text-primary" />
            </div>

            {/* Información secundaria */}
            <div className="flex flex-col gap-2">
              {trip.destination && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{trip.destination}</span>
                </div>
              )}
              {(trip.startDate || trip.endDate) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {trip.startDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{formatDate(trip.startDate)}</span>
                    </div>
                  )}
                  {trip.endDate && trip.startDate && (
                    <span className="hidden sm:inline">→</span>
                  )}
                  {trip.endDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{formatDate(trip.endDate)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Días restantes - Parte inferior derecha */}
        {daysRemaining !== null && (
          <div className="absolute bottom-4 right-4 z-20">
            <Badge
              variant="outline"
              className={`text-xs font-medium ${
                daysRemaining < 0
                  ? "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                  : daysRemaining === 0
                    ? "border-orange-300/50 bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                    : daysRemaining <= 7
                      ? "border-blue-300/50 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "border-primary/30 bg-primary/10 text-primary"
              }`}
            >
              {formatDaysRemaining(daysRemaining)}
            </Badge>
          </div>
        )}

        {/* Link para navegación */}
        <Link
          href={`/trips/${trip.slug}`}
          className="absolute inset-0 z-10"
          aria-label={`Ver detalles de ${trip.name}`}
        />
      </CardContent>
    </Card>
  );
}
