/**
 * Sistema de eventos global para notificaciones en tiempo real
 * Usa un patrón de EventEmitter simple para notificaciones SSE
 */

type NotificationData = {
  type: string;
  title: string;
  message: string;
  tripId?: string;
  itemId?: string;
  userId?: string;
};

type NotificationHandler = (data: NotificationData) => void;

class NotificationEventEmitter {
  private handlers: Map<string, Set<NotificationHandler>> = new Map();

  /**
   * Suscribirse a notificaciones para un usuario específico
   */
  subscribe(userId: string, handler: NotificationHandler): () => void {
    if (!this.handlers.has(userId)) {
      this.handlers.set(userId, new Set());
    }
    this.handlers.get(userId)!.add(handler);

    // Retornar función para desuscribirse
    return () => {
      const userHandlers = this.handlers.get(userId);
      if (userHandlers) {
        userHandlers.delete(handler);
        if (userHandlers.size === 0) {
          this.handlers.delete(userId);
        }
      }
    };
  }

  /**
   * Emitir una notificación a usuarios específicos
   */
  emit(userIds: string[], data: NotificationData): void {
    for (const userId of userIds) {
      const handlers = this.handlers.get(userId);
      if (handlers) {
        handlers.forEach((handler) => {
          try {
            handler(data);
          } catch (error) {
            console.error(`Error in notification handler for user ${userId}:`, error);
          }
        });
      }
    }
  }

  /**
   * Emitir una notificación a todos los usuarios conectados
   */
  emitToAll(data: NotificationData): void {
    this.handlers.forEach((handlers) => {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error("Error in notification handler:", error);
        }
      });
    });
  }
}

// Instancia global del emisor de eventos
export const notificationEmitter = new NotificationEventEmitter();

