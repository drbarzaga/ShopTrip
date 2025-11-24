# 🔍 Diagnóstico de OneSignal

## Pasos para Diagnosticar Problemas

### 1. Verificar Variables de Entorno

Abre tu archivo `.env` y verifica que tengas:

```env
NEXT_PUBLIC_ONESIGNAL_APP_ID=tu-app-id-aqui
ONESIGNAL_APP_ID=tu-app-id-aqui
ONESIGNAL_API_KEY=tu-api-key-aqui
```

**Importante:**
- `NEXT_PUBLIC_ONESIGNAL_APP_ID` debe estar configurado (se usa en el cliente)
- `ONESIGNAL_APP_ID` y `ONESIGNAL_API_KEY` deben estar configurados (se usan en el servidor)
- Reinicia el servidor de desarrollo después de cambiar `.env`

### 2. Verificar en la Consola del Navegador

Abre la consola del navegador (F12) y busca estos mensajes:

#### ✅ Si está funcionando correctamente:
```
[OneSignal] 🚀 Starting initialization with App ID: ...
[OneSignal] 📦 Loading SDK...
[OneSignal] ✅ SDK object available
[OneSignal] 🔧 Initializing SDK...
[OneSignal] ✅ SDK initialized successfully
[OneSignal] 📱 Push notifications enabled: true/false
[OneSignal] 👤 User ID: ...
[OneSignal] ✅ User ID registered successfully on server
```

#### ❌ Si hay problemas:

**Error: "App ID not configured"**
- Verifica que `NEXT_PUBLIC_ONESIGNAL_APP_ID` esté en `.env`
- Reinicia el servidor de desarrollo

**Error: "Failed to load SDK script"**
- Verifica tu conexión a internet
- Verifica que no haya bloqueadores de anuncios activos
- Intenta en modo incógnito

**Error: "OneSignal SDK timeout"**
- El SDK está tardando demasiado en cargar
- Verifica la consola para otros errores
- Intenta recargar la página

**Error: "isPushNotificationsEnabled is not a function"**
- El SDK no se cargó correctamente
- Recarga la página completamente (Ctrl+Shift+R)

**Error: "Cannot read properties of undefined (reading 'on')"**
- El SDK aún no está listo
- Espera unos segundos y recarga

### 3. Verificar en OneSignal Dashboard

1. Ve a https://onesignal.com y entra a tu cuenta
2. Selecciona tu aplicación
3. Ve a **Settings** → **Platforms** → **Web Push**
4. Verifica que:
   - **Site URL** coincida con tu dominio (ej: `https://shoptrip.app`)
   - **Default Notification Icon URL** esté configurado
   - La configuración esté guardada

### 4. Verificar Registro de Usuario

1. Abre la consola del navegador
2. Busca el mensaje: `[OneSignal] 👤 User ID: ...`
3. Copia el User ID
4. Ve a OneSignal Dashboard → **Audience** → **All Users**
5. Busca el User ID - debería aparecer si el registro fue exitoso

### 5. Probar Envío de Notificación

#### Desde el código:
```bash
# En la terminal del servidor, busca logs como:
[OneSignal] Found X OneSignal player IDs for Y users
[OneSignal] Sending notification to X players
[OneSignal] Notification sent successfully: ...
```

#### Desde el endpoint de prueba:
1. Abre: `https://shoptrip.app/api/push/test?userId=TU_USER_ID`
2. Deberías recibir una notificación de prueba

### 6. Verificar Service Worker

1. Abre DevTools → **Application** → **Service Workers**
2. Deberías ver:
   - `OneSignalSDKWorker.js` activo
   - Estado: "activated and is running"

Si no aparece:
- Verifica que `public/OneSignalSDKWorker.js` exista
- Recarga la página
- Verifica la consola para errores del Service Worker

### 7. Verificar Permisos de Notificaciones

1. Abre DevTools → **Application** → **Notifications**
2. Verifica que el estado sea "granted" o "prompt"
3. Si es "denied", el usuario bloqueó las notificaciones
4. Para resetear en Chrome:
   - Ve a `chrome://settings/content/notifications`
   - Busca tu sitio y elimínalo
   - Recarga la página

### 8. Verificar en iPhone/iOS

1. Abre la app en Safari
2. Verifica que esté instalada como PWA (desde el menú Compartir)
3. Abre la app PWA
4. Verifica los permisos de notificaciones en Configuración → Safari → Notificaciones
5. La app debe estar en la lista y permitida

## Problemas Comunes y Soluciones

### Problema: "No OneSignal player IDs found"
**Causa:** El usuario no ha otorgado permisos o el registro falló
**Solución:**
1. Verifica que el usuario haya otorgado permisos de notificaciones
2. Verifica los logs en la consola del navegador
3. Intenta recargar la página y otorgar permisos nuevamente

### Problema: "OneSignal not configured"
**Causa:** Variables de entorno no configuradas
**Solución:**
1. Verifica `.env` tiene todas las variables necesarias
2. Reinicia el servidor de desarrollo
3. En producción, verifica que las variables estén configuradas en tu plataforma de hosting

### Problema: Notificaciones no llegan
**Causa:** Varias posibles
**Solución:**
1. Verifica que el User ID esté registrado en OneSignal Dashboard
2. Verifica que las notificaciones estén habilitadas (`isPushNotificationsEnabled: true`)
3. Verifica los logs del servidor al enviar notificaciones
4. Prueba enviar una notificación manual desde OneSignal Dashboard

### Problema: Service Worker 404
**Causa:** El archivo `OneSignalSDKWorker.js` no está accesible
**Solución:**
1. Verifica que `public/OneSignalSDKWorker.js` exista
2. Verifica que el servidor esté sirviendo archivos estáticos correctamente
3. Intenta acceder directamente a: `https://shoptrip.app/OneSignalSDKWorker.js`

## Comandos Útiles para Debugging

### En la consola del navegador:
```javascript
// Verificar si OneSignal está cargado
console.log(window.OneSignal);

// Verificar User ID
window.OneSignal.push(function() {
  window.OneSignal.getUserId().then(id => console.log("User ID:", id));
});

// Verificar estado de notificaciones
window.OneSignal.push(function() {
  window.OneSignal.isPushNotificationsEnabled().then(enabled => console.log("Enabled:", enabled));
});

// Solicitar permisos manualmente
window.OneSignal.push(function() {
  window.OneSignal.registerForPushNotifications();
});
```

## Siguiente Paso

Si después de seguir estos pasos OneSignal sigue sin funcionar:

1. Comparte los logs de la consola del navegador
2. Comparte los logs del servidor
3. Verifica que tu cuenta de OneSignal esté activa
4. Verifica que no hayas excedido los límites del plan gratuito

