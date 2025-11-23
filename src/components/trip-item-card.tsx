"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, DollarSign, Package } from "lucide-react";
import { getItemIcon } from "@/lib/item-icons";
import { toggleItemPurchasedAction } from "@/actions/trip-items";

function formatCurrency(amount: number | null): string {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

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
  const [purchased, setPurchased] = useState(item.purchased);
  const ItemIcon = getItemIcon(item.name);

  const handleToggle = (checked: boolean) => {
    if (!canEdit) return;
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

  const totalPrice = item.price && item.quantity 
    ? item.price * item.quantity 
    : item.price;

  return (
    <Card
      className={`group relative overflow-hidden border transition-all duration-300 ${
        purchased
          ? "bg-gradient-to-r from-green-50/60 via-green-50/30 to-background dark:from-green-950/30 dark:via-green-950/15 dark:to-background border-green-200/60 dark:border-green-800/50"
          : "bg-card hover:shadow-xl hover:border-primary/60 hover:-translate-y-0.5"
      }`}
    >
      {/* Efecto de brillo sutil */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
        purchased ? "via-green-100/10" : "via-primary/5"
      }`} />
      
      <CardContent className="p-4 relative z-10">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="pt-1 shrink-0 relative z-20">
            <Checkbox
              checked={purchased}
              onCheckedChange={handleToggle}
              disabled={isPending || !canEdit}
              className="h-5 w-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 relative z-20"
            />
          </div>

          {/* Icono con efecto */}
          <div className="relative shrink-0">
            <div className={`absolute -inset-1 rounded-xl blur-lg transition-opacity duration-300 ${
              purchased 
                ? "bg-green-400/30 opacity-100" 
                : "bg-primary/20 opacity-0 group-hover:opacity-100"
            }`} />
            <div
              className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                purchased
                  ? "bg-gradient-to-br from-green-500/20 to-green-400/10 dark:from-green-500/30 dark:to-green-600/20 shadow-lg shadow-green-500/20"
                  : "bg-gradient-to-br from-primary/15 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 shadow-md shadow-primary/10"
              }`}
            >
              <ItemIcon
                className={`h-5 w-5 transition-all duration-300 ${
                  purchased
                    ? "text-green-700 dark:text-green-300 scale-110"
                    : "text-primary group-hover:scale-110"
                }`}
              />
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
              {purchased && (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              )}
            </div>

            {/* Metadata inferior */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {item.quantity && item.quantity > 1 && (
                  <Badge variant="outline" className="gap-1 px-2 py-0.5 text-xs border-muted-foreground/20">
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
                      {formatCurrency(totalPrice)}
                      {item.quantity && item.quantity > 1 && item.price && (
                        <span className="ml-1.5 text-[10px] opacity-70 font-normal">
                          · {formatCurrency(item.price)} c/u
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
                      <AvatarImage src={item.purchasedByImage} alt={item.purchasedByName} />
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
  );
}

