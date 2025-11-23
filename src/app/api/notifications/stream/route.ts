import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth-server";
import { notificationEmitter } from "@/lib/notifications-events";

// Almacenar conexiones SSE activas
const connections = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;

  // Crear stream SSE
  const stream = new ReadableStream({
    start(controller) {
      // Guardar la conexión
      connections.set(userId, controller);

      // Enviar mensaje inicial de conexión
      const data = JSON.stringify({
        type: "connected",
        message: "Conectado a notificaciones en tiempo real",
      });
      controller.enqueue(`data: ${data}\n\n`);

      // Suscribirse a notificaciones para este usuario
      const unsubscribe = notificationEmitter.subscribe(userId, (notificationData) => {
        try {
          const data = JSON.stringify(notificationData);
          controller.enqueue(`data: ${data}\n\n`);
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      });

      // Limpiar cuando se cierra la conexión
      request.signal.addEventListener("abort", () => {
        unsubscribe();
        connections.delete(userId);
        try {
          controller.close();
        } catch (error) {
          // Ignorar errores al cerrar
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * Función helper para enviar notificaciones a usuarios específicos
 */
export async function sendNotificationToUsers(
  userIds: string[],
  notification: {
    type: string;
    title: string;
    message: string;
    tripId?: string;
    itemId?: string;
  }
): Promise<void> {
  // Emitir a través del event emitter
  notificationEmitter.emit(userIds, notification);
}

