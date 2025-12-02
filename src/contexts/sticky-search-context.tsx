"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface StickySearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isStickyVisible: boolean;
  setIsStickyVisible: (visible: boolean) => void;
  itemsCount: number;
  setItemsCount: (count: number) => void;
}

const StickySearchContext = createContext<StickySearchContextType | undefined>(
  undefined
);

export function StickySearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const [itemsCount, setItemsCount] = useState(0);

  return (
    <StickySearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        isStickyVisible,
        setIsStickyVisible,
        itemsCount,
        setItemsCount,
      }}
    >
      {children}
    </StickySearchContext.Provider>
  );
}

export function useStickySearchContext() {
  const context = useContext(StickySearchContext);
  if (context === undefined) {
    return null;
  }
  return context;
}

