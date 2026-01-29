# 📬 Módulo de Administración de Notificaciones

## ✅ Funcionalidades Implementadas

### 1. **Listado de Notificaciones** (`/admin/notifications`)
- ✅ Tabla con todas las notificaciones
- ✅ Filtros por:
  - Estado (pending, sent, failed)
  - Usuario
  - Rango de fechas (desde/hasta)
  - Búsqueda por nombre/email de usuario
- ✅ Ordenamiento por columna
- ✅ Paginación
- ✅ Acciones rápidas desde la tabla

### 2. **Detalle de Notificación** (`/admin/notifications/{id}`)
- ✅ Información completa de la notificación
- ✅ Datos del usuario
- ✅ Contenido (frase y artículo)
- ✅ Historial de estados
- ✅ Acciones disponibles según el estado

### 3. **Enviar Notificación Ahora**
- ✅ **Ruta:** `POST /admin/notifications/{id}/send-now`
- ✅ Usa el `SendNotificationJob` para procesar
- ✅ Selecciona contenido automáticamente si no está seleccionado
- ✅ Cambia el estado a `sent` después del envío
- ✅ Sale del listado de `pending` inmediatamente

### 4. **Reactivar Notificación**
- ✅ **Ruta:** `POST /admin/notifications/{id}/reactivate`
- ✅ Vuelve el estado a `pending`
- ✅ Limpia `sent_at` y `error_message`
- ✅ Si la fecha programada ya pasó, la actualiza a `now()`
- ✅ Limpia `cancelled_at` si existe
- ✅ El scheduler la tomará en la siguiente ejecución

### 5. **Cancelar para Hoy**
- ✅ **Ruta:** `POST /admin/notifications/{id}/cancel`
- ✅ Marca `cancelled_at` con la fecha/hora actual
- ✅ El scheduler **NO** procesará notificaciones canceladas para hoy
- ✅ **Mañana se programará nuevamente** (el scheduler crea nuevas notificaciones)

## 🔧 Implementación Técnica

### Base de Datos

#### Migración: `add_cancelled_at_to_notification_deliveries_table`
```php
$table->timestamp('cancelled_at')->nullable()->after('sent_at');
```

### Modelo: `NotificationDelivery`
- ✅ Campo `cancelled_at` agregado a `$fillable`
- ✅ Cast a `datetime` agregado

### Controlador: `NotificationController`
- ✅ `index()` - Listar con filtros y búsqueda
- ✅ `show()` - Ver detalle completo
- ✅ `sendNow()` - Enviar ahora usando job
- ✅ `reactivate()` - Volver a pending
- ✅ `cancel()` - Cancelar para hoy

### Servicio: `SchedulingService`
- ✅ Actualizado `getPendingNotifications()` para excluir notificaciones canceladas para hoy
- ✅ Lógica: Si `cancelled_at` existe y es del mismo día que `scheduled_at`, se excluye

### Rutas Admin
```php
Route::get('notifications', [NotificationController::class, 'index']);
Route::get('notifications/{notification}', [NotificationController::class, 'show']);
Route::post('notifications/{notification}/send-now', [NotificationController::class, 'sendNow']);
Route::post('notifications/{notification}/reactivate', [NotificationController::class, 'reactivate']);
Route::post('notifications/{notification}/cancel', [NotificationController::class, 'cancel']);
```

### Vistas React (Inertia)

#### `Admin/Notifications/Index.tsx`
- ✅ Tabla con todas las notificaciones
- ✅ Filtros en tiempo real
- ✅ Acciones rápidas (ver, enviar, reactivar, cancelar)
- ✅ Paginación
- ✅ Snackbar para mensajes

#### `Admin/Notifications/Show.tsx`
- ✅ Vista detallada completa
- ✅ Información del usuario
- ✅ Contenido (frase y artículo)
- ✅ Historial y estados
- ✅ Botones de acción según estado

### Sidebar
- ✅ Link "Notificaciones" agregado al menú admin
- ✅ Icono: Bell (lucide-react)

## 📋 Flujo de Funcionamiento

### Enviar Ahora
```
1. Admin hace clic en "Enviar Ahora"
2. Se verifica que esté en estado "pending"
3. Si no tiene contenido, se selecciona automáticamente
4. Se despacha SendNotificationJob
5. El job procesa y envía la notificación
6. Estado cambia a "sent"
7. Sale del listado de pending
```

### Reactivar
```
1. Admin hace clic en "Reactivar"
2. Se verifica que esté en estado "sent" o "failed"
3. Estado cambia a "pending"
4. Se limpia sent_at, error_message, cancelled_at
5. Si scheduled_at ya pasó, se actualiza a now()
6. El scheduler la tomará en la siguiente ejecución
```

### Cancelar para Hoy
```
1. Admin hace clic en "Cancelar para Hoy"
2. Se verifica que esté en estado "pending"
3. Se marca cancelled_at = now()
4. El scheduler NO procesará esta notificación hoy
5. Mañana, el scheduler creará nuevas notificaciones
   (las canceladas no se reprograman, se crean nuevas)
```

## 🎯 Casos de Uso

### Caso 1: Enviar Notificación Urgente
- Admin ve una notificación pendiente
- Hace clic en "Enviar Ahora"
- La notificación se envía inmediatamente
- Sale del listado de pending

### Caso 2: Reintentar Notificación Fallida
- Una notificación falló (status: "failed")
- Admin revisa el error
- Hace clic en "Reactivar"
- Vuelve a pending y el scheduler la procesará

### Caso 3: Cancelar Notificación para Hoy
- Admin quiere cancelar una notificación programada para hoy
- Hace clic en "Cancelar para Hoy"
- La notificación no se enviará hoy
- Mañana se creará una nueva (el scheduler programa diariamente)

## ⚠️ Notas Importantes

1. **Cancelación vs Eliminación:**
   - Cancelar solo afecta el día actual
   - No elimina la notificación
   - Mañana se crean nuevas notificaciones automáticamente

2. **Envío Directo:**
   - Usa el mismo job que el scheduler
   - Selecciona contenido si no está seleccionado
   - Respeta las preferencias del usuario

3. **Reactivación:**
   - Limpia todos los campos relacionados con el envío
   - Actualiza la fecha si ya pasó
   - El scheduler la procesará normalmente

4. **Scheduler:**
   - Respeta las cancelaciones del día actual
   - Crea nuevas notificaciones diariamente
   - Las canceladas no se reprograman, se crean nuevas

## 🚀 Uso

### Acceder al Módulo
1. Iniciar sesión como admin
2. Ir a `/admin/notifications`
3. Ver listado de notificaciones

### Filtrar Notificaciones
- Usar los filtros en la parte superior
- Buscar por nombre/email de usuario
- Filtrar por estado, fecha, etc.

### Ver Detalle
- Hacer clic en el ícono de "Ver" o en el ID
- Ver información completa
- Realizar acciones desde el detalle

### Acciones Disponibles

**Para notificaciones "pending":**
- ✅ Enviar Ahora
- ✅ Cancelar para Hoy
- ✅ Ver Detalle

**Para notificaciones "sent" o "failed":**
- ✅ Reactivar
- ✅ Ver Detalle

## 📝 Próximos Pasos (Opcionales)

- [ ] Agregar estadísticas de notificaciones
- [ ] Exportar listado a CSV/Excel
- [ ] Notificaciones masivas
- [ ] Programar notificaciones manualmente
- [ ] Historial de cambios de estado
