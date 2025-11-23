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
  trip: {
    id: string;
    name: string;
    slug: string;
    destination: string | null;
    startDate: Date | null;
    endDate: Date | null;
  };
  canDelete?: boolean;
}

function formatDate(date: Date | null): string {
  if (!date) return "No establecida";
  return new Intl.DateTimeFormat("en-US", {
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
    <div className="relative">
      <Card className="group relative overflow-hidden border transition-all duration-300 hover:border-primary/50 hover:shadow-lg touch-manipulation">
        {/* Efecto de brillo sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardContent className="p-4 sm:p-5 relative z-10">
          <div className="flex items-start gap-4">
            {/* Icono decorativo mejorado */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-primary/10 rounded-xl blur-md group-hover:bg-primary/20 transition-all duration-300 group-hover:blur-lg" />
              <div className="relative bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 p-3.5 rounded-xl border border-primary/10 group-hover:border-primary/20 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10">
                <Plane className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]" />
              </div>
            </div>

            {/* Contenido mejorado */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg sm:text-xl truncate group-hover:text-primary transition-colors duration-200 mb-1">
                    {trip.name}
                  </h3>
                  {trip.destination && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 shrink-0 text-primary/60" />
                      <span className="truncate font-medium">
                        {trip.destination}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canDelete && (
                    <Dialog
                      open={deleteDialogOpen}
                      onOpenChange={setDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label="Eliminar viaje"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
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
                  <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </div>

              {(trip.startDate || trip.endDate) && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                  {trip.startDate && (
                    <div className="flex items-center gap-2 bg-muted/50 px-2.5 py-1 rounded-md">
                      <Calendar className="h-4 w-4 shrink-0 text-primary/60" />
                      <span className="font-medium">
                        {formatDate(trip.startDate)}
                      </span>
                    </div>
                  )}
                  {trip.endDate && trip.startDate && (
                    <span className="hidden sm:inline text-muted-foreground/50">
                      →
                    </span>
                  )}
                  {trip.endDate && (
                    <div className="flex items-center gap-2 bg-muted/50 px-2.5 py-1 rounded-md">
                      <Calendar className="h-4 w-4 shrink-0 text-primary/60" />
                      <span className="font-medium">
                        {formatDate(trip.endDate)}
                      </span>
                    </div>
                  )}
                </div>
              )}
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
    </div>
  );
}
