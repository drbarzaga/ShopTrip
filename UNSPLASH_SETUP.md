# Configuración de Imágenes de Ciudades con Unsplash

Esta guía te ayudará a configurar las imágenes de ciudades en las tarjetas de viajes usando Unsplash.

## 📋 Descripción

Las tarjetas de viajes ahora muestran automáticamente imágenes de las ciudades o destinos usando la API de Unsplash. El sistema funciona de dos maneras:

1. **Con API Key (Recomendado)**: Mejor calidad y más control sobre las imágenes
2. **Sin API Key**: Usa Unsplash Source API (gratuita pero con limitaciones)

## 🔧 Configuración Opcional: API Key de Unsplash

Para obtener mejores resultados y más control sobre las imágenes, puedes obtener una API key gratuita de Unsplash:

### Paso 1: Crear cuenta en Unsplash

1. Ve a [https://unsplash.com/developers](https://unsplash.com/developers)
2. Crea una cuenta gratuita o inicia sesión
3. Haz clic en **"Your apps"** o **"New Application"**

### Paso 2: Crear una aplicación

1. Completa el formulario:
   - **Application name**: Shop Trip (o el nombre que prefieras)
   - **Description**: Aplicación para mostrar imágenes de ciudades en tarjetas de viajes
   - Acepta los términos de uso
2. Haz clic en **"Create application"**

### Paso 3: Obtener Access Key

1. En la página de tu aplicación, encontrarás tu **Access Key**
2. Copia este valor

### Paso 4: Configurar en tu aplicación

Agrega la variable de entorno en tu archivo `.env`:

```env
UNSPLASH_ACCESS_KEY=tu-access-key-aqui
```

**En producción (Vercel u otra plataforma):**

- Ve a Settings → Environment Variables
- Agrega `UNSPLASH_ACCESS_KEY` con tu Access Key

## ✅ Uso sin API Key

Si no configuras la API key, el sistema usará automáticamente Unsplash Source API, que es gratuita pero tiene algunas limitaciones:

- Las imágenes son aleatorias basadas en la búsqueda
- No puedes controlar qué imagen específica se muestra
- Puede ser más lento en algunos casos

## 🎨 Cómo funciona

1. Cuando un viaje tiene un destino configurado, el sistema busca automáticamente una imagen relacionada
2. La imagen se muestra en las tarjetas de viajes según la vista seleccionada:
   - **Vista Grid**: Imagen de fondo completa con overlay
   - **Vista Cards**: Imagen de fondo completa con overlay
   - **Vista List**: Imagen lateral en desktop (solo si hay espacio)
   - **Vista Compact**: Sin imagen (para mantener el diseño compacto)

## 🔍 Búsqueda de imágenes

El sistema busca imágenes usando:

- El campo `destination` del viaje (si está disponible)
- Combinación de ciudad y país (si están disponibles por separado)
- El nombre de la ciudad o capital del país

## 📝 Notas

- Las imágenes se cargan de forma lazy (solo cuando son visibles)
- Si no se encuentra una imagen, la tarjeta se muestra sin imagen
- Las imágenes están optimizadas automáticamente por Next.js Image
- El sistema maneja errores de forma elegante sin afectar la experiencia del usuario

## 🚀 Límites de Unsplash

### Con API Key (Gratuita)

- 50 solicitudes por hora
- Suficiente para uso personal y proyectos pequeños

### Sin API Key (Source API)

- Sin límites oficiales, pero puede ser más lento
- Las imágenes son aleatorias

## 💾 Sistema de Caché

Para optimizar el uso de la API y evitar agotar los límites de requests, el sistema implementa un **caché en dos niveles**:

### 1. Caché en el Servidor (Memoria)

- Las imágenes se guardan en memoria del servidor después de la primera solicitud
- **Duración**: 7 días
- **Ventaja**: Evita requests repetidas cuando múltiples usuarios ven la misma ciudad
- Se limpia automáticamente cuando las entradas expiran

### 2. Caché en el Cliente (localStorage)

- Las URLs de imágenes se guardan en el navegador del usuario
- **Duración**: 7 días
- **Ventaja**: Las imágenes se cargan instantáneamente sin hacer requests cuando el usuario vuelve a ver la misma ciudad
- **Límite**: Máximo 100 entradas (se mantienen las más recientes)
- Se limpia automáticamente cuando las entradas expiran

### Beneficios del Caché

✅ **Reduce drásticamente las requests a Unsplash**: Una ciudad solo se consulta una vez cada 7 días  
✅ **Mejor rendimiento**: Las imágenes se cargan instantáneamente desde el caché  
✅ **Menor uso de ancho de banda**: No se descargan imágenes repetidas  
✅ **Respeta los límites de la API**: Ideal para proyectos con múltiples usuarios

### Ejemplo de Uso

1. **Primera vez**: Usuario A ve "París" → Request a Unsplash → Guardado en caché servidor y cliente
2. **Mismo usuario**: Usuario A vuelve a ver "París" → Carga desde localStorage (sin request)
3. **Otro usuario**: Usuario B ve "París" → Carga desde caché del servidor (sin request a Unsplash)
4. **Después de 7 días**: El caché expira y se hace una nueva request para actualizar la imagen

### Notas Técnicas

- El caché se limpia automáticamente cuando las entradas expiran
- Si el localStorage está lleno, se mantienen solo las 100 entradas más recientes
- El caché del servidor se limpia periódicamente (aproximadamente cada 100 requests)
- Las claves de caché se normalizan (minúsculas, sin espacios extra) para evitar duplicados

Para proyectos con mucho tráfico, considera obtener una API key o usar un servicio de caché más robusto como Redis.
