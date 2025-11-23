"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, DollarSign, Package, Pencil, Trash2 } from "lucide-react";
import { getItemIcon } from "@/lib/item-icons";
import { toggleItemPurchasedAction, deleteTripItemAction } from "@/actions/trip-items";
import { CurrencyFormatter } from "@/components/currency-formatter";
import { EditTripItemDialog } from "@/components/edit-trip-item-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TripItemCardProps {
  item: {
    id: string;
    name: string;
    description: string | null;
    price: number | null;
    quantity: number | null;
    purchased: boolean;
    purchasedBy: string | null;
    purchasedByName: string | null;
    purchasedByImage: string | null;
  };
  canEdit?: boolean;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TripItemCard({ item, canEdit = true }: TripItemCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchased, setPurchased] = useState(item.purchased);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  
  // Verificar si el producto tiene precio
  const hasPrice = item.price !== null && item.price > 0;
  
  // Umbral para activar la eliminación (80px)
  const DELETE_THRESHOLD = 80;

  // Renderizar el icono directamente sin crear una variable de componente
  const renderIcon = () => {
    const IconComponent = getItemIcon(item.name);
    return (
      <IconComponent
        className={`h-5 w-5 transition-all duration-300 ${
          purchased
            ? "text-green-700 dark:text-green-300 scale-110"
            : "text-primary group-hover:scale-110"
        }`}
      />
    );
  };

  const handleToggle = (checked: boolean) => {
    if (!canEdit || !hasPrice) return;
    setPurchased(checked);
    startTransition(async () => {
      const result = await toggleItemPurchasedAction(item.id, checked);
      if (result.success) {
        router.refresh();
      } else {
        // Revertir el estado si falla
        setPurchased(!checked);
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteTripItemAction(item.id);
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
    if (!canEdit || isPending || isDeleting) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = startXRef.current;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping || !canEdit) return;
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

  // Manejar eventos de mouse para desktop (opcional, solo horizontal)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canEdit || isPending || isDeleting) return;
    e.preventDefault();
    startXRef.current = e.clientX;
    currentXRef.current = startXRef.current;
    setIsSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSwiping || !canEdit) return;
    e.preventDefault();
    currentXRef.current = e.clientX;
    const diff = startXRef.current - currentXRef.current;
    
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, DELETE_THRESHOLD * 1.5));
    }
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
      if (isSwiping && canEdit) {
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
  }, [isSwiping, swipeOffset, canEdit]);

  const totalPrice =
    item.price && item.quantity ? item.price * item.quantity : item.price;

  return (
    <div className="relative">
      {/* Botón de eliminar que aparece al deslizar */}
      {canEdit && swipeOffset > 0 && (
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
          purchased
            ? "bg-gradient-to-r from-green-50/60 via-green-50/30 to-background dark:from-green-950/30 dark:via-green-950/15 dark:to-background border-green-200/60 dark:border-green-800/50"
            : "bg-card hover:shadow-xl hover:border-primary/60 hover:-translate-y-0.5"
        } ${canEdit ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{
          transform: swipeOffset > 0 ? `translateX(-${swipeOffset}px)` : "translateX(0)",
          transition: isSwiping ? "none" : "transform 0.2s ease-out",
          touchAction: canEdit ? "pan-y" : "auto",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
      >
      {/* Efecto de brillo sutil */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
          purchased ? "via-green-100/10" : "via-primary/5"
        }`}
      />

      <CardContent className="p-4 relative z-10">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="pt-1 shrink-0 relative z-20">
            <Checkbox
              checked={purchased}
              onCheckedChange={handleToggle}
              disabled={isPending || !canEdit || !hasPrice}
              className="h-5 w-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 relative z-20"
              title={!hasPrice ? "Agrega un precio para marcar como comprado" : ""}
            />
          </div>

          {/* Icono con efecto */}
          <div className="relative shrink-0">
            <div
              className={`absolute -inset-1 rounded-xl blur-lg transition-opacity duration-300 ${
                purchased
                  ? "bg-green-400/30 opacity-100"
                  : "bg-primary/20 opacity-0 group-hover:opacity-100"
              }`}
            />
            <div
              className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                purchased
                  ? "bg-gradient-to-br from-green-500/20 to-green-400/10 dark:from-green-500/30 dark:to-green-600/20 shadow-lg shadow-green-500/20"
                  : "bg-gradient-to-br from-primary/15 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 shadow-md shadow-primary/10"
              }`}
            >
              {renderIcon()}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold text-base leading-tight mb-1 transition-all duration-300 ${
                    purchased
                      ? "line-through text-muted-foreground/60"
                      : "text-foreground group-hover:text-primary"
                  }`}
                >
                  <span className="line-clamp-2 break-words">{item.name}</span>
                </h3>
                {item.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-1">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {purchased && (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                )}
                {canEdit && (
                  <>
                    <EditTripItemDialog
                      item={{
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        quantity: item.quantity,
                      }}
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-opacity"
                          aria-label="Editar artículo"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          aria-label="Eliminar artículo"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>¿Eliminar artículo?</DialogTitle>
                          <DialogDescription>
                            Esta acción no se puede deshacer. El artículo "{item.name}" será eliminado permanentemente.
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
                  </>
                )}
              </div>
            </div>

            {/* Metadata inferior */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {item.quantity && item.quantity > 1 && (
                  <Badge
                    variant="outline"
                    className="gap-1 px-2 py-0.5 text-xs border-muted-foreground/20"
                  >
                    <Package className="h-3 w-3" />
                    <span className="font-medium">{item.quantity}</span>
                  </Badge>
                )}
                {item.price && (
                  <Badge
                    variant={purchased ? "outline" : "default"}
                    className="gap-1.5 px-2.5 py-1 text-xs font-semibold"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>
                      <CurrencyFormatter amount={totalPrice} />
                      {item.quantity && item.quantity > 1 && item.price && (
                        <span className="ml-1.5 text-[10px] opacity-70 font-normal">
                          · <CurrencyFormatter amount={item.price} /> c/u
                        </span>
                      )}
                    </span>
                  </Badge>
                )}
              </div>

              {/* Información del comprador */}
              {purchased && item.purchasedByName && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-green-100/80 dark:bg-green-900/30 border border-green-200/60 dark:border-green-800/40">
                  <Avatar className="h-5 w-5 border border-green-300/50 dark:border-green-700/50">
                    {item.purchasedByImage && (
                      <AvatarImage
                        src={item.purchasedByImage}
                        alt={item.purchasedByName}
                      />
                    )}
                    <AvatarFallback className="text-[10px] font-bold bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                      {getInitials(item.purchasedByName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                    {item.purchasedByName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
