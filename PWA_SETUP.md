# Configuración PWA para iPhone

## ✅ Configuración Completada

La app ahora está configurada como PWA (Progressive Web App) y puede instalarse en iPhone.

### Archivos Creados/Modificados

1. **`public/manifest.json`** - Manifest de la PWA
2. **`src/app/layout.tsx`** - Meta tags para PWA
3. **`public/sw.js`** - Service Worker mejorado con cache
4. **`src/components/pwa-install-prompt.tsx`** - Componente para guiar la instalación

## Cómo Instalar en iPhone

### Pasos para el Usuario:

1. **Abrir la app en Safari** (no funciona en Chrome u otros navegadores en iOS)
2. **Tocar el botón "Compartir"** (Share) en la barra inferior de Safari
3. **Desplazarse hacia abajo** y seleccionar **"Agregar a pantalla de inicio"** (Add to Home Screen)
4. **Personalizar el nombre** si lo desea (opcional)
5. **Tocar "Agregar"** en la esquina superior derecha

### Después de Instalar:

- La app aparecerá como un ícono en la pantalla de inicio
- Se abrirá en modo standalone (sin la barra del navegador)
- Las notificaciones push funcionarán cuando la app esté cerrada (iOS 16.4+)
- El Service Worker cacheará recursos para funcionar offline

## Características PWA

### ✅ Modo Standalone
- La app se abre sin la barra del navegador
- Experiencia similar a una app nativa

### ✅ Notificaciones Push
- Funcionan cuando la app está cerrada (iOS 16.4+)
- Requieren permisos del usuario

### ✅ Cache Offline
- El Service Worker cachea recursos básicos
- La app puede funcionar parcialmente sin conexión

### ✅ Instalación Automática
- En Android/Chrome: Prompt automático de instalación
- En iPhone: Instrucciones visuales después de 3 segundos

## Verificación

### Verificar que está instalado como PWA:

1. Abrir la app desde la pantalla de inicio
2. No debería verse la barra de direcciones del navegador
3. En la consola del navegador, verificar:
   ```javascript
   window.matchMedia("(display-mode: standalone)").matches
   // Debería retornar true
   ```

### Verificar Service Worker:

1. Abrir DevTools → Application → Service Workers
2. Debería aparecer `/sw.js` como activo
3. Verificar que el cache esté funcionando

## Troubleshooting

### La opción "Agregar a pantalla de inicio" no aparece

- Asegúrate de estar usando **Safari** (no Chrome u otros navegadores)
- Verifica que la app esté servida por **HTTPS**
- Intenta cerrar y volver a abrir Safari

### Las notificaciones no funcionan después de instalar

- Verifica que tengas **iOS 16.4 o superior**
- Asegúrate de haber otorgado permisos de notificaciones
- Verifica que las VAPID keys estén configuradas en `.env`

### El Service Worker no se registra

- Verifica que el archivo `public/sw.js` esté en `/public/sw.js`
- Verifica que la app esté servida por HTTPS
- Revisa la consola del navegador para errores

## Requisitos para PWA en iPhone

- ✅ iOS 16.4 o superior (para notificaciones push)
- ✅ Safari (no funciona en otros navegadores)
- ✅ HTTPS (requerido para Service Workers)
- ✅ Manifest.json configurado
- ✅ Service Worker registrado
- ✅ Iconos configurados

## Beneficios de Instalar como PWA

1. **Mejor experiencia de usuario
- Modo standalone sin barras del navegador
- Acceso rápido desde la pantalla de inicio

2. **Notificaciones Push**
- Funcionan cuando la app está cerrada
- Mejor que las notificaciones del navegador

3. **Funcionalidad Offline**
- Cache de recursos básicos
- Mejor rendimiento

4. **Actualizaciones Automáticas**
- El Service Worker se actualiza automáticamente
- Los usuarios siempre tienen la última versión

