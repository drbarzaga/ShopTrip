# ShopTrip 🛫

**ShopTrip** es una aplicación web moderna diseñada para ayudarte a organizar las compras de tus viajes. Crea listas de artículos, rastrea tus gastos y mantén todo organizado antes y durante tus viajes.

![ShopTrip Logo](screenshots/dashboard-final.png)

## ✨ Características Principales

- 🔐 **Autenticación Completa**: Registro, inicio de sesión, recuperación y restablecimiento de contraseña
- 📝 **Gestión de Viajes**: Crea y organiza tus viajes con fechas, destinos y detalles
- 🛍️ **Listas de Compras**: Agrega artículos a tus viajes con descripciones, precios y cantidades
- 📊 **Dashboard Intuitivo**: Visualiza estadísticas de tus viajes y gastos
- 🎨 **Interfaz Moderna**: Diseño limpio y responsive con soporte para temas claro/oscuro
- 🔔 **Notificaciones**: Sistema de notificaciones para mantenerte al día
- 👥 **Organizaciones**: Colabora con otros usuarios en viajes compartidos
- 🤖 **IA Integrada**: Crea viajes y artículos usando inteligencia artificial

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 16, React, TypeScript
- **Estilos**: Tailwind CSS, shadcn/ui
- **Autenticación**: Better Auth
- **Base de Datos**: PostgreSQL con Drizzle ORM
- **Email**: Resend con React Email
- **Notificaciones**: Sonner (toasts)
- **Iconos**: Lucide React

## 📸 Capturas de Pantalla

### Autenticación

#### Página de Login

![Login Page](screenshots/login-page.png)
Inicia sesión en tu cuenta de ShopTrip con tu correo electrónico y contraseña o usando Google

#### Registro Exitoso

![Register Success](screenshots/register-success.png)
Después de registrarte, recibirás un correo de confirmación para activar tu cuenta.

#### Recuperación de Contraseña

![Forgot Password](screenshots/forgot-password-page.png)
Solicita un enlace para restablecer tu contraseña si la olvidaste.

![Forgot Password Success](screenshots/forgot-password-success.png)
Confirma que el enlace de recuperación ha sido enviado a tu correo.

### Dashboard

#### Dashboard Vacío

![Dashboard Empty](screenshots/dashboard-empty.png)
Vista inicial del dashboard cuando aún no has creado ningún viaje.

#### Dashboard con Viaje

![Dashboard with Trip](screenshots/dashboard-with-trip.png)
Dashboard mostrando un viaje creado con estadísticas y progreso.

#### Dashboard Completo

![Dashboard Final](screenshots/dashboard-final.png)
Vista completa del dashboard con viajes, estadísticas y progreso general.

### Gestión de Viajes

#### Página de Detalles del Viaje

![Trip Detail Page](screenshots/trip-detail-page.png)
Vista detallada de un viaje con información completa y opciones de edición.

#### Viaje con Artículos

![Trip Detail with Items](screenshots/trip-detail-with-items.png)
Lista de artículos agregados al viaje con detalles de precios y cantidades.

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 22.15.0 o superior
- npm, yarn, pnpm o bun
- PostgreSQL (o una base de datos compatible)

### Pasos de Instalación

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/shop-trip.git
   cd shop-trip
   ```

2. **Instala las dependencias**

   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configura las variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```env
   # Base de datos
   DATABASE_URL=postgresql://usuario:password@localhost:5432/shop_trip

   # Better Auth
   BETTER_AUTH_SECRET=tu-secret-key-aqui
   BETTER_AUTH_URL=http://localhost:3000

   # Email (Resend)
   RESEND_API_KEY=tu-resend-api-key

   # Groq API (Opcional - para conversión de moneda y sugerencias IA)
   # Si no se configura, se usarán valores por defecto para conversión de moneda
   GROQ_API_KEY=tu-groq-api-key

   # OneSignal (Opcional - para notificaciones push)
   ONESIGNAL_APP_ID=tu-onesignal-app-id
   ONESIGNAL_REST_API_KEY=tu-onesignal-rest-api-key
   ```

   **Nota**: `GROQ_API_KEY` es opcional. Si no se configura:
   - La conversión de moneda usará valores por defecto aproximados
   - Las sugerencias IA usarán sugerencias genéricas por defecto

4. **Configura la base de datos**

   ```bash
   npm run db:push
   ```

5. **Inicia el servidor de desarrollo**

   ```bash
   npm run dev
   ```

6. **Abre tu navegador**

   Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📦 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run db:push` - Sincroniza el esquema de la base de datos
- `npm run db:studio` - Abre Drizzle Studio para gestionar la base de datos

## 🌐 Despliegue

### Vercel (Recomendado)

La forma más fácil de desplegar ShopTrip es usando [Vercel](https://vercel.com):

1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno en el panel de Vercel
3. Vercel detectará automáticamente Next.js y desplegará tu aplicación

### Otros Proveedores

ShopTrip puede desplegarse en cualquier plataforma que soporte Next.js:

- Netlify
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Dayan Perez Barzaga**

- Email: dayan.perez9012+1@gmail.com
- GitHub: [@drbarzaga](https://github.com/drbarzaga)

---

Hecho con ❤️ usando Next.js y TypeScript
