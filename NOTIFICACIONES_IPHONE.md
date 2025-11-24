# Notificaciones en Tiempo Real para iPhone

## Sistema Actual Mejorado

Hemos mejorado el sistema de notificaciones para que funcione mejor en iPhone usando **Server-Sent Events (SSE)** que es más confiable que Web Push en iOS.

### ✅ Características Implementadas

1. **Notificaciones del Navegador**
   - Funcionan cuando la app está abierta en iPhone
   - Se muestran automáticamente si el usuario ha otorgado permisos
   - Se cierran automáticamente después de 5 segundos
   - Al hacer click, enfocan la ventana

2. **Badge en el Título de la Página**
   - Muestra el número de notificaciones no leídas: `(3) Shop Trip`
   - Se actualiza automáticamente cuando llegan nuevas notificaciones
   - Funciona en todas las plataformas, incluyendo iPhone

3. **Notificaciones Toast Mejoradas**
   - Más visibles con sombras y bordes destacados
   - Vibración en dispositivos móviles cuando llega una notificación
   - Se muestran en la esquina superior derecha

4. **Conexión SSE Robusta**
   - Reconexión automática si se pierde la conexión
   - Funciona en tiempo real cuando la app está abierta
   - Compatible con iPhone y todos los navegadores modernos

## Cómo Funciona en iPhone

### Cuando la App Está Abierta ✅

1. El usuario se conecta automáticamente al stream SSE
2. Las notificaciones llegan en tiempo real
3. Se muestran como:
   - **Notificaciones del navegador** (si tiene permisos)
   - **Toasts visuales** en la esquina superior derecha
   - **Badge en el título** de la pestaña

### Cuando la App Está Cerrada ⚠️

**Limitación de iOS**: Las notificaciones Web Push tienen restricciones en iPhone:
- Solo funcionan en iOS 16.4+
- Requieren que la app esté instalada como PWA (agregada a la pantalla de inicio)
- Requieren permisos explícitos del usuario

**Solución**: El sistema SSE se reconecta automáticamente cuando el usuario abre la app y muestra todas las notificaciones pendientes.

## Alternativas para Notificaciones cuando la App Está Cerrada

### Opción 1: PWA con Web Push (Recomendado para producción)

**Requisitos:**
1. La app debe estar instalada como PWA
2. Usuario debe otorgar permisos de notificaciones
3. iOS 16.4 o superior

**Pasos para el usuario:**
1. Abrir la app en Safari
2. Tocar el botón "Compartir" (Share)
3. Seleccionar "Agregar a pantalla de inicio"
4. Abrir la app desde la pantalla de inicio
5. Otorgar permisos de notificaciones cuando se solicite

### Opción 2: Servicios de Terceros

**OneSignal** o **Firebase Cloud Messaging (FCM)**:
- Manejan mejor las notificaciones push en iOS
- Requieren configuración adicional
- Pueden ser más costosos

### Opción 3: Notificaciones por Email (Backup)

- Enviar emails cuando hay eventos importantes
- Funciona en todas las plataformas
- No requiere permisos especiales

## Mejoras Implementadas

### 1. Badge en el Título
```typescript
// El título cambia de "Shop Trip" a "(3) Shop Trip"
// cuando hay 3 notificaciones no leídas
```

### 2. Notificaciones del Navegador Mejoradas
- Se muestran incluso cuando la pestaña está en segundo plano
- Se cierran automáticamente después de 5 segundos
- Al hacer click, enfocan la ventana

### 3. Vibración en Móviles
- Vibración corta cuando llega una notificación
- Solo en dispositivos que soportan la API de vibración

### 4. Toasts Más Visibles
- Sombras más pronunciadas
- Bordes destacados
- Animaciones suaves

## Cómo Probar

1. **Abrir la app en iPhone**
2. **Otorgar permisos de notificaciones** (botón de campana en el header)
3. **Abrir la app en otra pestaña/dispositivo**
4. **Crear un producto o viaje**
5. **Verificar que aparezcan:**
   - Notificación del navegador
   - Toast en la esquina superior derecha
   - Badge en el título de la pestaña

## Ventajas del Sistema SSE

✅ **Funciona en tiempo real** cuando la app está abierta
✅ **Compatible con iPhone** sin restricciones especiales
✅ **No requiere instalación como PWA** para funcionar cuando está abierta
✅ **Reconexión automática** si se pierde la conexión
✅ **Múltiples formas de notificación** (navegador, toast, badge)

## Limitaciones

⚠️ **Cuando la app está cerrada**: Las notificaciones Web Push requieren PWA en iOS
⚠️ **iOS < 16.4**: No soporta Web Push, solo SSE cuando está abierta
⚠️ **Safari en segundo plano**: Puede pausar conexiones SSE después de un tiempo

## Recomendaciones

1. **Para mejor experiencia en iPhone**: Instalar como PWA y otorgar permisos
2. **Para notificaciones cuando está cerrada**: Considerar servicios como OneSignal
3. **Para máxima compatibilidad**: El sistema SSE actual funciona bien cuando la app está abierta

