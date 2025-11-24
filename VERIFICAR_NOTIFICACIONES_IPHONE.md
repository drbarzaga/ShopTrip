# 🔍 Verificar Notificaciones Push en iPhone

## Problema: Las notificaciones no llegan al iPhone

Sigue estos pasos para diagnosticar el problema:

## Paso 1: Verificar que el Token Está Registrado

### En el iPhone (Safari o PWA):

1. **Abre la app en tu iPhone**
2. **Abre la consola** (si puedes):
   - Conecta iPhone a Mac
   - Safari → Develop → [Tu iPhone] → [Tu app]
   - Abre la consola

3. **Busca estos logs:**
   ```
   [Push Client] ✅ Successfully registered push subscription
   [Push Client] ⚠️ iOS: Make sure the app is installed as PWA from Safari
   ```

### En el Servidor (logs de producción):

Busca logs que indiquen que el token se registró:
```
[FCM Register] Registering token for user [userId]
[FCM Register] Token created successfully
```

## Paso 2: Verificar que se Están Enviando Notificaciones

### Cuando creas un producto/viaje, busca en los logs del servidor:

```
[Notifications] notifyItemCreated called for trip [tripId]
[Notifications] Will notify X users: [userIds]
[Push] Attempting to send notification to X users
[Push] Found X tokens for X users
[Push] Sending to token: [token info]...
[Push] ✅ Successfully sent notification (iOS)
```

### Si ves errores:

```
[Push] ❌ Error sending notification (iOS): {
  statusCode: [número],
  message: [mensaje],
  endpoint: [endpoint]
}
```

**Códigos de error comunes:**
- `410` o `404`: Token inválido o expirado → Se elimina automáticamente
- `400`: Payload inválido
- `401`: Problema con VAPID keys
- `429`: Demasiadas solicitudes

## Paso 3: Verificar Requisitos de iOS

### ✅ Checklist de Requisitos:

- [ ] **iOS 16.4+** (requerido para Web Push en PWA)
  - Verifica: Configuración → General → Acerca de → Versión de software
  
- [ ] **App instalada como PWA desde Safari**
  - NO desde Chrome u otros navegadores
  - Debe estar instalada desde Safari usando "Agregar a pantalla de inicio"
  
- [ ] **App abre en modo standalone**
  - NO debe verse la barra de direcciones de Safari
  - Si ves la barra, no está instalada como PWA
  
- [ ] **Permisos de notificaciones otorgados**
  - Desde la PWA instalada, haz clic en el botón de campana 🔔
  - O verifica: Configuración → Safari → Sitios web → Notificaciones

- [ ] **VAPID keys configuradas**
  - Verifica que las variables de entorno estén configuradas en producción
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `VAPID_EMAIL`

## Paso 4: Verificar el Service Worker en iPhone

### Desde la PWA instalada:

1. **Abre la app desde la pantalla de inicio**
2. **Si puedes acceder a la consola** (conectando a Mac):
   - Busca logs del Service Worker:
   ```
   [SW] Push event received
   [SW] Parsed push data as JSON: {...}
   [SW] ✅ Notification shown successfully
   ```

3. **Si NO puedes acceder a la consola:**
   - Las notificaciones push solo funcionan cuando la app está **cerrada**
   - Prueba: Cierra completamente la app y luego crea un producto desde otro dispositivo

## Paso 5: Probar Manualmente

### Opción 1: Desde la API de prueba

1. **Abre la app en tu iPhone** (PWA instalada)
2. **Cierra completamente la app** (swipe up y cerrar)
3. **Desde otro dispositivo/navegador**, ejecuta:
   ```
   GET /api/push/test?userId=[tu-user-id]&title=Test&body=Test notification
   ```
4. **Verifica** si llega la notificación al iPhone

### Opción 2: Crear un producto

1. **Abre la app en tu iPhone** (PWA instalada)
2. **Cierra completamente la app**
3. **Desde otro dispositivo**, crea un producto en un viaje compartido
4. **Verifica** si llega la notificación

## Paso 6: Verificar Logs del Servidor

### Busca estos logs cuando se envía una notificación:

```
[Push] Attempting to send notification to 1 users
[Push] Notification: Nuevo producto agregado - Usuario agregó "Producto"
[Push] Found 1 tokens for 1 users
[FCM] Token 1: endpoint=https://[endpoint]...
[Push] Sending to token: [token]...
[Push] Endpoint: https://[endpoint]...
[Push] Detected iOS: true/false
[Push] ✅ Successfully sent notification (iOS)
[Push] Notification send complete: 1 successful, 0 failed
```

### Si hay errores, verás:

```
[Push] ❌ Error sending notification (iOS): {
  statusCode: 410,
  message: "Gone",
  endpoint: "https://..."
}
[Push] Removing invalid token (status: 410)
```

## Problemas Comunes y Soluciones

### Problema: "No tokens found for users"
**Causa:** El token no se registró correctamente
**Solución:**
1. Abre la app en iPhone
2. Verifica que veas el log `[Push Client] ✅ Successfully registered push subscription`
3. Si no aparece, verifica permisos y VAPID keys

### Problema: "Error 410 Gone"
**Causa:** Token expirado o inválido
**Solución:** El token se elimina automáticamente. Vuelve a abrir la app para registrarse nuevamente.

### Problema: "Error 401 Unauthorized"
**Causa:** VAPID keys incorrectas o no configuradas
**Solución:** Verifica que las VAPID keys estén correctamente configuradas en producción.

### Problema: Las notificaciones funcionan en desktop pero no en iPhone
**Causas posibles:**
1. App no instalada como PWA desde Safari
2. iOS < 16.4
3. Permisos no otorgados en la PWA
4. App abierta (las push solo funcionan cuando está cerrada)

**Solución:**
1. Desinstala la app si está instalada desde otro navegador
2. Instala desde Safari usando "Agregar a pantalla de inicio"
3. Verifica iOS 16.4+
4. Otorga permisos desde la PWA instalada
5. Cierra completamente la app antes de probar

## Debugging Avanzado

### Verificar tokens en la base de datos:

```sql
SELECT 
  id,
  user_id,
  device_info,
  created_at,
  updated_at
FROM fcm_tokens
WHERE user_id = '[tu-user-id]';
```

### Verificar el endpoint del token:

Los tokens de iOS deberían tener un endpoint que incluya `apple` o `safari`:
```json
{
  "endpoint": "https://[something].push.apple.com/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

## ✅ Checklist Final

Antes de reportar un problema, verifica:

- [ ] iOS 16.4+
- [ ] App instalada como PWA desde Safari
- [ ] App abre sin barra de Safari (modo standalone)
- [ ] Permisos otorgados desde la PWA
- [ ] VAPID keys configuradas en producción
- [ ] Token registrado (ver logs del servidor)
- [ ] App cerrada completamente al probar
- [ ] Logs del servidor muestran envío exitoso
- [ ] No hay errores 410/404 en los logs

## 📞 Información para Reportar

Si el problema persiste, comparte:

1. **Versión de iOS:** Configuración → General → Acerca de
2. **Cómo instalaste la app:** Safari, Chrome, etc.
3. **Logs del servidor** cuando se envía una notificación
4. **Logs del cliente** (si puedes acceder) cuando se registra el token
5. **Resultado de verificar tokens en BD:** ¿Hay tokens para tu usuario?
6. **Estado de permisos:** ¿Están otorgados?

