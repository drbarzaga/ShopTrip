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

  const deleteButtonWidth = Math.min(swipeOffset, DELETE_THRESHOLD);
  const isDeleteThresholdReached = swipeOffset >= DELETE_THRESHOLD;

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Botón de eliminar que aparece al deslizar */}
      {canDelete && swipeOffset > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center bg-gradient-to-l from-destructive to-destructive/90 z-10 rounded-r-lg shadow-lg"
          style={{
            width: `${deleteButtonWidth}px`,
            transition: isSwiping
              ? "none"
              : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease-out",
            opacity: swipeOffset > 10 ? 1 : swipeOffset / 10,
          }}
        >
          <div
            className={`flex items-center justify-center transition-all duration-300 ${
              isDeleteThresholdReached
                ? "scale-110 rotate-0"
                : "scale-100 rotate-0"
            }`}
            style={{
              transform: `scale(${1 + (swipeOffset / DELETE_THRESHOLD) * 0.1})`,
            }}
          >
            <Trash2 className="h-5 w-5 text-destructive-foreground drop-shadow-sm" />
          </div>
        </div>
      )}

      <Card
        ref={cardRef}
        className={`group relative overflow-hidden border transition-all duration-300 ${
          canDelete ? "cursor-grab active:cursor-grabbing" : ""
        } hover:border-primary/50 hover:shadow-lg touch-manipulation ${
          swipeOffset > 0 ? "shadow-xl" : ""
        }`}
        style={{
          transform:
            swipeOffset > 0
              ? `translateX(-${swipeOffset}px) scale(${1 - swipeOffset / 1000})`
              : "translateX(0) scale(1)",
          transition: isSwiping
            ? "none"
            : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease-out",
          touchAction: canDelete ? "pan-y" : "auto",
          boxShadow:
            swipeOffset > 0
              ? `0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(239, 68, 68, 0.1)`
              : undefined,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
      >
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
                <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
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
