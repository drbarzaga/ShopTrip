"use client";

import { useState, useTransition } from "react";
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
  
  // Verificar si el producto tiene precio
  const hasPrice = item.price !== null && item.price > 0;

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
        router.refresh();
      } else {
        setIsDeleting(false);
      }
    });
  };

  const totalPrice =
    item.price && item.quantity ? item.price * item.quantity : item.price;

  return (
    <div className="relative">
      <Card
        className={`group relative overflow-hidden border transition-all duration-300 ${
          purchased
            ? "bg-gradient-to-r from-green-50/70 via-green-50/40 to-background dark:from-green-950/40 dark:via-green-950/20 dark:to-background border-green-300/60 dark:border-green-700/50"
            : "bg-card hover:shadow-xl hover:border-primary/60"
        }`}
        style={{
          boxShadow: purchased
            ? "0 4px 12px -2px rgba(34, 197, 94, 0.15)"
            : undefined,
        }}
      >
      {/* Efecto de brillo sutil */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
          purchased ? "via-green-100/10" : "via-primary/5"
        }`}
      />

      <CardContent className="p-4 sm:p-5 relative z-10">
        <div className="flex items-start gap-4">
          {/* Checkbox mejorado */}
          <div className="pt-1 shrink-0 relative z-20">
            <Checkbox
              checked={purchased}
              onCheckedChange={handleToggle}
              disabled={isPending || !canEdit || !hasPrice}
              className="h-6 w-6 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 relative z-20 transition-all duration-200"
              title={!hasPrice ? "Agrega un precio para marcar como comprado" : ""}
            />
          </div>

          {/* Icono con efecto mejorado */}
          <div className="relative shrink-0">
            <div
              className={`absolute -inset-1.5 rounded-xl blur-xl transition-all duration-300 ${
                purchased
                  ? "bg-green-400/40 opacity-100"
                  : "bg-primary/25 opacity-0 group-hover:opacity-100"
              }`}
            />
            <div
              className={`relative p-3 rounded-xl transition-all duration-300 border ${
                purchased
                  ? "bg-gradient-to-br from-green-500/25 to-green-400/15 dark:from-green-500/35 dark:to-green-600/25 shadow-lg shadow-green-500/25 border-green-300/30 dark:border-green-700/30"
                  : "bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/25 group-hover:to-primary/15 shadow-md shadow-primary/15 border-primary/20 group-hover:border-primary/30"
              }`}
            >
              {renderIcon()}
            </div>
          </div>

          {/* Contenido principal mejorado */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-bold text-lg leading-tight mb-1.5 transition-all duration-300 ${
                    purchased
                      ? "line-through text-muted-foreground/50"
                      : "text-foreground group-hover:text-primary"
                  }`}
                >
                  <span className="line-clamp-2 break-words">{item.name}</span>
                </h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {purchased && (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5 animate-in fade-in zoom-in duration-200" />
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
                          className="h-9 w-9 p-0 opacity-70 hover:opacity-100 transition-all duration-200 hover:bg-primary/10"
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
                          className="h-9 w-9 p-0 opacity-70 hover:opacity-100 transition-all duration-200 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                            Esta acción no se puede deshacer. El artículo &quot;{item.name}&quot; será eliminado permanentemente.
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

            {/* Metadata inferior mejorada */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {item.quantity && item.quantity > 1 && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 px-3 py-1 text-xs font-semibold border-muted-foreground/30 bg-muted/50"
                  >
                    <Package className="h-3.5 w-3.5" />
                    <span>{item.quantity}</span>
                  </Badge>
                )}
                {item.price && (
                  <Badge
                    variant={purchased ? "outline" : "default"}
                    className={`gap-1.5 px-3 py-1.5 text-sm font-bold transition-all duration-200 ${
                      purchased
                        ? "border-green-300/50 bg-green-50/50 dark:bg-green-950/30"
                        : "bg-primary text-primary-foreground shadow-md"
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>
                      <CurrencyFormatter amount={totalPrice} />
                      {item.quantity && item.quantity > 1 && item.price && (
                        <span className="ml-2 text-xs opacity-75 font-normal">
                          · <CurrencyFormatter amount={item.price} /> c/u
                        </span>
                      )}
                    </span>
                  </Badge>
                )}
              </div>

              {/* Información del comprador mejorada */}
              {purchased && item.purchasedByName && (
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-green-100/90 dark:bg-green-900/40 border border-green-300/60 dark:border-green-700/50 shadow-sm animate-in fade-in slide-in-from-right-2 duration-300">
                  <Avatar className="h-6 w-6 border-2 border-green-300/60 dark:border-green-700/60 shadow-sm">
                    {item.purchasedByImage && (
                      <AvatarImage
                        src={item.purchasedByImage}
                        alt={item.purchasedByName}
                      />
                    )}
                    <AvatarFallback className="text-xs font-bold bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                      {getInitials(item.purchasedByName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold text-foreground truncate max-w-[120px]">
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
