# Configuración de Notificaciones Push

Este proyecto usa **Web Push API** con **VAPID keys** para enviar notificaciones push que funcionan incluso cuando la app está cerrada, incluyendo en iPhone (iOS 16.4+).

## Características

- ✅ Notificaciones en tiempo real cuando la app está abierta (SSE)
- ✅ Notificaciones push cuando la app está cerrada (Web Push API)
- ✅ Funciona en iPhone/iOS (iOS 16.4+)
- ✅ Funciona en Android
- ✅ Funciona en Desktop (Chrome, Firefox, Edge, Safari)
- ✅ Completamente gratis

## Configuración

### 1. Generar VAPID Keys

Ejecuta el script para generar las VAPID keys:

```bash
node scripts/generate-vapid-keys.js
```

Esto generará una clave pública y una privada.

### 2. Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# VAPID Keys para Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=tu_clave_publica_aqui
VAPID_PRIVATE_KEY=tu_clave_privada_aqui
VAPID_EMAIL=mailto:tu-email@ejemplo.com
```

**Importante:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` debe empezar con `NEXT_PUBLIC_` para estar disponible en el cliente
- `VAPID_PRIVATE_KEY` debe mantenerse secreta (solo en el servidor)
- `VAPID_EMAIL` debe ser un email válido con formato `mailto:email@ejemplo.com`

### 3. Crear la Tabla en la Base de Datos

Ejecuta la migración para crear la tabla de tokens:

```bash
npx tsx src/db/migrations/add-fcm-tokens.ts
```

O manualmente ejecuta este SQL:

```sql
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_info TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS fcm_tokens_user_id_idx ON fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS fcm_tokens_token_idx ON fcm_tokens(token);
```

### 4. Verificar el Service Worker

Asegúrate de que el archivo `public/sw.js` existe y está correctamente configurado. Este archivo maneja las notificaciones cuando la app está cerrada.

## Cómo Funciona

### Cuando la App Está Abierta

1. El usuario se conecta automáticamente al stream SSE (`/api/notifications/stream`)
2. Las notificaciones llegan en tiempo real y se muestran como toasts
3. Si el usuario tiene permisos, también se muestran notificaciones del navegador

### Cuando la App Está Cerrada

1. El Service Worker registra una suscripción push cuando el usuario otorga permisos
2. La suscripción se guarda en la base de datos asociada al usuario
3. Cuando ocurre un evento (crear viaje, producto, etc.), se envía una notificación push
4. El Service Worker recibe la notificación y la muestra al usuario
5. Al hacer clic en la notificación, se abre la app

## Eventos que Generan Notificaciones

- ✅ Crear viaje → Notifica a todos los miembros de la organización
- ✅ Actualizar viaje → Notifica a todos los miembros
- ✅ Crear producto → Notifica a todos los miembros
- ✅ Actualizar producto → Notifica a todos los miembros
- ✅ Marcar producto como comprado → Notifica a todos los miembros

## Permisos del Usuario

Los usuarios pueden activar las notificaciones push haciendo clic en el botón de campana (🔔) en el header. Esto:

1. Solicita permiso al navegador
2. Registra el Service Worker
3. Crea una suscripción push
4. Envía la suscripción al servidor para guardarla

## Troubleshooting

### Las notificaciones no llegan cuando la app está cerrada

1. Verifica que las VAPID keys estén configuradas correctamente
2. Verifica que el Service Worker esté registrado (consola del navegador)
3. Verifica que el usuario haya otorgado permisos de notificaciones
4. Verifica que la suscripción se haya guardado en la base de datos

### Error: "VAPID public key not configured"

Asegúrate de que `NEXT_PUBLIC_VAPID_PUBLIC_KEY` esté en tu archivo `.env` y que hayas reiniciado el servidor de desarrollo.

### Las notificaciones no funcionan en iOS

- Requiere iOS 16.4 o superior
- La app debe estar instalada como PWA (agregada a la pantalla de inicio)
- El usuario debe otorgar permisos de notificaciones

## Recursos

- [Web Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

