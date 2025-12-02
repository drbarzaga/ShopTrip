# Funcionalidad Offline

La aplicación ahora soporta funcionalidad offline completa, permitiendo a los usuarios crear viajes y agregar artículos incluso cuando no hay conexión a internet.

## 🎯 Características

### ✅ Modo Offline
- **Crear viajes**: Los viajes se guardan localmente cuando no hay conexión
- **Agregar artículos**: Los artículos se guardan localmente y se sincronizan después
- **Marcar como comprado**: Los cambios se guardan localmente
- **Visualización**: Puedes ver todos tus viajes e items guardados offline

### ✅ Sincronización Automática
- **Detección automática**: Cuando se recupera la conexión, se sincroniza automáticamente
- **Cola de sincronización**: Las acciones se ejecutan en orden (FIFO)
- **Reintentos**: Si una acción falla, se reintenta automáticamente (máximo 5 intentos)
- **Estado visual**: Badge en la esquina inferior derecha muestra el estado de sincronización

### ✅ Almacenamiento Local
- **IndexedDB**: Todos los datos offline se guardan en IndexedDB del navegador
- **Persistencia**: Los datos se mantienen incluso si cierras el navegador
- **Límite**: El navegador gestiona automáticamente el espacio disponible

## 📱 Cómo Funciona

### Cuando Estás Offline

1. **Crear un viaje**:
   - El viaje se guarda inmediatamente en IndexedDB
   - Aparece en tu lista de viajes
   - Se marca como "pendiente de sincronización"

2. **Agregar un artículo**:
   - El artículo se guarda localmente
   - Aparece en la lista de artículos del viaje
   - Se agrega a la cola de sincronización

3. **Marcar como comprado**:
   - El cambio se guarda localmente
   - Se agrega a la cola de sincronización

### Cuando Se Recupera la Conexión

1. **Detección automática**: El sistema detecta cuando vuelves a estar online
2. **Sincronización**: Todas las acciones pendientes se ejecutan automáticamente
3. **Notificación**: Un badge muestra cuántas acciones se sincronizaron
4. **Actualización**: La UI se actualiza automáticamente con los datos del servidor

## 🔧 Componentes Técnicos

### IndexedDB
- **Base de datos**: `shop-trip-offline`
- **Stores**:
  - `trips`: Viajes guardados offline
  - `items`: Artículos guardados offline
  - `pendingActions`: Cola de acciones pendientes de sincronización

### Service Worker
- Cachea recursos estáticos para funcionar offline
- Intercepta requests y sirve desde cache cuando es posible

### Sincronización
- **Orden**: Las acciones se sincronizan en orden cronológico
- **Reintentos**: Máximo 5 intentos por acción
- **Errores**: Si una acción falla después de 5 intentos, se marca como fallida

## 🎨 Interfaz de Usuario

### Badge de Estado
- **Sin conexión**: Badge rojo con icono de WiFi tachado
- **Pendientes**: Badge gris con cantidad de acciones pendientes
- **Sincronizando**: Badge con spinner animado
- **Click para sincronizar**: Puedes hacer click en el badge para sincronizar manualmente

### Indicadores Visuales
- Los viajes/items creados offline aparecen normalmente en la UI
- No hay diferencia visual entre datos online y offline (se sincronizan automáticamente)

## 🚀 Uso

### Para Usuarios

1. **Usa la app normalmente**: No necesitas hacer nada especial
2. **Si estás offline**: Simplemente crea viajes y agrega artículos como siempre
3. **Cuando vuelvas online**: Todo se sincronizará automáticamente
4. **Verifica sincronización**: El badge en la esquina inferior derecha te muestra el estado

### Para Desarrolladores

#### Verificar Estado Offline

```typescript
import { useOnlineStatus } from "@/hooks/use-online-status";

function MyComponent() {
  const isOnline = useOnlineStatus();
  // ...
}
```

#### Guardar Datos Offline Manualmente

```typescript
import { saveTripOffline, saveItemOffline } from "@/lib/offline/actions";

// Guardar viaje offline
await saveTripOffline({
  id: "trip-id",
  name: "Mi Viaje",
  // ...
});

// Guardar item offline
await saveItemOffline({
  id: "item-id",
  tripId: "trip-id",
  name: "Protector solar",
  // ...
});
```

#### Sincronizar Manualmente

```typescript
import { syncPendingActions } from "@/lib/offline/sync";

// Disparar sincronización manual
window.dispatchEvent(new Event("manual-sync"));

// O directamente
await syncPendingActions();
```

## 🔍 Debugging

### Ver Datos Offline

1. Abre DevTools (F12)
2. Ve a **Application** → **IndexedDB**
3. Busca `shop-trip-offline`
4. Explora los stores: `trips`, `items`, `pendingActions`

### Ver Acciones Pendientes

```javascript
// En la consola del navegador
import { offlineDB } from "@/lib/offline/db";
await offlineDB.init();
const actions = await offlineDB.getPendingActions();
console.log(actions);
```

### Limpiar Datos Offline

```javascript
// En la consola del navegador
indexedDB.deleteDatabase("shop-trip-offline");
```

## ⚠️ Limitaciones

1. **Sin autenticación offline**: No puedes iniciar sesión offline
2. **Sin imágenes**: Las imágenes de ciudades no se cargan offline
3. **Sin IA**: Las sugerencias de IA requieren conexión
4. **Conflictos**: Si editas el mismo item en múltiples dispositivos offline, puede haber conflictos

## 🐛 Troubleshooting

### Los datos no se sincronizan

1. Verifica que tengas conexión a internet
2. Revisa la consola del navegador para errores
3. Intenta hacer click en el badge de sincronización
4. Verifica que las acciones pendientes existan en IndexedDB

### Los datos offline no aparecen

1. Verifica que IndexedDB esté habilitado en tu navegador
2. Revisa la consola para errores de IndexedDB
3. Asegúrate de que el Service Worker esté activo

### El badge no aparece

1. Verifica que `OfflineProvider` esté en el layout
2. Revisa que no haya errores en la consola
3. Asegúrate de que el componente `OfflineStatus` esté renderizado

## 📝 Notas Técnicas

- **IndexedDB**: Requiere navegadores modernos (Chrome, Firefox, Safari, Edge)
- **Service Worker**: Requiere HTTPS (excepto en localhost)
- **Storage**: Los datos offline cuentan contra el límite de almacenamiento del navegador
- **Sincronización**: Se ejecuta automáticamente cuando se detecta conexión online

