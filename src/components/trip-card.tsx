"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Calendar, Plane } from "lucide-react";
import type { ViewMode } from "@/components/view-selector";
import { cn } from "@/lib/utils";
import { useCityImage } from "@/hooks/use-city-image";

interface TripCardProps {
  readonly trip: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly destination: string | null;
    readonly startDate: Date | null;
    readonly endDate: Date | null;
  };
  view?: ViewMode;
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

export function TripCard({ trip, view = "list" }: TripCardProps) {
  const daysRemaining = getDaysUntilTrip(trip.startDate);
  const { imageUrl, isLoading: imageLoading } = useCityImage(trip.destination);
  
  // Vista compacta
  if (view === "compact") {
    return (
      <Card className="group relative cursor-pointer transition-all duration-300 hover:shadow-md">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted transition-all duration-300 group-hover:bg-primary/10">
                <Plane className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-primary" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">{trip.name}</h3>
            </div>
            {daysRemaining !== null && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium whitespace-nowrap shrink-0",
                  daysRemaining < 0
                    ? "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                    : daysRemaining === 0
                      ? "border-orange-300/50 bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                      : daysRemaining <= 7
                        ? "border-blue-300/50 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                        : "border-primary/30 bg-primary/10 text-primary"
                )}
              >
                {formatDaysRemaining(daysRemaining)}
              </Badge>
            )}
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <Link
            href={`/trips/${trip.slug}`}
            className="absolute inset-0 z-10"
            aria-label={`Ver detalles de ${trip.name}`}
          />
        </CardContent>
      </Card>
    );
  }

  // Vista grid
  if (view === "grid") {
    return (
      <Card className="group relative cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden">
        {/* Imagen de fondo */}
        {imageUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={imageUrl}
              alt={trip.destination || trip.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Overlay oscuro para mejor legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          </div>
        )}
        <CardContent className="p-4 flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-center">
            {imageUrl ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110">
                <Plane className="h-6 w-6 text-white transition-all duration-300 group-hover:text-primary" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
                <Plane className="h-6 w-6 text-muted-foreground transition-all duration-300 group-hover:text-primary" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className={cn(
              "text-base font-semibold mb-2 line-clamp-2",
              imageUrl && "text-white drop-shadow-lg"
            )}>
              {trip.name}
            </h3>
            {trip.destination && (
              <div className={cn(
                "flex items-center justify-center gap-1.5 text-sm mb-2",
                imageUrl ? "text-white/90" : "text-muted-foreground"
              )}>
                <MapPin className={cn("h-3.5 w-3.5 shrink-0", imageUrl && "text-white")} />
                <span className="truncate">{trip.destination}</span>
              </div>
            )}
            {daysRemaining !== null && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium",
                  imageUrl && "bg-white/10 backdrop-blur-sm border-white/30 text-white",
                  daysRemaining < 0
                    ? !imageUrl && "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                    : daysRemaining === 0
                      ? !imageUrl && "border-orange-300/50 bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                      : daysRemaining <= 7
                        ? !imageUrl && "border-blue-300/50 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                        : !imageUrl && "border-primary/30 bg-primary/10 text-primary"
                )}
              >
                {formatDaysRemaining(daysRemaining)}
              </Badge>
            )}
          </div>
          <Link
            href={`/trips/${trip.slug}`}
            className="absolute inset-0 z-10"
            aria-label={`Ver detalles de ${trip.name}`}
          />
        </CardContent>
      </Card>
    );
  }

  // Vista cards (optimizada para móvil)
  if (view === "cards") {
    return (
      <Card className="group relative cursor-pointer transition-all duration-300 hover:shadow-md overflow-hidden">
        {/* Imagen de fondo */}
        {imageUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={imageUrl}
              alt={trip.destination || trip.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Overlay oscuro para mejor legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          </div>
        )}
        <CardContent className="p-4 sm:p-6 relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="shrink-0">
              {imageUrl ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:bg-white/20">
                  <Plane className="h-6 w-6 text-white transition-all duration-300 group-hover:text-primary" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted transition-all duration-300 group-hover:bg-primary/10">
                  <Plane className="h-6 w-6 text-muted-foreground transition-all duration-300 group-hover:text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-lg font-semibold mb-2",
                imageUrl && "text-white drop-shadow-lg"
              )}>
                {trip.name}
              </h3>
              {trip.destination && (
                <div className={cn(
                  "flex items-center gap-2 text-sm mb-2",
                  imageUrl ? "text-white/90" : "text-muted-foreground"
                )}>
                  <MapPin className={cn("h-4 w-4 shrink-0", imageUrl && "text-white")} />
                  <span>{trip.destination}</span>
                </div>
              )}
            </div>
          </div>
          
          {(trip.startDate || trip.endDate) && (
            <div className={cn(
              "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-4",
              imageUrl ? "text-white/80" : "text-muted-foreground"
            )}>
              {trip.startDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className={cn("h-4 w-4 shrink-0", imageUrl && "text-white")} />
                  <span>{formatDate(trip.startDate)}</span>
                </div>
              )}
              {trip.endDate && trip.startDate && <span>→</span>}
              {trip.endDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className={cn("h-4 w-4 shrink-0", imageUrl && "text-white")} />
                  <span>{formatDate(trip.endDate)}</span>
                </div>
              )}
            </div>
          )}

          {daysRemaining !== null && (
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium",
                  imageUrl && "bg-white/10 backdrop-blur-sm border-white/30 text-white",
                  daysRemaining < 0
                    ? !imageUrl && "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                    : daysRemaining === 0
                      ? !imageUrl && "border-orange-300/50 bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                      : daysRemaining <= 7
                        ? !imageUrl && "border-blue-300/50 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                        : !imageUrl && "border-primary/30 bg-primary/10 text-primary"
                )}
              >
                {formatDaysRemaining(daysRemaining)}
              </Badge>
              <ArrowRight className={cn(
                "h-4 w-4 transition-transform duration-300 group-hover:translate-x-1",
                imageUrl ? "text-white group-hover:text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
            </div>
          )}

          <Link
            href={`/trips/${trip.slug}`}
            className="absolute inset-0 z-10"
            aria-label={`Ver detalles de ${trip.name}`}
          />
        </CardContent>
      </Card>
    );
  }

  // Vista lista (por defecto)
  return (
    <Card className="group relative cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 active:shadow-md active:-translate-y-0.5 active:scale-[0.98] overflow-hidden">
      {/* Imagen de fondo (solo en desktop para vista lista) */}
      {imageUrl && (
        <div className="hidden sm:block absolute inset-0 z-0 w-48">
          <Image
            src={imageUrl}
            alt={trip.destination || trip.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="192px"
          />
          {/* Overlay para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        </div>
      )}
      <CardContent className={cn("relative p-4 sm:p-6", daysRemaining !== null && 'sm:pb-6', imageUrl && 'sm:pl-56')}>
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{trip.destination}</span>
                  </div>
                  {/* Días restantes en móvil - al lado de la localización */}
                  {daysRemaining !== null && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium whitespace-nowrap sm:hidden",
                        daysRemaining < 0
                          ? "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                          : daysRemaining === 0
                            ? "border-orange-300/50 bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                            : daysRemaining <= 7
                              ? "border-blue-300/50 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                              : "border-primary/30 bg-primary/10 text-primary"
                      )}
                    >
                      {formatDaysRemaining(daysRemaining)}
                    </Badge>
                  )}
                </div>
              )}
              {/* Si no hay destino, mostrar días restantes en móvil aquí */}
              {!trip.destination && daysRemaining !== null && (
                <div className="sm:hidden">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium whitespace-nowrap",
                      daysRemaining < 0
                        ? "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                        : daysRemaining === 0
                          ? "border-orange-300/50 bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                          : daysRemaining <= 7
                            ? "border-blue-300/50 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                            : "border-primary/30 bg-primary/10 text-primary"
                    )}
                  >
                    {formatDaysRemaining(daysRemaining)}
                  </Badge>
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

        {/* Días restantes - Parte inferior derecha (solo en desktop) */}
        {daysRemaining !== null && (
          <div className="hidden sm:block absolute bottom-4 right-4 z-20">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-medium whitespace-nowrap",
                daysRemaining < 0
                  ? "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                  : daysRemaining === 0
                    ? "border-orange-300/50 bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300"
                    : daysRemaining <= 7
                      ? "border-blue-300/50 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "border-primary/30 bg-primary/10 text-primary"
              )}
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
