"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TripItemCard } from "@/components/trip-item-card";
import { ViewSelector, type ViewMode } from "@/components/view-selector";
import { cn } from "@/lib/utils";

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
  tripId?: string;
  canEdit?: boolean;
  view?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchInputId?: string;
}

const VIEW_STORAGE_KEY = "trip-items-view-mode";

export function ItemsList({ 
  items, 
  tripId, 
  canEdit = true,
  view: externalView,
  onViewChange: externalOnViewChange,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  searchInputId = "trip-items-search",
}: ItemsListProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalView, setInternalView] = useState<ViewMode>("list");
  
  // Usar estado externo si se proporciona, sino usar interno
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const view = externalView ?? internalView;
  
  const setSearchQuery = externalOnSearchChange ?? setInternalSearchQuery;
  const setView = externalOnViewChange ?? setInternalView;

  // Cargar preferencia de vista desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem(VIEW_STORAGE_KEY) as ViewMode;
      if (savedView && ["list", "grid", "compact", "cards"].includes(savedView)) {
        setView(savedView);
      }
    }
  }, []);

  // Guardar preferencia de vista en localStorage
  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_STORAGE_KEY, newView);
    }
  };

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
        <div id={searchInputId} className="relative">
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
      
      {/* Selector de vista - siempre visible cuando hay items */}
      {items.length > 0 && (
        <div className="flex items-center gap-3 py-2 px-1">
          <span className="text-sm font-medium text-foreground whitespace-nowrap">Vista:</span>
          <ViewSelector view={view} onViewChange={handleViewChange} />
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
        <div
          className={cn(
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              : view === "cards"
                ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                : view === "compact"
                  ? "space-y-1.5"
                  : "space-y-2"
          )}
        >
          {filteredItems.map((item) => (
            <TripItemCard
              key={item.id}
              item={item}
              tripId={tripId}
              canEdit={canEdit}
              view={view}
            />
          ))}
        </div>
      )}
    </div>
  );
}

