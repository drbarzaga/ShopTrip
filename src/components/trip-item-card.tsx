"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  };
}

export function TripItemCard({ item }: TripItemCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [purchased, setPurchased] = useState(item.purchased);
  const ItemIcon = getItemIcon(item.name);

  const handleToggle = (checked: boolean) => {
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

  return (
    <Card
      className={`border transition-all ${
        purchased
          ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800 opacity-75"
          : "hover:bg-accent/50"
      }`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox y Icono */}
          <div className="flex items-start gap-2.5 pt-0.5 shrink-0">
            <Checkbox
              checked={purchased}
              onCheckedChange={handleToggle}
              disabled={isPending}
              className="mt-1 h-5 w-5"
            />
            <div
              className={`p-2.5 rounded-lg transition-colors shrink-0 ${
                purchased
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-primary/10"
              }`}
            >
              <ItemIcon
                className={`h-5 w-5 ${
                  purchased
                    ? "text-green-600 dark:text-green-400"
                    : "text-primary"
                }`}
              />
            </div>
          </div>

          {/* Contenido del Item */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={`font-semibold text-sm sm:text-base ${
                  purchased ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.name}
              </h3>
              {purchased && (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              )}
            </div>

            {item.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mb-2.5">
                {item.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {item.quantity && item.quantity > 1 && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-muted-foreground">
                  <Package className="h-3 w-3 shrink-0" />
                  <span className="font-medium">{item.quantity}</span>
                </div>
              )}
              {item.price && (
                <>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    <DollarSign className="h-3 w-3 shrink-0" />
                    <span>{formatCurrency(item.price)}</span>
                    {item.quantity && item.quantity > 1 && (
                      <span className="text-muted-foreground/70">
                        × {item.quantity}
                      </span>
                    )}
                  </div>
                  {item.quantity && item.quantity > 1 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold">
                      <DollarSign className="h-3 w-3 shrink-0" />
                      <span>
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

