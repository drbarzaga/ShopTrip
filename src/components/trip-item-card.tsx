"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Pencil, Trash2, Calendar, Sparkles } from "lucide-react";
import { getItemIcon } from "@/lib/item-icons";
import {
  toggleItemPurchasedAction,
  deleteTripItemAction,
} from "@/actions/trip-items";
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
    createdAt: Date | null;
    updatedAt: Date | null;
    formattedPrice?: string; // Precio total ya formateado
    formattedUnitPrice?: string; // Precio unitario ya formateado
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

/**
 * Determina si un producto es reciente (creado o editado en la última hora)
 */
function isRecentItem(
  createdAt: Date | null,
  updatedAt: Date | null
): {
  isRecent: boolean;
  isNew: boolean;
  isEdited: boolean;
} {
  const RECENT_THRESHOLD_MS = 60 * 60 * 1000; // 1 hora
  const now = new Date();

  if (!createdAt) {
    return { isRecent: false, isNew: false, isEdited: false };
  }

  const createdTime = new Date(createdAt).getTime();
  const updatedTime = updatedAt ? new Date(updatedAt).getTime() : createdTime;
  const nowTime = now.getTime();

  const isNew = nowTime - createdTime < RECENT_THRESHOLD_MS;
  const isEdited = !!(
    updatedAt &&
    updatedTime > createdTime &&
    nowTime - updatedTime < RECENT_THRESHOLD_MS
  );
  const isRecent = isNew || isEdited;

  return { isRecent, isNew, isEdited };
}

export function TripItemCard({ item, canEdit = true }: TripItemCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchased, setPurchased] = useState(item.purchased ?? false);

  // Verificar si el producto tiene precio
  const hasPrice = item.price !== null && item.price > 0;

  // Verificar si el producto es reciente
  const { isRecent, isNew, isEdited } = isRecentItem(
    item.createdAt,
    item.updatedAt
  );

  // Renderizar el icono directamente sin crear una variable de componente
  const renderIcon = () => {
    const IconComponent = getItemIcon(item.name);
    return (
      <IconComponent
        className={`h-4 w-4 transition-all duration-300 ${
          purchased
            ? "text-green-600 dark:text-green-400"
            : "text-muted-foreground group-hover:text-primary group-active:text-primary"
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

  // Usar precios formateados si están disponibles, sino calcular
  const totalPrice =
    item.price !== null && item.quantity
      ? item.price * item.quantity
      : (item.price ?? 0);

  // Si tenemos precios formateados del servidor, usarlos directamente
  const displayPrice = item.formattedPrice;
  const displayUnitPrice = item.formattedUnitPrice;

  return (
    <Card
      className={`group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:shadow-md active:-translate-y-0.5 active:scale-[0.98] ${
        purchased
          ? "border-green-200 dark:border-green-800"
          : isRecent
            ? "border-blue-300 dark:border-blue-700"
            : ""
      }`}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Icono */}
          <div className="shrink-0">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-110 group-active:rotate-3 ${
              purchased
                ? "bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-900/60 group-active:bg-green-200 dark:group-active:bg-green-900/60"
                : "bg-muted group-hover:bg-primary/10 group-active:bg-primary/10"
            }`}>
              <div className="transition-transform duration-300 group-hover:-rotate-6 group-active:-rotate-6">
                {renderIcon()}
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header con título y acciones */}
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className={`text-sm sm:text-base font-medium leading-snug ${
                      purchased
                        ? "line-through text-muted-foreground/60"
                        : "text-foreground"
                    }`}
                  >
                    {item.name}
                  </h3>
                  {isRecent && (
                    <Badge
                      variant="outline"
                      className={`h-5 gap-1 px-2 text-xs font-semibold border-blue-300/50 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 animate-pulse ${
                        isNew
                          ? "border-green-300/50 bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                          : ""
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>
                        {isNew
                          ? "Creado recientemente"
                          : "Editado recientemente"}
                      </span>
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
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
                          size="icon"
                          className="h-8 w-8 text-muted-foreground transition-all hover:text-foreground hover:bg-accent"
                          aria-label="Editar artículo"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Dialog
                      open={deleteDialogOpen}
                      onOpenChange={setDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10"
                          aria-label="Eliminar artículo"
                          disabled={isDeleting}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>¿Eliminar artículo?</DialogTitle>
                          <DialogDescription>
                            Esta acción no se puede deshacer. El artículo &quot;
                            {item.name}&quot; será eliminado permanentemente.
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
                {/* Checkbox movido a la derecha */}
                <div className="pt-0.5 shrink-0">
                  <Checkbox
                    checked={purchased}
                    onCheckedChange={handleToggle}
                    disabled={isPending || !canEdit || !hasPrice}
                    className="h-5 w-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                    title={
                      !hasPrice
                        ? "Agrega un precio para marcar como comprado"
                        : ""
                    }
                  />
                </div>
              </div>
            </div>

            {/* Metadata inferior */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {item.quantity && item.quantity >= 1 && (
                  <Badge
                    variant="outline"
                    className="h-6 gap-1 px-2 text-xs font-medium border-border/50 bg-muted/30"
                  >
                    <Package className="h-3 w-3" />
                    <span>{item.quantity}</span>
                  </Badge>
                )}
                <Badge
                  variant={purchased ? "outline" : "default"}
                  className={`h-6 gap-1 px-2.5 text-xs font-semibold transition-all ${
                    purchased
                      ? "border-green-300/50 bg-green-50/50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <span>
                    {displayPrice ? (
                      displayPrice
                    ) : (
                      <CurrencyFormatter amount={totalPrice ?? 0} />
                    )}
                    {item.quantity &&
                      item.quantity > 1 &&
                      item.price !== null && (
                        <span className="ml-1.5 text-[10px] opacity-75 font-normal">
                          ·{" "}
                          {displayUnitPrice ? (
                            displayUnitPrice
                          ) : (
                            <CurrencyFormatter amount={item.price} />
                          )}{" "}
                          c/u
                        </span>
                      )}
                  </span>
                </Badge>
              </div>

              {/* Información del comprador y fecha */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Información del comprador */}
                {purchased && item.purchasedByName && (
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-green-100/80 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30">
                    <Avatar className="h-5 w-5 border border-green-300/50 dark:border-green-700/50">
                      {item.purchasedByImage && (
                        <AvatarImage
                          src={item.purchasedByImage}
                          alt={item.purchasedByName}
                        />
                      )}
                      <AvatarFallback className="text-[10px] font-semibold bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                        {getInitials(item.purchasedByName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                      {item.purchasedByName}
                    </span>
                  </div>
                )}
                {/* Fecha de creación */}
                {item.createdAt && (
                  <Badge
                    variant="outline"
                    className="h-6 gap-1 px-2 text-xs font-medium border-border/50 bg-muted/30 text-muted-foreground"
                  >
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Intl.DateTimeFormat("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(item.createdAt))}
                    </span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
