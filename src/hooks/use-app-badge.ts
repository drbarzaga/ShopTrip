"use client";

import { useEffect } from "react";

/**
 * Hook para actualizar el badge del icono de la aplicación
 * Funciona en Android con Chrome y otros navegadores compatibles
 */
export function useAppBadge(count: number) {
  useEffect(() => {
    // Verificar si la API de Badging está disponible
    if (!("setAppBadge" in navigator)) {
      // La API no está disponible (iOS Safari no la soporta aún)
      return;
    }

    const updateBadge = async () => {
      try {
        if (count > 0) {
          // Establecer el badge con el número de notificaciones
          await (navigator as any).setAppBadge(count);
        } else {
          // Limpiar el badge si no hay notificaciones
          await (navigator as any).clearAppBadge();
        }
      } catch (error) {
        // Silenciar errores si la API no está disponible o falla
        console.debug("[App Badge] Error updating badge:", error);
      }
    };

    updateBadge();
  }, [count]);
}

