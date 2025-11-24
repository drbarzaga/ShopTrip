# 🚀 Guía Paso a Paso: Configurar OneSignal

## Paso 1: Crear Cuenta en OneSignal

1. Ve a https://onesignal.com
2. Haz clic en **"Sign Up Free"**
3. Crea tu cuenta (gratis)
4. Verifica tu email si es necesario

## Paso 2: Crear Nueva Aplicación

1. Una vez dentro del dashboard, haz clic en **"New App/Website"**
2. Selecciona **"Web Push"**
3. Completa el formulario:
   - **App Name**: Shop Trip
   - **Website URL**: https://shoptrip.app (o tu dominio)
   - Haz clic en **"Create App"**

## Paso 3: Configurar Web Push

1. En el dashboard, ve a **Settings** → **Platforms** → **Web Push**
2. Configura:
   - **Site Name**: Shop Trip
   - **Site URL**: https://shoptrip.app (debe coincidir con tu dominio)
   - **Default Notification Icon URL**: https://shoptrip.app/icon.svg
   - **Safari Web Push ID**: (opcional, para mejor soporte Safari)
3. Haz clic en **"Save"**

## Paso 4: Obtener Credenciales

1. Ve a **Settings** → **Keys & IDs**
2. Copia estos valores:
   - **OneSignal App ID** (algo como: `12345678-1234-1234-1234-123456789012`)
   - **REST API Key** (algo como: `ABCDEFGHIJKLMNOPQRSTUVWXYZ123456`)

## Paso 5: Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# OneSignal Configuration
ONESIGNAL_APP_ID=tu-app-id-aqui
ONESIGNAL_API_KEY=tu-rest-api-key-aqui
NEXT_PUBLIC_ONESIGNAL_APP_ID=tu-app-id-aqui
```

**Importante:**

- `ONESIGNAL_APP_ID` y `ONESIGNAL_API_KEY` son para el servidor (envío de notificaciones)
- `NEXT_PUBLIC_ONESIGNAL_APP_ID` es para el cliente (registro de usuarios)
- Ambos `ONESIGNAL_APP_ID` y `NEXT_PUBLIC_ONESIGNAL_APP_ID` deben tener el mismo valor

### Para Safari (Opcional pero recomendado):

1. En OneSignal, ve a **Settings** → **Platforms** → **Web Push**
2. Busca **"Safari Web Push ID"**
3. Si no lo tienes, OneSignal te dará instrucciones para obtenerlo
4. Agrega a `.env`:
   ```env
   NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID=tu-safari-web-id-aqui
   ```

## Paso 6: Desplegar Cambios

1. **Haz commit de los cambios:**

   ```bash
   git add .
   git commit -m "Migrate to OneSignal for push notifications"
   git push
   ```

2. **Configura las variables de entorno en producción:**
   - Ve a tu plataforma de hosting (Vercel, Railway, etc.)
   - Agrega las variables de entorno:
     - `ONESIGNAL_APP_ID`
     - `ONESIGNAL_API_KEY`
     - `NEXT_PUBLIC_ONESIGNAL_APP_ID`
     - `NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID` (opcional)

3. **Despliega la aplicación**

## Paso 7: Probar la Configuración

### En el Navegador (Desktop):

1. Abre tu app en el navegador
2. Abre la consola (F12)
3. Busca estos logs:

   ```
   [OneSignal] Starting initialization...
   [OneSignal] SDK loaded successfully
   [OneSignal] Initializing SDK with App ID: ...
   [OneSignal] ✅ Initialized successfully
   ```

4. **Otorga permisos de notificaciones** cuando se solicite
5. Deberías ver:
   ```
   [OneSignal] Subscription changed: true
   [OneSignal] User subscribed with ID: [user-id]
   [OneSignal] ✅ User ID registered successfully on server
   ```

### En iPhone:

1. Abre la app en Safari
2. Instala como PWA (Compartir → Agregar a pantalla de inicio)
3. Abre la app desde la pantalla de inicio
4. Otorga permisos de notificaciones cuando se solicite
5. Verifica los mismos logs en la consola (si puedes acceder)

## Paso 8: Probar Envío de Notificaciones

### Opción 1: Desde la API de Prueba

1. Abre la app en tu navegador/iPhone
2. Otorga permisos de notificaciones
3. Espera a ver el log: `[OneSignal] ✅ User ID registered successfully`
4. Desde otro dispositivo/navegador, ejecuta:
   ```
   GET https://shoptrip.app/api/push/test?userId=[tu-user-id]&title=Test&body=Test notification
   ```
5. Deberías recibir la notificación

### Opción 2: Crear un Producto

1. Abre la app en tu iPhone (PWA instalada)
2. Cierra completamente la app
3. Desde otro dispositivo, crea un producto en un viaje compartido
4. Deberías recibir la notificación en el iPhone

## Verificación en OneSignal Dashboard

1. Ve a **Audience** → **All Users**
2. Deberías ver usuarios registrados con sus player IDs
3. Ve a **Messages** → **History**
4. Deberías ver las notificaciones enviadas

## Troubleshooting

### "App ID not configured"

- Verifica que `NEXT_PUBLIC_ONESIGNAL_APP_ID` esté en `.env`
- Reinicia el servidor de desarrollo
- Verifica que esté configurado en producción

### "No OneSignal player IDs found"

- El usuario necesita abrir la app y otorgar permisos
- Verifica los logs del cliente para ver si OneSignal se inicializó
- Verifica que el usuario esté registrado en OneSignal Dashboard

### Las notificaciones no llegan

- Verifica que el usuario esté suscrito (OneSignal Dashboard → Audience)
- Verifica los logs del servidor cuando se envía una notificación
- Verifica que `ONESIGNAL_APP_ID` y `ONESIGNAL_API_KEY` estén correctos

### No funciona en iOS

- Asegúrate de que la app esté instalada como PWA desde Safari
- Verifica permisos de notificaciones
- OneSignal debería funcionar mejor que Web Push nativo

## ✅ Checklist Final

- [ ] Cuenta creada en OneSignal
- [ ] App creada en OneSignal (Web Push)
- [ ] Variables de entorno configuradas (`.env` y producción)
- [ ] App desplegada con las nuevas variables
- [ ] Usuario abrió la app y otorgó permisos
- [ ] Usuario aparece en OneSignal Dashboard → Audience
- [ ] Notificación de prueba enviada exitosamente
- [ ] Notificaciones funcionan cuando se crea un producto

## 📞 Soporte

Si algo no funciona:

1. Revisa los logs del servidor
2. Revisa los logs del cliente (consola del navegador)
3. Verifica OneSignal Dashboard → Messages → History
4. Verifica que las variables de entorno estén correctas
