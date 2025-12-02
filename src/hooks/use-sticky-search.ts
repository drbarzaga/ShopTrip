"use client";

import { useEffect, useState, useRef } from "react";

export function useStickySearch(searchElementId: string) {
  const [isStickyVisible, setIsStickyVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Solo ejecutar en cliente y desktop
    if (typeof window === "undefined") return;

    const searchElement = document.getElementById(searchElementId);
    if (!searchElement) return;

    // Crear observer para detectar cuando el elemento sale de la vista
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Si el elemento no está visible (sale de la parte superior), mostrar sticky
        setIsStickyVisible(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "-80px 0px 0px 0px", // Trigger cuando el elemento está 80px desde arriba
        threshold: 0,
      }
    );

    observerRef.current.observe(searchElement);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [searchElementId]);

  return isStickyVisible;
}

