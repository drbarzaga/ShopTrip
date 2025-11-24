"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TripItemCard } from "@/components/trip-item-card";

interface Item {
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
}

interface ItemsListProps {
  items: Item[];
  canEdit?: boolean;
}

export function ItemsList({ items, canEdit = true }: ItemsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase().trim();
    return items.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const descriptionMatch = item.description?.toLowerCase().includes(query);
      return nameMatch || descriptionMatch;
    });
  }, [items, searchQuery]);

  return (
    <div className="space-y-3">
      {/* Buscador */}
      {items.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar artículos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchQuery("")}
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Lista de items */}
      {filteredItems.length === 0 ? (
        <Card className="border border-dashed">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="bg-muted/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold mb-1">
              {searchQuery ? "No se encontraron resultados" : "No hay artículos"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? `No hay artículos que coincidan con "${searchQuery}". Intenta con otros términos.`
                : "Comienza agregando tu primer artículo a la lista."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <TripItemCard key={item.id} item={item} canEdit={canEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

