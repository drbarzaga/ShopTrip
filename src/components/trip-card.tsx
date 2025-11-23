"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  // Umbral para activar la eliminación (80px)
  const DELETE_THRESHOLD = 80;

  const [, startTransition] = useTransition();

  const handleDelete = async () => {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteTripAction(trip.id);
      if (result.success) {
        setDeleteDialogOpen(false);
        setSwipeOffset(0);
        router.refresh();
      } else {
        setIsDeleting(false);
      }
    });
  };

  // Gestos de swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canDelete || isDeleting) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || !canDelete) return;
    currentXRef.current = e.touches[0].clientX;
    const diff = startXRef.current - currentXRef.current;

    // Solo permitir deslizar hacia la izquierda (valores positivos)
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, DELETE_THRESHOLD * 1.5));
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    // Si se deslizó más del umbral, mostrar diálogo de confirmación
    if (swipeOffset >= DELETE_THRESHOLD) {
      setDeleteDialogOpen(true);
      setSwipeOffset(0);
    } else {
      // Volver a la posición original
      setSwipeOffset(0);
    }
  };

  // Manejar eventos de mouse para desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canDelete || isDeleting) return;
    e.preventDefault();
    startXRef.current = e.clientX;
    currentXRef.current = startXRef.current;
    setIsSwiping(true);
  };

  const handleMouseUp = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    if (swipeOffset >= DELETE_THRESHOLD) {
      setDeleteDialogOpen(true);
      setSwipeOffset(0);
    } else {
      setSwipeOffset(0);
    }
  };

  // Limpiar eventos cuando el componente se desmonta o cuando se suelta el mouse fuera
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSwiping) {
        setIsSwiping(false);
        if (swipeOffset >= DELETE_THRESHOLD) {
          setDeleteDialogOpen(true);
        }
        setSwipeOffset(0);
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isSwiping && canDelete) {
        currentXRef.current = e.clientX;
        const diff = startXRef.current - currentXRef.current;

        if (diff > 0) {
          setSwipeOffset(Math.min(diff, DELETE_THRESHOLD * 1.5));
        }
      }
    };

    if (isSwiping) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mousemove", handleGlobalMouseMove);
      return () => {
        document.removeEventListener("mouseup", handleGlobalMouseUp);
        document.removeEventListener("mousemove", handleGlobalMouseMove);
      };
    }
  }, [isSwiping, swipeOffset, canDelete]);

  return (
    <div className="relative">
      {/* Botón de eliminar que aparece al deslizar */}
      {canDelete && swipeOffset > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-4 bg-destructive z-10 rounded-r-lg"
          style={{
            width: `${Math.min(swipeOffset, DELETE_THRESHOLD)}px`,
            transition: isSwiping ? "none" : "width 0.2s ease-out",
          }}
        >
          <Trash2 className="h-5 w-5 text-destructive-foreground" />
        </div>
      )}

      <Card
        ref={cardRef}
        className={`group relative overflow-hidden border transition-all duration-300 ${
          canDelete ? "cursor-grab active:cursor-grabbing" : ""
        } hover:border-primary/50 hover:shadow-md touch-manipulation active:scale-[0.98]`}
        style={{
          transform:
            swipeOffset > 0 ? `translateX(-${swipeOffset}px)` : "translateX(0)",
          transition: isSwiping ? "none" : "transform 0.2s ease-out",
          touchAction: canDelete ? "pan-y" : "auto",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icono decorativo */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-primary/10 rounded-lg blur-sm group-hover:bg-primary/20 transition-colors"></div>
              <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-3 rounded-lg">
                <Plane className="h-5 w-5 text-primary" />
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-semibold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                  {trip.name}
                </h3>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>

              {trip.destination && (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{trip.destination}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
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
            </div>
          </div>

          {/* Link invisible para navegación cuando no se está deslizando */}
          {swipeOffset === 0 && (
            <Link
              href={`/trips/${trip.slug}`}
              className="absolute inset-0 z-0"
              aria-label={`Ver detalles de ${trip.name}`}
            />
          )}
        </CardContent>
      </Card>

      {/* Diálogo de confirmación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¿Eliminar viaje?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. El viaje &quot;{trip.name}&quot;
              y todos sus artículos serán eliminados permanentemente.
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
    </div>
  );
}
