# Configuración de Recordatorios

Para que el sistema de recordatorios funcione completamente, necesitas completar los siguientes pasos:

## ✅ Pasos Requeridos

### 1. **Ejecutar Migraciones de Base de Datos**

Las tablas `notification_preferences` y `reminder` deben ser creadas en tu base de datos:

```bash
npm run db:push
```

O si prefieres usar Drizzle Kit directamente:
```bash
npx drizzle-kit push
```

**Verificación:** Asegúrate de que las tablas se crearon correctamente en tu base de datos.

### 2. **Configurar Variable de Entorno**

Agrega la variable `CRON_SECRET` a tu archivo `.env` (y a las variables de entorno de producción):

```env
CRON_SECRET=tu-secreto-super-seguro-aqui
```

**Recomendación:** Usa un string aleatorio y seguro, por ejemplo:
```bash
# Generar un secreto seguro
openssl rand -base64 32
```

### 3. **Configurar Cron Job**

El endpoint `/api/reminders/process` debe ser llamado periódicamente para procesar los recordatorios pendientes.

#### Opción A: Usando Vercel Cron Jobs (Recomendado para Vercel)

Si estás usando Vercel, crea un archivo `vercel.json` en la raíz del proyecto:

```json
{
  "crons": [
    {
      "path": "/api/reminders/process",
      "schedule": "0 * * * *"
    }
  ]
}
```

Esto ejecutará el endpoint cada hora. Para ejecutarlo más frecuentemente (cada 15 minutos), usa:
```json
{
  "crons": [
    {
      "path": "/api/reminders/process",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**Importante:** Necesitas agregar el header de autorización en la configuración de Vercel:
- Ve a tu proyecto en Vercel
- Settings → Cron Jobs
- Edita el cron job y agrega el header: `Authorization: Bearer ${CRON_SECRET}`

#### Opción B: Usando cron-job.org (Recomendado) ⭐

**Esta es la opción recomendada** ya que es gratuita, confiable y permite múltiples ejecuciones por día.

📚 **Ver la guía completa:** [CRON_JOB_ORG_SETUP.md](./CRON_JOB_ORG_SETUP.md)

Resumen rápido:
1. Crea una cuenta gratuita en [cron-job.org](https://console.cron-job.org/jobs)
2. Crea un nuevo cron job con:
   - **URL:** `https://tu-dominio.com/api/reminders/process`
   - **Método:** POST
   - **Headers:** `Authorization: Bearer tu-CRON_SECRET-aqui`
   - **Frecuencia:** Cada hora (`0 * * * *`) o cada 15 minutos (`*/15 * * * *`)
3. Activa el cron job

Para más detalles, consulta [CRON_JOB_ORG_SETUP.md](./CRON_JOB_ORG_SETUP.md)

#### Opción C: Usando GitHub Actions (Para proyectos en GitHub)

Crea `.github/workflows/reminders.yml`:

```yaml
name: Process Reminders

on:
  schedule:
    - cron: '0 * * * *'  # Cada hora
  workflow_dispatch:  # Permite ejecución manual

jobs:
  process-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Process Reminders
        run: |
          curl -X POST https://tu-dominio.com/api/reminders/process \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 4. **Verificar que Funciona**

1. **Habilitar recordatorios para un usuario:**
   - Ve a Configuración → Notificaciones
   - Activa "Recordatorios de viajes"
   - Configura los días antes del viaje

2. **Crear un viaje con fecha futura:**
   - Crea un viaje con fecha de inicio en el futuro
   - El sistema debería crear automáticamente un recordatorio

3. **Probar manualmente el endpoint:**
   ```bash
   curl -X POST https://tu-dominio.com/api/reminders/process \
     -H "Authorization: Bearer tu-CRON_SECRET-aqui"
   ```

## 📋 Checklist de Despliegue

- [ ] Ejecutar `npm run db:push` para crear las tablas
- [ ] Agregar `CRON_SECRET` a las variables de entorno
- [ ] Configurar cron job (Vercel, externo, o GitHub Actions)
- [ ] Verificar que el endpoint responde correctamente
- [ ] Probar creando un viaje con fecha futura
- [ ] Verificar que se crea el recordatorio automáticamente

## 🔍 Troubleshooting

### Los recordatorios no se crean automáticamente
- Verifica que el usuario tiene recordatorios habilitados en Configuración
- Verifica que el viaje tiene una fecha de inicio (`startDate`)
- Revisa los logs del servidor para errores

### El cron job no funciona
- Verifica que `CRON_SECRET` está configurado correctamente
- Verifica que el header `Authorization` se envía correctamente
- Revisa los logs del endpoint `/api/reminders/process`

### Las notificaciones no se envían
- Verifica que OneSignal está configurado correctamente
- Verifica que el usuario tiene permisos de notificaciones en el navegador
- Revisa los logs de OneSignal en el dashboard

