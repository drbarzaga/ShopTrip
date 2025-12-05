"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TripItemCard } from "@/components/trip-item-card";
import { ViewSelector, type ViewMode } from "@/components/view-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  const [selectedUserId, setSelectedUserId] = useState<string>("all");

  // Usar estado externo si se proporciona, sino usar interno
  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const view = externalView ?? internalView;

  const setSearchQuery = externalOnSearchChange ?? setInternalSearchQuery;
  const setView = externalOnViewChange ?? setInternalView;

  // Extraer usuarios únicos que han comprado productos
  const usersWhoPurchased = useMemo(() => {
    const userMap = new Map<
      string,
      { id: string; name: string | null; image: string | null }
    >();

    items.forEach((item) => {
      if (item.purchased && item.purchasedBy && item.purchasedByName) {
        if (!userMap.has(item.purchasedBy)) {
          userMap.set(item.purchasedBy, {
            id: item.purchasedBy,
            name: item.purchasedByName,
            image: item.purchasedByImage,
          });
        }
      }
    });

    return Array.from(userMap.values()).sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
  }, [items]);

  // Cargar preferencia de vista desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem(VIEW_STORAGE_KEY) as ViewMode;
      if (
        savedView &&
        ["list", "grid", "compact", "cards"].includes(savedView)
      ) {
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
    let filtered = items;

    // Filtrar por usuario comprador
    if (selectedUserId !== "all") {
      filtered = filtered.filter((item) => item.purchasedBy === selectedUserId);
    }

    // Filtrar por búsqueda de texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const descriptionMatch = item.description
          ?.toLowerCase()
          .includes(query);
        return nameMatch || descriptionMatch;
      });
    }

    return filtered;
  }, [items, searchQuery, selectedUserId]);

  function getInitials(name: string | null | undefined): string {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  return (
    <div className="space-y-3">
      {/* Buscador y Filtros */}
      {items.length > 0 && (
        <div className="space-y-3">
          {/* Buscador */}
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

          {/* Filtros: Usuario y Vista */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Filtro por usuario comprador */}
            {usersWhoPurchased.length > 0 && (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground whitespace-nowrap shrink-0 hidden sm:inline">
                  Comprado por:
                </span>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-9">
                    <div className="flex items-center justify-between w-full gap-2">
                      <SelectValue placeholder="Todos" />
                      {selectedUserId === "all" ? (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-xs font-medium shrink-0 sm:hidden"
                        >
                          {items.length}{" "}
                          {items.length === 1 ? "producto" : "productos"}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-xs font-medium shrink-0 sm:hidden"
                        >
                          {filteredItems.length}{" "}
                          {filteredItems.length === 1
                            ? "producto"
                            : "productos"}
                        </Badge>
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    {usersWhoPurchased.map((user) => {
                      const userItemsCount = items.filter(
                        (item) => item.purchasedBy === user.id
                      ).length;
                      return (
                        <SelectItem key={user.id} value={user.id}>
                          <span className="sr-only">
                            {user.name || "Usuario sin nombre"}
                          </span>
                          {user.name || "Usuario sin nombre"}
                          <div className="hidden [.radix-select-content_&]:flex items-center justify-between w-full gap-2 pointer-events-none">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Avatar className="h-5 w-5 shrink-0">
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate">
                                {user.name || "Usuario sin nombre"}
                              </span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="ml-2 h-5 px-1.5 text-xs font-medium shrink-0"
                            >
                              {userItemsCount}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {selectedUserId === "all" ? (
                  <Badge
                    variant="secondary"
                    className="h-7 px-2 text-xs font-medium shrink-0 hidden sm:inline-flex"
                  >
                    {items.length}{" "}
                    {items.length === 1 ? "producto" : "productos"}
                  </Badge>
                ) : (
                  <>
                    <span className="text-sm text-muted-foreground whitespace-nowrap shrink-0 hidden sm:inline">
                      {filteredItems.length}{" "}
                      {filteredItems.length === 1 ? "producto" : "productos"}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => setSelectedUserId("all")}
                      aria-label="Limpiar filtro de usuario"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Selector de vista */}
            <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
              <span className="text-sm font-medium text-foreground whitespace-nowrap shrink-0">
                Vista:
              </span>
              <ViewSelector
                view={view}
                onViewChange={handleViewChange}
                className="flex-1 sm:flex-initial"
              />
            </div>
          </div>
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
              {searchQuery || selectedUserId !== "all"
                ? "No se encontraron resultados"
                : "No hay artículos"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedUserId !== "all"
                ? `No hay artículos que coincidan con los filtros seleccionados. Intenta con otros términos o cambia el filtro de usuario.`
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
