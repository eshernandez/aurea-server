# 📅 Explicación del Scheduler de Notificaciones

## 🎯 ¿Qué hace el Scheduler?

El scheduler es como un **reloj despertador** que cada minuto revisa:
1. ¿Qué usuarios necesitan notificaciones programadas?
2. ¿Hay notificaciones pendientes que ya deben enviarse?

## 🔄 Flujo Completo del Sistema

### Paso 1: El Scheduler se Ejecuta Cada Minuto

```php
// routes/console.php
Schedule::command('notifications:schedule')
    ->everyMinute()  // ← Se ejecuta cada minuto
    ->withoutOverlapping()  // ← No permite que se ejecute dos veces al mismo tiempo
    ->runInBackground();  // ← Se ejecuta en segundo plano
```

**¿Cómo se ejecuta?**
- Laravel necesita que un cron del sistema ejecute `php artisan schedule:run` cada minuto
- Este comando revisa todas las tareas programadas y ejecuta las que corresponden

### Paso 2: El Comando `notifications:schedule` se Ejecuta

```php
// app/Console/Commands/ScheduleNotifications.php
```

**Este comando hace DOS cosas:**

#### A) Programa Notificaciones Futuras

1. **Busca usuarios activos:**
   ```php
   $users = User::whereHas('preferences', function ($query) {
       $query->where('notifications_enabled', true);
   })->get();
   ```
   - Encuentra todos los usuarios que tienen notificaciones habilitadas

2. **Para cada usuario, calcula cuándo debe recibir notificaciones:**
   ```php
   $schedulingService->scheduleNotificationsForUser($user);
   ```
   - Lee las preferencias del usuario:
     - `preferred_hours`: [8, 12, 18] (horas del día)
     - `timezone`: "America/Mexico_City"
     - `notifications_per_day`: 3
   - Calcula las horas exactas (en UTC) para hoy o mañana
   - Crea registros en `notification_deliveries` con `status = 'pending'`

   **Ejemplo:**
   - Usuario en México (UTC-6) quiere notificaciones a las 8:00, 12:00, 18:00
   - Si son las 10:00 AM en México:
     - 8:00 AM ya pasó → programa para mañana
     - 12:00 PM es en 2 horas → programa para hoy
     - 6:00 PM es en 8 horas → programa para hoy
   - Crea 3 registros en la tabla `notification_deliveries`

#### B) Envía Notificaciones Pendientes

1. **Busca notificaciones que ya deben enviarse:**
   ```php
   $pending = $schedulingService->getPendingNotifications();
   ```
   - Busca en `notification_deliveries`:
     - `status = 'pending'`
     - `scheduled_at <= ahora` (ya es hora de enviarla)

2. **Para cada notificación pendiente, crea un Job:**
   ```php
   SendNotificationJob::dispatch($delivery);
   ```
   - Envía el trabajo a la cola (queue)
   - El job se procesa en segundo plano

### Paso 3: El Job `SendNotificationJob` Procesa la Notificación

```php
// app/Jobs/SendNotificationJob.php
```

**Este job hace:**

1. **Selecciona contenido (quote + article):**
   - Usa `ContentSelectionService` para elegir:
     - Una frase (quote) que el usuario no haya visto en los últimos 7 días
     - Un artículo relacionado (misma categoría)
   - Considera las categorías preferidas del usuario

2. **Envía la notificación push:**
   - Usa `NotificationService` para enviar vía Firebase
   - Obtiene todos los device tokens del usuario
   - Envía la notificación a cada dispositivo

3. **Actualiza el registro:**
   - Cambia `status` de `'pending'` a `'sent'` o `'failed'`
   - Guarda `sent_at`, `quote_id`, `article_id`, `payload`

## 📊 Ejemplo Práctico

### Escenario:
- Usuario: Juan
- Preferencias:
  - `notifications_enabled`: true
  - `preferred_hours`: [8, 12, 18]
  - `timezone`: "America/Mexico_City"
  - `notifications_per_day`: 3

### Línea de Tiempo:

**08:00 AM (México) - El scheduler se ejecuta:**
```
1. Calcula horarios para Juan:
   - 8:00 AM → Ya pasó, programa para mañana
   - 12:00 PM → En 4 horas, programa para hoy
   - 6:00 PM → En 10 horas, programa para hoy

2. Crea 3 registros en notification_deliveries:
   - ID 1: scheduled_at = 2026-01-28 14:00 UTC (mañana 8 AM México)
   - ID 2: scheduled_at = 2026-01-27 18:00 UTC (hoy 12 PM México)
   - ID 3: scheduled_at = 2026-01-28 00:00 UTC (hoy 6 PM México)
```

