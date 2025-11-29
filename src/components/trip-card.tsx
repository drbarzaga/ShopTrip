"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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

export function TripCard({ trip }: TripCardProps) {
  return (
    <Card className="group transition-all duration-300 hover:shadow-md hover:-translate-y-1 active:shadow-md active:-translate-y-0.5 active:scale-[0.98]">
      <CardContent className="p-4 sm:p-6">
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

        {/* Link para navegación */}
        <Link
          href={`/trips/${trip.slug}`}
          className="absolute inset-0 z-0"
          aria-label={`Ver detalles de ${trip.name}`}
        />
      </CardContent>
    </Card>
  );
}
