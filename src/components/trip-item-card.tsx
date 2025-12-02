"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { analytics } from "@/lib/analytics";
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
import type { ViewMode } from "@/components/view-selector";

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
  tripId?: string;
  canEdit?: boolean;
  view?: ViewMode;
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

export function TripItemCard({
  item,
  tripId,
  canEdit = true,
  view = "list",
}: TripItemCardProps) {
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
        // Trackear compra de artículo
        if (checked && tripId) {
          analytics.purchaseItem(tripId, item.name);
        }

        toast.success(
          checked ? "Artículo marcado como comprado" : "Artículo desmarcado",
          {
            description: checked
              ? `${item.name} ha sido marcado como comprado.`
              : `${item.name} ha sido desmarcado.`,
          }
        );
        router.refresh();
      } else {
        // Revertir el estado si falla
        setPurchased(!checked);
        toast.error("Error al actualizar artículo", {
          description: result.message || "Por favor, intenta nuevamente.",
        });
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteTripItemAction(item.id);
      if (result.success) {
        toast.success("Artículo eliminado", {
          description: `"${item.name}" ha sido eliminado de tu lista.`,
        });
        setDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error("Error al eliminar artículo", {
          description: result.message || "Por favor, intenta nuevamente.",
        });
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

  // Renderizar según la vista
  if (view === "compact") {
    return (
      <Card
        className={`group transition-all duration-300 hover:shadow-md ${
          purchased
            ? "border-green-200 dark:border-green-800"
            : isRecent
              ? "border-blue-300 dark:border-blue-700"
              : ""
        }`}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <Checkbox
                checked={purchased}
                onCheckedChange={handleToggle}
                disabled={isPending || !canEdit || !hasPrice}
                className="h-4 w-4 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <div className="shrink-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    purchased
                      ? "bg-green-100 dark:bg-green-900/40"
                      : "bg-muted"
                  }`}
                >
                  {renderIcon()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-sm font-medium truncate ${
                    purchased
                      ? "line-through text-muted-foreground/60"
                      : "text-foreground"
                  }`}
                >
                  {item.name}
                </h3>
              </div>
              {displayPrice && (
                <Badge
                  variant={purchased ? "outline" : "default"}
                  className={`text-xs ${
                    purchased
                      ? "border-green-300/50 bg-green-50/50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                      : ""
                  }`}
                >
                  {displayPrice}
                </Badge>
              )}
              {canEdit && (
                <div className="flex items-center gap-1 shrink-0">
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
                        className="h-7 w-7 text-muted-foreground"
                        aria-label="Editar artículo"
                      >
                        <Pencil className="h-3.5 w-3.5" />
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
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label="Eliminar artículo"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (view === "cards") {
    return (
      <Card
        className={`group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
          purchased
            ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/10"
            : isRecent
              ? "border-blue-300 dark:border-blue-700"
              : ""
        }`}
      >
        <CardContent className="p-6">
          <div className="flex flex-col gap-5">
            {/* Header con icono, título y checkbox */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-xl shrink-0 transition-all shadow-sm ${
                    purchased
                      ? "bg-green-100 dark:bg-green-900/40"
                      : "bg-muted group-hover:bg-primary/10"
                  }`}
                >
                  {renderIcon()}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h3
                      className={`text-lg font-bold leading-tight ${
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
                        className={`h-5 gap-1 px-2 text-xs font-semibold border-blue-300/50 bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ${
                          isNew
                            ? "border-green-300/50 bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                            : ""
                        }`}
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{isNew ? "Nuevo" : "Editado"}</span>
                      </Badge>
                    )}
                  </div>
                  
                  {/* Descripción completa */}
                  {item.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              <Checkbox
                checked={purchased}
                onCheckedChange={handleToggle}
                disabled={isPending || !canEdit || !hasPrice}
                className="h-6 w-6 shrink-0 mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                title={
                  !hasPrice
                    ? "Agrega un precio para marcar como comprado"
                    : purchased
                      ? "Marcar como no comprado"
                      : "Marcar como comprado"
                }
              />
            </div>

            {/* Información de precio y cantidad */}
            <div className="flex flex-col gap-3 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Cantidad */}
                  {item.quantity && item.quantity >= 1 && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Cantidad: <span className="font-semibold">{item.quantity}</span>
                      </span>
                    </div>
                  )}
                  
                  {/* Precio */}
                  {displayPrice && (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-muted-foreground">Precio total:</span>
                        <span
                          className={`text-lg font-bold ${
                            purchased
                              ? "text-green-700 dark:text-green-300 line-through"
                              : "text-primary"
                          }`}
                        >
                          {displayPrice}
                        </span>
                      </div>
                      {item.quantity &&
                        item.quantity > 1 &&
                        item.price !== null && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-muted-foreground">Precio unitario:</span>
                            <span className="text-sm font-semibold text-muted-foreground">
                              {displayUnitPrice ? displayUnitPrice : <CurrencyFormatter amount={item.price} />}
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                </div>
                
                {/* Estado de compra */}
                {purchased && (
                  <Badge
                    variant="outline"
                    className="h-7 px-3 text-xs font-semibold border-green-300/50 bg-green-100/80 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                  >
                    ✓ Comprado
                  </Badge>
                )}
              </div>

              {/* Fecha de creación */}
              {item.createdAt && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Agregado el{" "}
                    {new Intl.DateTimeFormat("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(item.createdAt))}
                  </span>
                </div>
              )}
            </div>

            {/* Información del comprador si está comprado */}
            {purchased && item.purchasedByName && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-100/80 dark:bg-green-900/30 border border-green-200/50 dark:border-green-800/30">
                <Avatar className="h-8 w-8 border-2 border-green-300/50 dark:border-green-700/50">
                  {item.purchasedByImage && (
                    <AvatarImage
                      src={item.purchasedByImage}
                      alt={item.purchasedByName}
                    />
                  )}
                  <AvatarFallback className="text-xs font-semibold bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                    {getInitials(item.purchasedByName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Comprado por</p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {item.purchasedByName}
                  </p>
                </div>
              </div>
            )}

            {/* Acciones de edición */}
            {canEdit && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
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
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2"
                      aria-label="Editar artículo"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="text-xs">Editar</span>
                    </Button>
                  }
                />
                <Dialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label="Eliminar artículo"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-xs">Eliminar</span>
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (view === "grid") {
    return (
      <Card
        className={`group transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
          purchased
            ? "border-green-200 dark:border-green-800"
            : isRecent
              ? "border-blue-300 dark:border-blue-700"
              : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                    purchased
                      ? "bg-green-100 dark:bg-green-900/40"
                      : "bg-muted"
                  }`}
                >
                  {renderIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-medium truncate ${
                      purchased
                        ? "line-through text-muted-foreground/60"
                        : "text-foreground"
                    }`}
                  >
                    {item.name}
                  </h3>
                </div>
              </div>
              <Checkbox
                checked={purchased}
                onCheckedChange={handleToggle}
                disabled={isPending || !canEdit || !hasPrice}
                className="h-5 w-5 shrink-0 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {item.quantity && item.quantity > 1 && (
                  <Badge variant="outline" className="h-5 text-xs">
                    <Package className="h-3 w-3 mr-1" />
                    {item.quantity}
                  </Badge>
                )}
                {displayPrice && (
                  <Badge
                    variant={purchased ? "outline" : "default"}
                    className={`text-xs ${
                      purchased
                        ? "border-green-300/50 bg-green-50/50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                        : ""
                    }`}
                  >
                    {displayPrice}
                  </Badge>
                )}
              </div>
              {canEdit && (
                <div className="flex items-center gap-1">
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
                        className="h-7 w-7 text-muted-foreground"
                        aria-label="Editar artículo"
                      >
                        <Pencil className="h-3.5 w-3.5" />
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
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label="Eliminar artículo"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
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
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vista lista (por defecto)
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
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-active:scale-110 group-active:rotate-3 ${
                purchased
                  ? "bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-900/60 group-active:bg-green-200 dark:group-active:bg-green-900/60"
                  : "bg-muted group-hover:bg-primary/10 group-active:bg-primary/10"
              }`}
            >
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
                      <span>{isNew ? "Nuevo" : "Editado"}</span>
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