**12:00 PM (México) - El scheduler se ejecuta:**
```
1. Busca notificaciones pendientes:
   - Encuentra ID 2 (scheduled_at = 18:00 UTC = 12:00 PM México)

2. Crea job SendNotificationJob para ID 2

3. El job:
   - Selecciona una frase y artículo
   - Envía notificación push a los dispositivos de Juan
   - Actualiza status = 'sent'
```

**06:00 PM (México) - El scheduler se ejecuta:**
```
1. Busca notificaciones pendientes:
   - Encuentra ID 3 (scheduled_at = 00:00 UTC = 6:00 PM México)

2. Crea job SendNotificationJob para ID 3
   - Envía otra notificación
```

## 🔧 Componentes del Sistema

### 1. **Scheduler (Laravel Schedule)**
- **Ubicación:** `routes/console.php`
- **Función:** Ejecuta el comando cada minuto
- **Requisito:** Necesita cron configurado

### 2. **Comando ScheduleNotifications**
- **Ubicación:** `app/Console/Commands/ScheduleNotifications.php`
- **Función:** 
  - Programa notificaciones futuras
  - Encuentra notificaciones pendientes y las envía a la cola

### 3. **SchedulingService**
- **Ubicación:** `app/Services/SchedulingService.php`
- **Función:**
  - Calcula horarios de notificaciones según preferencias del usuario
  - Crea registros `NotificationDelivery` con `status = 'pending'`
  - Busca notificaciones que ya deben enviarse

### 4. **SendNotificationJob**
- **Ubicación:** `app/Jobs/SendNotificationJob.php`
- **Función:**
  - Selecciona contenido (quote + article)
  - Envía notificación push vía Firebase
  - Actualiza el estado del delivery

### 5. **NotificationService**
- **Ubicación:** `app/Services/NotificationService.php`
- **Función:** Envía notificaciones push reales vía Firebase Cloud Messaging

## ⚙️ Configuración Necesaria

### 1. Cron del Sistema

Para que el scheduler funcione, necesitas agregar esto al crontab:

```bash
* * * * * cd /path-to-aurea-server && php artisan schedule:run >> /dev/null 2>&1
```

**En desarrollo local:**
```bash
# Ejecutar manualmente para probar:
php artisan schedule:run

# O ejecutar el comando directamente:
php artisan notifications:schedule
```

### 2. Queue Worker

Los jobs se procesan en una cola. Necesitas ejecutar:

```bash
php artisan queue:work
```

**O en desarrollo:**
```bash
php artisan queue:listen
```

## 🎯 Resumen Simple

**El scheduler es como un asistente que:**

1. **Cada minuto revisa:**
   - "¿Qué usuarios quieren notificaciones?"
   - "¿A qué horas las quieren?"
   - "¿Hay alguna notificación que ya debe enviarse?"

2. **Programa notificaciones futuras:**
   - Crea "recordatorios" en la base de datos
   - Cada recordatorio dice: "Enviar notificación a Juan el 27/01/2026 a las 12:00 PM"

3. **Envía notificaciones pendientes:**
   - Cuando llega la hora, crea un "trabajo" en la cola
   - El trabajo selecciona contenido y envía la notificación push

## 🔍 Cómo Verificar que Funciona

### 1. Verificar que el scheduler está corriendo:
```bash
php artisan schedule:list
```

### 2. Ejecutar manualmente:
```bash
php artisan notifications:schedule
```

### 3. Verificar notificaciones programadas:
```sql
SELECT * FROM notification_deliveries 
WHERE status = 'pending' 
ORDER BY scheduled_at;
```

### 4. Verificar jobs en la cola:
```sql
SELECT * FROM jobs;
```

### 5. Ver logs:
```bash
tail -f storage/logs/laravel.log
```

## ⚠️ Importante

- **El scheduler NO envía notificaciones directamente**
- Solo programa y encuentra notificaciones pendientes
- Las notificaciones reales se envían mediante **Jobs en cola**
- Necesitas **dos procesos corriendo:**
  1. `php artisan schedule:run` (o cron)
  2. `php artisan queue:work` (para procesar jobs)
