"use client";

import { useState, useEffect } from "react";
import { ItemsList } from "@/components/items-list";
import { useStickySearch } from "@/hooks/use-sticky-search";
import { StickySearchProvider, useStickySearchContext } from "@/contexts/sticky-search-context";
import type { ViewMode } from "@/components/view-selector";

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
  formattedPrice?: string;
  formattedUnitPrice?: string;
}

interface TripItemsWrapperProps {
  items: Item[];
  tripId?: string;
  canEdit?: boolean;
}

const VIEW_STORAGE_KEY = "trip-items-view-mode";
const SEARCH_INPUT_ID = "trip-items-search";

function TripItemsWrapperContent({
  items,
  tripId,
  canEdit = true,
}: TripItemsWrapperProps) {
  const context = useStickySearchContext();
  const [view, setView] = useState<ViewMode>("list");
  const isStickyVisible = useStickySearch(SEARCH_INPUT_ID);

  // Sincronizar estado sticky visible y items count con el contexto
  useEffect(() => {
    if (context) {
      context.setIsStickyVisible(isStickyVisible);
      context.setItemsCount(items.length);
    }
  }, [isStickyVisible, items.length, context]);

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

  if (!context) return null;

  return (
    <>
      {/* Items List con estado compartido */}
      <ItemsList
        items={items}
        tripId={tripId}
        canEdit={canEdit}
        view={view}
        onViewChange={handleViewChange}
        searchQuery={context.searchQuery}
        onSearchChange={context.setSearchQuery}
        searchInputId={SEARCH_INPUT_ID}
      />
    </>
  );
}

export function TripItemsWrapper(props: TripItemsWrapperProps) {
  return (
    <StickySearchProvider>
      <TripItemsWrapperContent {...props} />
    </StickySearchProvider>
  );
}

