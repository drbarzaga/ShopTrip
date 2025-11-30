# Configuración de Google Analytics 4

Esta guía te ayudará a configurar Google Analytics 4 (GA4) para rastrear el uso de tu aplicación Shop Trip.

## 📋 Pasos de Configuración

### 1. Crear una cuenta de Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Comenzar a medir"** o **"Crear cuenta"**

### 2. Crear una propiedad

1. Completa el formulario de creación de propiedad:
   - **Nombre de la propiedad**: Shop Trip
   - **Zona horaria**: Selecciona tu zona horaria
   - **Moneda**: Selecciona tu moneda (UYU o USD)
2. Haz clic en **"Siguiente"**

### 3. Configurar información del negocio

1. Selecciona tu industria (puedes elegir "Viajes" o "Otro")
2. Selecciona el tamaño de tu negocio
3. Selecciona cómo planeas usar Google Analytics
4. Haz clic en **"Crear"**

### 4. Configurar flujo de datos web

1. Selecciona **"Web"** como plataforma
2. Ingresa la URL de tu sitio web (ej: `https://shoptrip.app`)
3. Ingresa un nombre para el flujo (ej: "Shop Trip Web")
4. Haz clic en **"Crear flujo"**

### 5. Obtener el Measurement ID

1. En la página de configuración del flujo de datos, encontrarás tu **Measurement ID**
2. Tiene el formato: `G-XXXXXXXXXX`
3. **Copia este ID** - lo necesitarás para configurar la aplicación

### 6. Configurar en tu aplicación

1. Agrega la variable de entorno en tu archivo `.env`:
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

2. En producción (Vercel u otra plataforma):
   - Ve a Settings → Environment Variables
   - Agrega `NEXT_PUBLIC_GA_MEASUREMENT_ID` con tu Measurement ID

## ✅ Eventos que se rastrean automáticamente

La aplicación rastrea los siguientes eventos:

### Autenticación
- `sign_up` - Cuando un usuario se registra
- `login` - Cuando un usuario inicia sesión
- `logout` - Cuando un usuario cierra sesión

### Viajes
- `create_trip` - Cuando se crea un nuevo viaje
- `view_trip` - Cuando se visualiza un viaje
- `delete_trip` - Cuando se elimina un viaje
- `ai_create_trip` - Cuando se usa IA para crear un viaje

### Artículos
- `create_item` - Cuando se crea un artículo
- `purchase_item` - Cuando se marca un artículo como comprado
- `delete_item` - Cuando se elimina un artículo
- `ai_create_item` - Cuando se usa IA para crear un artículo

### Organizaciones
- `create_organization` - Cuando se crea una organización
- `join_organization` - Cuando se une a una organización
- `invite_member` - Cuando se invita a un miembro

### Navegación
- `view_dashboard` - Cuando se visita el dashboard
- `view_settings` - Cuando se visita la página de configuración

### Configuración
- `change_currency` - Cuando se cambia la moneda preferida
- `enable_notifications` - Cuando se habilitan las notificaciones

## 📊 Ver los datos en Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Selecciona tu propiedad "Shop Trip"
3. En el menú lateral, ve a **"Informes"**
4. Puedes ver:
   - **Tiempo real**: Usuarios activos en este momento
   - **Adquisición**: De dónde vienen tus usuarios
   - **Compromiso**: Qué páginas visitan y cuánto tiempo pasan
   - **Eventos**: Todos los eventos personalizados que rastreamos

## 🎯 Eventos importantes para monitorear

### Conversiones (Registros)
1. Ve a **Admin** → **Eventos**
2. Busca el evento `sign_up`
3. Haz clic en los tres puntos → **"Marcar como conversión"**
4. Esto te permitirá ver cuántos usuarios se registran

### Métricas clave
- **Usuarios nuevos**: Cuántos usuarios únicos visitan tu app
- **Registros**: Eventos `sign_up`
- **Logins**: Eventos `login`
- **Viajes creados**: Eventos `create_trip`
- **Artículos comprados**: Eventos `purchase_item`

## 🔒 Privacidad

Google Analytics está configurado para:
- Respetar las preferencias de "Do Not Track"
- No rastrear información personal identificable
- Cumplir con GDPR y otras regulaciones de privacidad

## 🧪 Verificar que funciona

1. Abre tu aplicación en el navegador
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña **"Network"** o **"Red"**
4. Filtra por "google-analytics" o "gtag"
5. Deberías ver peticiones a Google Analytics cuando navegas

O usa la extensión [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) para Chrome.

## 📝 Notas

- Los datos pueden tardar 24-48 horas en aparecer en los informes estándar
- Los datos en tiempo real aparecen inmediatamente
- Si no ves datos, verifica que `NEXT_PUBLIC_GA_MEASUREMENT_ID` esté configurado correctamente
- En desarrollo local, los eventos se enviarán a Google Analytics si tienes el ID configurado

## 🚀 Próximos pasos

Una vez configurado, puedes:
1. Crear informes personalizados en Google Analytics
2. Configuración → Informes personalizados
2. Configurar alertas para cuando haya nuevos registros
3. Crear audiencias para segmentar usuarios
4. Configurar objetivos y conversiones

---

**¿Necesitas ayuda?** Consulta la [documentación oficial de Google Analytics](https://support.google.com/analytics)

