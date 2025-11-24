# 🔍 Diagnóstico de Notificaciones - Paso a Paso

## ⚠️ Problema: Las notificaciones no aparecen

Sigue estos pasos en orden para identificar el problema:

## Paso 1: Verificar Permisos

1. **Abre la consola del navegador** (F12 o Cmd+Option+I)
2. **Ejecuta este comando:**
   ```javascript
   Notification.permission
   ```
3. **Resultados posibles:**
   - `"granted"` ✅ → Los permisos están otorgados, continúa al Paso 2
   - `"default"` ⚠️ → Necesitas otorgar permisos:
     - Haz clic en el botón de campana 🔔 en el header de la app
     - O ejecuta: `Notification.requestPermission()`
   - `"denied"` ❌ → Los permisos están bloqueados:
     - Ve a Configuración del navegador → Privacidad → Notificaciones
     - Permite notificaciones para este sitio
     - Recarga la página

## Paso 2: Verificar Service Worker

1. **Abre DevTools → Application → Service Workers**
2. **Verifica:**
   - ✅ Estado: "activated and is running"
   - ✅ Archivo: `/sw.js`
   - ✅ Scope: `/`
3. **Si NO está activo:**
   - Haz clic en "Unregister"
   - Recarga la página
   - Verifica que se registre nuevamente

## Paso 3: Probar Notificación Directa

1. **En la consola, ejecuta:**
   ```javascript
   new Notification("Test", { body: "Esta es una prueba" })
   ```
2. **Resultados:**
   - ✅ Aparece la notificación → El problema está en el Service Worker
   - ❌ Error → Los permisos no están correctamente otorgados

## Paso 4: Probar desde Service Worker

1. **Abre DevTools → Application → Service Workers**
2. **Haz clic en "Push"** junto al Service Worker
3. **Envía este JSON:**
   ```json
   {"title": "Test", "body": "Test notification"}
   ```
4. **Revisa la consola** para ver los logs:
   - Busca mensajes que empiecen con `[SW]`
   - ¿Ves `[SW] ✅ Notification shown successfully`?
   - ¿O ves `[SW] ❌ Error showing notification`?

## Paso 5: Usar la Página de Prueba

1. **Abre:** `http://localhost:3000/test-notification.html`
2. **Sigue los pasos en orden:**
   - 1. Solicitar Permisos
   - 2. Registrar Service Worker
   - 3. Probar Notificación (directa)
   - 4. Probar Push desde SW
3. **Revisa los logs** en la página para ver qué está fallando

## Paso 6: Verificar Logs del Servidor

1. **Revisa la terminal donde corre `npm run dev`**
2. **Busca logs que empiecen con `[Push]`:**
   - `[Push] Attempting to send notification...`
   - `[Push] Found X tokens...`
   - `[Push] Successfully sent notification` ✅
   - `[Push] Error sending notification` ❌

## Paso 7: Verificar Suscripción Push

1. **En la consola, ejecuta:**
   ```javascript
   navigator.serviceWorker.getRegistration().then(reg => {
     reg.pushManager.getSubscription().then(sub => {
       console.log("Subscription:", sub);
       if (sub) {
         console.log("Endpoint:", sub.endpoint);
         console.log("Keys:", sub.getKey ? "Present" : "Missing");
       } else {
         console.log("No subscription found");
       }
     });
   });
   ```
2. **Resultados:**
   - ✅ Hay suscripción → El problema puede estar en el servidor
   - ❌ No hay suscripción → Necesitas registrarte desde la app

## 🔧 Soluciones Comunes

### Problema: "Notification permission denied"
**Solución:**
1. Ve a Configuración del navegador
2. Permite notificaciones para este sitio
3. Recarga la página

### Problema: Service Worker no registrado
**Solución:**
1. Verifica que estés en HTTPS (o localhost)
2. Verifica que `/sw.js` exista y sea accesible
3. Limpia el cache y recarga

### Problema: No hay suscripción push
**Solución:**
1. Abre la app normalmente
2. Haz clic en el botón de campana para otorgar permisos
3. Espera a que se registre automátición se registre automáticamente

### Problema: Las notificaciones funcionan en desktop pero no en iPhone
**Solución:**
1. Verifica que la app esté instalada como PWA desde Safari
2. Verifica iOS 16.4+ (requerido para Web Push)
3. Verifica que los permisos estén otorgados en la PWA
4. Las notificaciones push solo funcionan cuando la app está cerrada

## 📱 En iPhone Específicamente

### Verificar Instalación PWA:
1. Abre la app desde la pantalla de inicio (no desde Safari)
2. No deberías ver la barra de direcciones de Safari
3. Si ves la barra, no está instalada como PWA

### Verificar Permisos en iPhone:
1. Abre Configuración → Safari → Sitios web → Notificaciones
2. Busca tu sitio y verifica que esté permitido
3. O desde la app PWA, haz clic en el botón de campana

### Debugging en iPhone:
1. Conecta tu iPhone a tu Mac
2. Abre Safari en Mac → Develop → [Tu iPhone] → [Tu app]
3. Abre la consola para ver los mismos logs que en desktop

## 🚨 Si Nada Funciona

Comparte esta información:

1. **Resultado de `Notification.permission`:**
   ```javascript
   Notification.permission
   ```

2. **Estado del Service Worker:**
   - ¿Está activo?
   - ¿Qué archivo está usando?

3. **Logs de la consola cuando pruebas push:**
   - Copia todos los mensajes que empiecen con `[SW]`

4. **Logs del servidor:**
   - Copia todos los mensajes que empiecen con `[Push]`

5. **Resultado de la prueba directa:**
   ```javascript
   new Notification("Test", { body: "Test" })
   ```

6. **Si estás en iPhone:**
   - Versión de iOS
   - ¿Cómo instalaste la app? (Safari, Chrome, etc.)
   - ¿Ves la barra de Safari cuando abres la app?

## ✅ Checklist Final

- [ ] Permisos otorgados (`Notification.permission === "granted"`)
- [ ] Service Worker activo y funcionando
- [ ] Notificación directa funciona
- [ ] Push desde DevTools funciona
- [ ] Suscripción push registrada
- [ ] Logs del servidor muestran éxito
- [ ] En iPhone: App instalada como PWA desde Safari
- [ ] En iPhone: iOS 16.4+

