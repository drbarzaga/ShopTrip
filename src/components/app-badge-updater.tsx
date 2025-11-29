"use client";

import { useNotifications } from "@/hooks/use-notifications";
import { useAppBadge } from "@/hooks/use-app-badge";

/**
 * Componente que actualiza el badge del icono de la aplicación
 * basado en el número de notificaciones no leídas
 */
export function AppBadgeUpdater() {
  const { unreadCount } = useNotifications();
  
  // Actualizar el badge cuando cambie el contador
  useAppBadge(unreadCount);

  // Este componente no renderiza nada, solo actualiza el badge
  return null;
}

