# Configuración de OneSignal según el artículo de Medium

Este documento sigue los pasos del artículo:
https://medium.com/@OneSignalDevs/web-push-notifications-are-a-versatile-channel-that-can-be-used-to-enhance-your-ux-re-engage-2d00c8bf1535

## Pasos de Configuración

### 1. Descargar el SDK de OneSignal

1. Ve a https://documentation.onesignal.com/docs/web-push-sdk-setup
2. Descarga el SDK de OneSignal para Web Push
3. Descomprime el archivo
4. Copia todos los archivos JavaScript de `OneSignal-Web-SDK/` a `public/` en tu proyecto

**Archivos necesarios:**
- `OneSignalSDK.js` → `public/OneSignalSDK.js`
- `OneSignalSDKWorker.js` → `public/OneSignalSDKWorker.js`
- `OneSignalSDKUpdaterWorker.js` → `public/OneSignalSDKUpdaterWorker.js`

### 2. Configurar OneSignal en el Dashboard

1. Ve a https://onesignal.com y crea una cuenta (gratis)
2. Crea una nueva aplicación seleccionando "Web Push"
3. En la configuración:
   - Selecciona "Custom Code" como método de integración
   - Configura el Site URL (ej: `https://shoptrip.app` o `http://localhost:3000` para desarrollo)
   - Guarda la configuración
4. Copia el `appId` que aparece en el segundo script de la página final

### 3. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# OneSignal Configuration
NEXT_PUBLIC_ONESIGNAL_APP_ID=tu-app-id-aqui
ONESIGNAL_APP_ID=tu-app-id-aqui
ONESIGNAL_API_KEY=tu-api-key-aqui
```

**Para obtener las credenciales:**
- `NEXT_PUBLIC_ONESIGNAL_APP_ID`: Aparece en el script de inicialización del dashboard
- `ONESIGNAL_APP_ID`: Mismo que arriba
- `ONESIGNAL_API_KEY`: Ve a Settings → Keys & IDs → REST API Key

### 4. Verificar la Implementación

El código ya está implementado según el artículo:

1. **Script del SDK**: Agregado en `src/app/layout.tsx`
2. **Inicialización**: Implementada en `src/components/onesignal-registration.tsx`
3. **Service Worker**: Configurado en `public/OneSignalSDKWorker.js`

### 5. Probar la Integración

1. Inicia el servidor de desarrollo: `npm run dev`
2. Abre la app en tu navegador
3. Deberías ver un botón circular rojo con una campana en la esquina inferior derecha
4. Haz clic en el botón para suscribirte a las notificaciones
5. Acepta los permisos cuando el navegador lo solicite

### 6. Enviar Notificaciones

#### Desde el Dashboard de OneSignal:
1. Ve a Messages → New Push
2. Crea tu mensaje
3. Selecciona "Send to All Users" o segmenta por audiencia
4. Envía la notificación

#### Desde el código:
Las notificaciones se envían automáticamente cuando:
- Se crea un viaje (`notifyTripCreated`)
- Se crea un producto (`notifyItemCreated`)
- Se actualiza un viaje (`notifyTripUpdated`)
- Se marca un producto como comprado (`notifyItemPurchased`)

## Verificación

### En el Dashboard de OneSignal:
1. Ve a Audience → All Users
2. Deberías ver tu suscripción después de aceptar los permisos

### En la Consola del Navegador:
Deberías ver:
```
[OneSignal] Initialized
```

## Solución de Problemas

### El botón de OneSignal no aparece:
- Verifica que `OneSignalSDK.js` esté en `public/`
- Verifica que el script esté cargándose (DevTools → Network)
- Verifica que `NEXT_PUBLIC_ONESIGNAL_APP_ID` esté configurado

### Las notificaciones no llegan:
- Verifica que hayas aceptado los permisos de notificaciones
- Verifica que estés suscrito (botón debe mostrar estado "subscribed")
- Verifica los logs del servidor al enviar notificaciones
- Verifica que el User ID esté registrado en la base de datos

### Error 404 en Service Worker:
- Verifica que `OneSignalSDKWorker.js` esté en `public/`
- Verifica que el archivo sea accesible en `https://tudominio.com/OneSignalSDKWorker.js`

## Recursos

- [Artículo Original](https://medium.com/@OneSignalDevs/web-push-notifications-are-a-versatile-channel-that-can-be-used-to-enhance-your-ux-re-engage-2d00c8bf1535)
- [Documentación de OneSignal](https://documentation.onesignal.com/docs/web-push-sdk-setup)
- [Dashboard de OneSignal](https://onesignal.com)
