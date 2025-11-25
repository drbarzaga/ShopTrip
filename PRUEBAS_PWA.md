# Guía de Pruebas PWA

## 🧪 Cómo Probar la Instalación PWA

### Prueba 1: Verificar Manifest y Meta Tags

1. **Abrir la app en el navegador** (cualquier dispositivo)
2. **Abrir DevTools** (F12 o Cmd+Option+I)
3. **Ir a la pestaña "Application"** (o "Aplicación")
4. **Verificar:**
   - ✅ En "Manifest": Debería aparecer "Shop Trip" con los iconos
   - ✅ En "Service Workers": Debería aparecer `/sw.js` como activo
   - ✅ En "Storage" → "Cache Storage": Debería haber un cache "shop-trip-v1"

### Prueba 2: Instalación en iPhone (Safari)

1. **Abrir Safari en iPhone** (no Chrome u otros navegadores)
2. **Navegar a tu app** (debe ser HTTPS)
3. **Esperar 3 segundos** - Debería aparecer un card en la esquina inferior con instrucciones
4. **Seguir las instrucciones:**
   - Tocar el botón "Compartir" (Share) en Safari
   - Desplazarse hacia abajo
   - Seleccionar "Agregar a pantalla de inicio"
   - Tocar "Agregar"
5. **Verificar instalación:**
   - Debería aparecer un ícono en la pantalla de inicio
   - Al abrir, no debería verse la barra de direcciones de Safari

### Prueba 3: Instalación en Android/Chrome

1. **Abrir Chrome en Android**
2. **Navegar a tu app**
3. **Debería aparecer un banner** preguntando si quieres instalar
4. **O tocar el menú** (3 puntos) → "Instalar app"
5. **Verificar:** La app debería aparecer como una app instalada

### Prueba 4: Verificar Modo Standalone

Después de instalar, verificar que está en modo standalone:

1. **Abrir la app desde la pantalla de inicio**
2. **Abrir la consola** (si es posible)
3. **Ejecutar:**
   ```javascript
   window.matchMedia("(display-mode: standalone)").matches
   ```
   Debería retornar `true`

4. **Verificar visualmente:**
   - ❌ NO debería verse la barra de direcciones
   - ❌ NO debería verse el botón de "atrás" del navegador
   - ✅ Debería verse como una app nativa

### Prueba 5: Verificar Service Worker

1. **Abrir DevTools** → **Application** → **Service Workers**
2. **Verificar:**
   - Estado: "activated and is running"
   - Scope: `/`
   - Archivo: `/sw.js`

### Prueba 6: Verificar Notificaciones Push (después de instalar como PWA)

1. **Instalar la app como PWA** (pasos anteriores)
2. **Otorgar permisos de notificaciones** (botón de campana en el header)
3. **Abrir la app en otra pestaña/dispositivo**
4. **Crear un producto o viaje**
5. **Verificar:**
   - ✅ Debería aparecer una notificación push
   - ✅ Debería aparecer un toast en la esquina superior derecha
   - ✅ Debería aparecer un badge en el título: `(1) Shop Trip`

### Prueba 7: Verificar Cache Offline

1. **Instalar la app como PWA**
2. **Abrir la app una vez** (para que cachee recursos)
3. **Activar modo avión** o desconectar WiFi
4. **Abrir la app nuevamente**
5. **Verificar:** Debería cargar parcialmente (al menos el shell de la app)

## 🔍 Comandos Útiles para Debugging

### En la Consola del Navegador:

```javascript
// Verificar si está en modo standalone
window.matchMedia("(display-mode: standalone)").matches

// Verificar Service Worker
navigator.serviceWorker.getRegistration().then(reg => console.log(reg))

// Verificar cache
caches.keys().then(keys => console.log(keys))

// Verificar notificaciones
Notification.permission

// Verificar si es iOS
/iPad|iPhone|iPod/.test(navigator.userAgent)
```

## 📱 Checklist de Pruebas

### Antes de Probar:
- [ ] La app está servida por HTTPS
- [ ] El archivo `public/manifest.json` existe
- [ ] El archivo `public/sw.js` existe
- [ ] Los iconos existen (`/icon.svg`, `/apple-icon.svg`)

### Pruebas Básicas:
- [ ] El manifest se carga correctamente
- [ ] El Service Worker se registra
- [ ] El prompt de instalación aparece (iOS después de 3 segundos)
- [ ] La app se puede instalar en iPhone
- [ ] La app se puede instalar en Android
- [ ] La app abre en modo standalone después de instalar

### Pruebas de Notificaciones:
- [ ] Las notificaciones del navegador funcionan cuando la app está abierta
- [ ] El badge en el título se actualiza correctamente
- [ ] Los toasts aparecen en la esquina superior derecha
- [ ] Las notificaciones push funcionan cuando está instalada como PWA (iOS 16.4+)

### Pruebas de Cache:
- [ ] Los recursos básicos se cachean
- [ ] La app funciona parcialmente offline

## 🐛 Problemas Comunes

### El prompt de instalación no aparece
- Verifica que estés usando Safari en iPhone
- Verifica que la app esté servida por HTTPS
- Espera al menos 3 segundos después de cargar

### El Service Worker no se registra
- Verifica que `public/sw.js` exista
- Verifica que la app esté servida por HTTPS
- Revisa la consola para errores

### Las notificaciones no funcionan
- Verifica que hayas otorgado permisos
- Verifica que las VAPID keys estén configuradas
- En iOS: Verifica que la app esté instalada como PWA (iOS 16.4+)

## 🚀 Próximos Pasos

1. Probar en un iPhone real (no simulador)
2. Verificar que las notificaciones push funcionen cuando la app está cerrada
3. Probar el funcionamiento offline
4. Verificar que el cache funcione correctamente


