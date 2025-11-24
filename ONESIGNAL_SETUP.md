# Configuración de OneSignal para Notificaciones Push

## ¿Por qué OneSignal?

OneSignal tiene mejor soporte para PWAs en iOS que Web Push nativo:
- ✅ Funciona mejor en iOS (incluyendo versiones anteriores a 16.4)
- ✅ Mejor soporte para PWAs
- ✅ Plan gratuito generoso (10,000 suscriptores)
- ✅ Dashboard para gestionar notificaciones
- ✅ Analytics y segmentación
- ✅ Fácil de integrar

## Pasos de Configuración

### 1. Crear Cuenta en OneSignal

1. Ve a https://onesignal.com
2. Crea una cuenta gratuita
3. Crea una nueva aplicación
4. Selecciona "Web Push" como plataforma

### 2. Configurar la Aplicación

1. En el dashboard de OneSignal, ve a Settings → Platforms → Web Push
2. Configura:
   - **Site Name**: Shop Trip
   - **Site URL**: https://shoptrip.app (o tu dominio)
   - **Default Notification Icon URL**: https://shoptrip.app/icon.svg
   - **Safari Web ID**: (opcional, para mejor soporte Safari)

### 3. Obtener Credenciales

1. Ve a Settings → Keys & IDs
2. Copia:
   - **App ID** (OneSignal App ID)
   - **REST API Key** (para enviar desde el servidor)

### 4. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# OneSignal Configuration
ONESIGNAL_APP_ID=tu-app-id-aqui
ONESIGNAL_API_KEY=tu-api-key-aqui
NEXT_PUBLIC_ONESIGNAL_APP_ID=tu-app-id-aqui
NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID=tu-safari-web-id-aqui (opcional)
```

**Importante:**
- `ONESIGNAL_APP_ID` y `ONESIGNAL_API_KEY` son para el servidor (envío de notificaciones)
- `NEXT_PUBLIC_ONESIGNAL_APP_ID` es para el cliente (registro de usuarios)
- `NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID` es opcional pero mejora soporte Safari

### 5. Desplegar Cambios

1. Haz commit de los cambios
2. Despliega a producción
3. Configura las variables de entorno en tu plataforma de hosting

## Verificación

### En el Cliente (Navegador):

1. Abre la app en tu navegador
2. Abre la consola (F12)
3. Busca logs:
   ```
   [OneSignal] Initialized successfully
   [OneSignal] Subscription changed: true
   [OneSignal] User ID: [user-id]
   ```

### En el Servidor:

Cuando se envía una notificación, deberías ver:
```
[OneSignal] Notification sent successfully: [message-id]
```

## Uso

El sistema ahora usa OneSignal automáticamente si está configurado, con fallback a Web Push si OneSignal no está disponible.

Las notificaciones se envían automáticamente cuando:
- Se crea un viaje
- Se crea un producto
- Se actualiza un producto
- Se marca un producto como comprado

## Troubleshooting

### OneSignal no se inicializa

- Verifica que `NEXT_PUBLIC_ONESIGNAL_APP_ID` esté configurado
- Verifica que el script de OneSignal se cargue correctamente
- Revisa la consola para errores

### Las notificaciones no se envían

- Verifica que `ONESIGNAL_APP_ID` y `ONESIGNAL_API_KEY` estén configurados
- Verifica que los usuarios estén registrados (ver logs del cliente)
- Revisa los logs del servidor para errores

### No funciona en iOS

- Asegúrate de que la app esté instalada como PWA
- Verifica permisos de notificaciones
- OneSignal debería funcionar mejor que Web Push nativo en iOS

## Plan Gratuito

OneSignal ofrece:
- ✅ 10,000 suscriptores gratuitos
- ✅ Notificaciones ilimitadas
- ✅ Todas las características básicas

Suficiente para la mayoría de aplicaciones pequeñas/medianas.

