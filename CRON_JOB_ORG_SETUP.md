# Configuración de Recordatorios con cron-job.org

Esta guía te ayudará a configurar recordatorios automáticos usando [cron-job.org](https://console.cron-job.org/jobs), un servicio gratuito y confiable para ejecutar tareas programadas.

## 📋 Requisitos Previos

- Una cuenta en [cron-job.org](https://console.cron-job.org/jobs) (gratuita)
- Tu aplicación desplegada y accesible públicamente
- Variable de entorno `CRON_SECRET` configurada

## 🔧 Paso 1: Configurar Variable de Entorno

1. Genera un secreto seguro:

   ```bash
   openssl rand -base64 32
   ```

2. Agrega la variable `CRON_SECRET` a tu archivo `.env`:

   ```env
   CRON_SECRET=tu-secreto-generado-aqui
   ```

3. **Importante:** También agrega esta variable en tu plataforma de despliegue (Vercel, Railway, etc.)

## 🌐 Paso 2: Configurar Cron Job en cron-job.org

### 2.1 Crear una Cuenta

1. Ve a [https://console.cron-job.org/jobs](https://console.cron-job.org/jobs)
2. Crea una cuenta gratuita (o inicia sesión si ya tienes una)

### 2.2 Crear un Nuevo Cron Job

1. Haz clic en **"Create cronjob"** o el botón **"+"**

2. Completa el formulario con los siguientes valores:

   **Título:**

   ```
   Shop Trip - Procesar Recordatorios
   ```

   **URL:**

   ```
   https://tu-dominio.com/api/reminders/process
   ```

   > Reemplaza `tu-dominio.com` con tu dominio real (ej: `shoptrip.app`)

   **Método HTTP:**

   ```
   POST
   ```

   **Headers (Headers personalizados):**
   Agrega estos headers:

   ```
   Authorization: Bearer TU_CRON_SECRET_AQUI
   Content-Type: application/json
   ```

   > Reemplaza `TU_CRON_SECRET_AQUI` con el valor de `CRON_SECRET` que configuraste

   **Alternativa usando header personalizado:**
   Si prefieres usar un header personalizado, también puedes usar:

   ```
   X-Cron-Job-Token: TU_CRON_SECRET_AQUI
   ```

   **Frecuencia:**
   - **Recomendado:** Cada hora (`0 * * * *`)
   - **Más frecuente:** Cada 15 minutos (`*/15 * * * *`)
   - **Menos frecuente:** Cada 6 horas (`0 */6 * * *`)

   **Zona Horaria:**
   Selecciona tu zona horaria preferida

   **Activar:**
   ✅ Marca la casilla para activar el cron job inmediatamente

### 2.3 Configuración Avanzada (Opcional)

- **Timeout:** 30 segundos (suficiente para procesar recordatorios)
- **Retry on failure:** Opcional, puedes activarlo si quieres reintentos automáticos
- **Notifications:** Puedes configurar notificaciones por email si el cron job falla

## ✅ Paso 3: Verificar la Configuración

### 3.1 Probar el Endpoint Manualmente

Puedes probar el endpoint manualmente usando curl:

```bash
curl -X POST https://tu-dominio.com/api/reminders/process \
  -H "Authorization: Bearer TU_CRON_SECRET_AQUI" \
  -H "Content-Type: application/json"
```

Deberías recibir una respuesta como:

```json
{
  "success": true,
  "processed": 0,
  "sent": 0
}
```

### 3.2 Verificar en cron-job.org

1. Ve a tu dashboard en cron-job.org
2. Haz clic en tu cron job creado
3. Ve a la pestaña **"Execution history"**
4. Verifica que las ejecuciones sean exitosas (código 200)

## 🎯 Paso 4: Habilitar Recordatorios para Usuarios

1. Los usuarios deben ir a **Configuración → Notificaciones**
2. Activar **"Recordatorios de viajes"**
3. Configurar los **días antes del viaje** (1-7 días)
4. Crear un viaje con fecha de inicio futura
5. El sistema creará automáticamente un recordatorio

## 📊 Monitoreo

### Ver Logs de Ejecución

En cron-job.org puedes ver:

- Historial de ejecuciones
- Códigos de respuesta HTTP
- Tiempo de ejecución
- Errores si los hay

### Ver Logs de la Aplicación

Revisa los logs de tu aplicación para ver:

- Cuántos recordatorios se procesaron
- Cuántos se enviaron exitosamente
- Cualquier error que ocurra

## 🔍 Troubleshooting

### El cron job no se ejecuta

1. **Verifica que el cron job esté activado** en cron-job.org
2. **Verifica la URL** - debe ser accesible públicamente
3. **Verifica los headers** - el token debe ser correcto
4. **Revisa el historial de ejecuciones** en cron-job.org

### Error 401 Unauthorized

1. Verifica que `CRON_SECRET` esté configurado en tu plataforma de despliegue
2. Verifica que el header `Authorization` tenga el formato correcto: `Bearer TU_SECRETO`
3. Asegúrate de que el secreto en cron-job.org coincida con el de tu aplicación

### Los recordatorios no se envían

1. Verifica que el usuario tenga recordatorios habilitados en Configuración
2. Verifica que el viaje tenga una fecha de inicio (`startDate`)
3. Verifica que la fecha del recordatorio ya haya pasado
4. Revisa los logs del endpoint `/api/reminders/process`

### El cron job se ejecuta pero no procesa nada

Esto es normal si:

- No hay usuarios con recordatorios habilitados
- No hay recordatorios pendientes
- Todos los recordatorios ya fueron enviados

## 📝 Formato de Cron

Si necesitas cambiar la frecuencia, aquí tienes algunos ejemplos:

- **Cada minuto:** `* * * * *` (no recomendado para producción)
- **Cada 15 minutos:** `*/15 * * * *`
- **Cada hora:** `0 * * * *` (recomendado)
- **Cada 6 horas:** `0 */6 * * *`
- **Cada día a las 9 AM:** `0 9 * * *`
- **Cada lunes a las 8 AM:** `0 8 * * 1`

## 🔒 Seguridad

- **Nunca compartas tu `CRON_SECRET`** públicamente
- Usa HTTPS siempre (cron-job.org lo requiere)
- El endpoint valida el token antes de procesar cualquier cosa
- Solo usuarios con recordatorios habilitados recibirán notificaciones

## 💡 Consejos

1. **Frecuencia recomendada:** Cada hora es suficiente para la mayoría de casos
2. **Monitoreo:** Revisa el historial de ejecuciones periódicamente
3. **Notificaciones:** Configura alertas por email en cron-job.org para saber si algo falla
4. **Testing:** Prueba el endpoint manualmente antes de confiar en el cron job

## 📚 Recursos Adicionales

- [Documentación de cron-job.org](https://cron-job.org/en/help/)
- [Formato de cron](https://crontab.guru/)
- [Documentación de recordatorios](./RECORDATORIOS_SETUP.md)
