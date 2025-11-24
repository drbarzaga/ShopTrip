# Guía de Debugging - Notificaciones y Error #418

## 🔧 Cambios Realizados

### 1. Error #418 de React (Hidratación)
- ✅ Corregido el acceso a `document.title` para que solo ocurra después del montaje
- ✅ Mejorado el manejo de estado `mounted` en `use-notifications.ts`
- ✅ Reemplazado símbolo "→" por "-" en instrucciones

### 2. Notificaciones Push
- ✅ Agregado logging detallado en Service Worker
- ✅ Mejorado manejo de errores en notificaciones del navegador
- ✅ Verificaciones de permisos mejoradas

## 🐛 Debugging del Error #418

### Pasos para diagnosticar:

1. **Abre la consola del navegador** (F12 o Cmd+Option+I)

2. **Verifica si el error persiste:**
   - Si sigue apareciendo, busca en la consola qué componente lo causa
   - El error debería mostrar un stack trace

3. **Verifica extensiones del navegador:**
   - Algunas extensiones modifican el DOM y causan errores de hidratación
   - Prueba en modo incógnito o desactiva extensiones

4. **Limpia el cache:**
   ```javascript
   // En la consola del navegador
   localStorage.clear();
   sessionStorage.clear();
   // Luego recarga la página con Cmd+Shift+R (hard refresh)
   ```

## 🔔 Debugging de Notificaciones

### Verificar Permisos:

1. **En la consola del navegador, ejecuta:**
   ```javascript
   Notification.permission
   ```
   - Debe retornar `"granted"` para que funcionen
   - Si es `"default"`, haz clic en el botón de campana en el header
   - Si es `"denied"`, ve a Configuración del navegador y permite notificaciones

### Verificar Service Worker:

1. **Abre DevTools → Application → Service Workers**
2. **Verifica:**
   - Estado: "activated and is running"
   - Archivo: `/sw.js`
   - Scope: `/`

3. **Prueba una notificación push manualmente:**
   - En DevTools → Application → Service Workers
   - Haz clic en "Push" junto al Service Worker
   - Envía: `{"title": "Test", "body": "Test notification"}`
   - Revisa la consola para ver los logs `[SW]`

### Logs Esperados:

Cuando pruebas una notificación, deberías ver en la consola:

```
[SW] Push event received
[SW] Parsed push data as JSON: {title: "Test", body: "Test notification"}
[SW] Showing notification: Test {body: "Test notification", ...}
[SW] Notification shown successfully
```

Si ves un error, deberías ver:
```
[SW] Error showing notification: [error details]
```

### Verificar Notificaciones del Navegador (SSE):

Cuando la app está abierta y llega una notificación SSE, deberías ver:

```
[Notifications] Showing browser notification: [title]
[Notifications] Browser notification created successfully
```

Si no funciona, verás:
```
[Notifications] Cannot show browser notification: {hasWindow: true, hasNotification: true, permission: "granted"}
```

## 📱 Notificaciones en iPhone

### Requisitos:

1. **iOS 16.4+** (requerido para Web Push en PWA)
2. **App instalada como PWA desde Safari** (no desde Chrome)
3. **Permisos otorgados** (botón de campana en el header)

### Verificar Instalación PWA:

1. **Abre la app desde la pantalla de inicio** (no desde Safari)
2. **Verifica que NO veas la barra de direcciones** de Safari
3. **En la consola (si puedes acceder):**
   ```javascript
   window.matchMedia("(display-mode: standalone)").matches
   // Debe retornar true
   ```

### Debugging en iPhone:

1. **Conecta tu iPhone a tu Mac**
2. **Abre Safari en Mac → Develop → [Tu iPhone] → [Tu app]**
3. **Abre la consola** para ver los logs
4. **Verifica los mismos logs que en desktop**

## 🔍 Comandos Útiles para Debugging

### En la Consola del Navegador:

```javascript
// Verificar permisos de notificaciones
Notification.permission

// Verificar Service Worker
navigator.serviceWorker.getRegistration().then(reg => console.log(reg))

// Verificar si está en modo standalone (PWA)
window.matchMedia("(display-mode: standalone)").matches

// Verificar si es iOS
/iPad|iPhone|iPod/.test(navigator.userAgent)

// Limpiar cache del Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
  console.log("Service Workers unregistered");
})

// Verificar suscripciones push
navigator.serviceWorker.getRegistration().then(reg => {
  reg.pushManager.getSubscription().then(sub => console.log(sub));
})
```

## ✅ Checklist de Verificación

### Error #418:
- [ ] Error desapareció después de recargar
- [ ] No hay errores en la consola
- [ ] La app funciona normalmente

### Notificaciones en Navegador:
- [ ] Permisos otorgados (`Notification.permission === "granted"`)
- [ ] Service Worker activo
- [ ] Logs `[SW]` aparecen cuando pruebas push
- [ ] Notificación aparece cuando pruebas desde DevTools
- [ ] Notificaciones SSE aparecen cuando la app está abierta

### Notificaciones en iPhone:
- [ ] App instalada como PWA desde Safari
- [ ] iOS 16.4+
- [ ] Permisos otorgados
- [ ] App abre en modo standalone (sin barra de Safari)
- [ ] Notificaciones funcionan cuando la app está cerrada

## 🚨 Problemas Comunes

### Las notificaciones no aparecen:
1. Verifica permisos: `Notification.permission`
2. Verifica que el Service Worker esté activo
3. Revisa la consola para errores
4. En iPhone: Verifica que esté instalado como PWA

### El error #418 persiste:
1. Limpia cache y localStorage
2. Prueba en modo incógnito
3. Desactiva extensiones del navegador
4. Verifica que no haya otros componentes con problemas de hidratación

### Service Worker no se registra:
1. Verifica que estés en HTTPS (o localhost)
2. Verifica que `/sw.js` exista y sea accesible
3. Revisa la consola para errores de registro

## 📞 Siguiente Paso

Si después de seguir esta guía los problemas persisten, comparte:
1. Los logs completos de la consola
2. El resultado de `Notification.permission`
3. El estado del Service Worker (Application → Service Workers)
4. Si estás en iPhone: versión de iOS y cómo instalaste la app

