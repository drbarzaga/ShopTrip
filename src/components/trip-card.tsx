"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Calendar, Plane, Trash2 } from "lucide-react";
import { deleteTripAction } from "@/actions/trips";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TripCardProps {
  readonly trip: {
    readonly id: string;
    readonly name: string;
    readonly slug: string;
    readonly destination: string | null;
    readonly startDate: Date | null;
    readonly endDate: Date | null;
  };
  readonly canDelete?: boolean;
}

function formatDate(date: Date | null): string {
  if (!date) return "No establecida";
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function TripCard({ trip, canDelete = false }: TripCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleDelete = async () => {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteTripAction(trip.id);
      if (result.success) {
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        setIsDeleting(false);
      }
    });
  };

  return (
    <Card className="group relative overflow-hidden border border-border/50 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Icono minimalista */}
          <div className="relative shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/15 group-hover:scale-105">
              <Plane className="h-5 w-5" />
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header con título y acciones */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                  {trip.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {canDelete && (
                  <Dialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <div
                      className="relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10"
                          aria-label="Eliminar viaje"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                    </div>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>¿Eliminar viaje?</DialogTitle>
                        <DialogDescription>
                          Esta acción no se puede deshacer. El viaje &quot;
                          {trip.name}&quot; y todos sus artículos serán
                          eliminados permanentemente.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                          variant="outline"
                          onClick={() => setDeleteDialogOpen(false)}
                          disabled={isDeleting}
                          className="w-full sm:w-auto"
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="w-full sm:w-auto"
                        >
                          {isDeleting ? "Eliminando..." : "Eliminar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:text-primary group-hover:translate-x-1" />
              </div>
            </div>

            {/* Información secundaria */}
            <div className="flex flex-col gap-2">
              {trip.destination && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{trip.destination}</span>
                </div>
              )}
              {(trip.startDate || trip.endDate) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {trip.startDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatDate(trip.startDate)}</span>
                    </div>
                  )}
                  {trip.endDate && trip.startDate && (
                    <span className="hidden sm:inline">→</span>
                  )}
                  {trip.endDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
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
