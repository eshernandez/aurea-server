# 🔥 Configuración de Firebase Cloud Messaging (FCM)

## ✅ Estado Actual

La implementación de Firebase Cloud Messaging está **completamente configurada** y lista para usar.

## 📁 Archivos y Ubicaciones

### Credenciales de Firebase
- **Ubicación:** `storage/app/firebase-credentials.json`
- **Configuración:** `.env` → `FIREBASE_CREDENTIALS_PATH=storage/app/firebase-credentials.json`
- **Estado:** ✅ Configurado

### Servicio de Notificaciones
- **Archivo:** `app/Services/NotificationService.php`
- **Estado:** ✅ Implementado con soporte completo para iOS y Android

## 🚀 Características Implementadas

### 1. **Soporte Multi-Plataforma**
- ✅ **Android (FCM)**: Configuración específica con prioridad alta y canal de notificaciones
- ✅ **iOS (APNs)**: Configuración específica con badge, sonido y content-available
- ✅ **Detección automática** de plataforma basada en `device_tokens.platform`

### 2. **Manejo de Errores Robusto**
- ✅ **Detección automática** de tokens inválidos
- ✅ **Limpieza automática** de tokens no registrados
- ✅ **Logging detallado** para debugging
- ✅ **Manejo de excepciones** específicas de Firebase

### 3. **Funcionalidades Avanzadas**
- ✅ **Notificaciones con imágenes** (soporte para `imageUrl`)
- ✅ **Datos personalizados** en notificaciones (payload)
- ✅ **Envío en batch** a múltiples usuarios
- ✅ **Actualización automática** de `last_seen_at` en tokens

### 4. **Validación y Limpieza**
- ✅ **Comando de limpieza**: `php artisan notifications:cleanup-tokens`
- ✅ **Detección de tokens inválidos** durante el envío
- ✅ **Eliminación automática** de tokens no válidos

## 📋 Métodos Disponibles

### `NotificationService`

#### `sendNotification(User $user, string $title, string $body, array $data = [], ?string $imageUrl = null): array`
Envía una notificación push a todos los dispositivos de un usuario.

**Parámetros:**
- `$user`: Usuario destinatario
- `$title`: Título de la notificación
- `$body`: Cuerpo de la notificación (máx. 100 caracteres recomendado)
- `$data`: Array de datos personalizados (opcional)
- `$imageUrl`: URL de imagen para la notificación (opcional)

**Retorna:**
```php
[
    'success' => bool,
    'message' => string,
    'success_count' => int,
    'failure_count' => int,
    'invalid_tokens' => array
]
```

#### `sendQuoteAndArticleNotification(User $user, Quote $quote, Article $article): bool`
Envía una notificación con una frase y artículo.

**Retorna:** `true` si se envió exitosamente a al menos un dispositivo.

#### `sendBatchNotification(array $users, string $title, string $body, array $data = []): array`
Envía notificaciones a múltiples usuarios en batch.

**Retorna:**
```php
[
    'total_users' => int,
    'successful_users' => int,
    'failed_users' => int,
    'total_devices' => int,
    'successful_devices' => int,
    'failed_devices' => int
]
```

#### `cleanupInvalidTokens(): array`
Limpia tokens inválidos de la base de datos.

**Retorna:**
```php
[
    'checked' => int,
    'removed' => int,
    'message' => string
]
```

#### `isConfigured(): bool`
Verifica si Firebase está correctamente configurado.

## 🔧 Configuración de Plataformas

### Android
```php
AndroidConfig::fromArray([
    'priority' => 'high',
    'notification' => [
        'sound' => 'default',
        'channel_id' => 'aurea_notifications',
    ],
])
```

### iOS
```php
ApnsConfig::fromArray([
    'headers' => [
        'apns-priority' => '10',
    ],
    'payload' => [
        'aps' => [
            'sound' => 'default',
            'badge' => 1,
            'content-available' => 1,
        ],
    ],
])
```

## 📝 Ejemplo de Uso

### Envío Simple
```php
use App\Services\NotificationService;
use App\Models\User;

$notificationService = app(NotificationService::class);
$user = User::find(1);

$result = $notificationService->sendNotification(
    $user,
    'Título de la notificación',
    'Cuerpo de la notificación',
    ['custom_key' => 'custom_value']
);

if ($result['success']) {
    echo "Enviado a {$result['success_count']} dispositivo(s)";
}
```

### Envío con Quote y Article
```php
$quote = Quote::find(1);
$article = Article::find(1);

$success = $notificationService->sendQuoteAndArticleNotification(
    $user,
    $quote,
    $article
);
```

## 🧹 Comandos Artisan

### Limpiar Tokens Inválidos
```bash
php artisan notifications:cleanup-tokens
```

Este comando:
- Verifica todos los tokens en la base de datos
- Identifica tokens inválidos
- Los elimina automáticamente
- Muestra un resumen de la operación

## 🔍 Logging

El servicio registra automáticamente:

- ✅ **Inicialización exitosa** de Firebase
- ✅ **Notificaciones enviadas** exitosamente
- ⚠️ **Tokens inválidos** detectados y removidos
- ❌ **Errores** durante el envío
- 📊 **Estadísticas** de envío (éxitos/fallos)

**Ubicación de logs:** `storage/logs/laravel.log`

## ⚠️ Errores Comunes y Soluciones

### 1. "Firebase credentials not found"
**Solución:** Verifica que `storage/app/firebase-credentials.json` existe y que `FIREBASE_CREDENTIALS_PATH` en `.env` está correcto.

### 2. "Invalid token" o "Token not registered"
**Solución:** El token es inválido (usuario desinstaló la app, token expirado). Se elimina automáticamente.

### 3. "No device tokens found"
**Solución:** El usuario no tiene tokens registrados. Asegúrate de que la app móvil esté registrando tokens correctamente.

## 🧪 Testing

### Modo Desarrollo (Sin Firebase)
Si Firebase no está configurado, el servicio funciona en **modo log-only**:
- Las notificaciones se registran en los logs
- No se envían realmente
- Útil para desarrollo sin credenciales

### Verificar Configuración
```php
$notificationService = app(NotificationService::class);

if ($notificationService->isConfigured()) {
    echo "Firebase está configurado correctamente";
} else {
    echo "Firebase no está configurado";
}
```

## 📊 Integración con el Sistema

### Flujo Completo

1. **Scheduler** (`notifications:schedule`)
   - Programa notificaciones futuras
   - Encuentra notificaciones pendientes
   - Crea `SendNotificationJob`

2. **Queue Worker** (`php artisan queue:work`)
   - Procesa `SendNotificationJob`
   - Selecciona contenido (quote + article)
   - Llama a `NotificationService::sendQuoteAndArticleNotification`

3. **NotificationService**
   - Obtiene tokens del usuario
   - Envía notificaciones push vía FCM
   - Actualiza estados y limpia tokens inválidos

## 🔐 Seguridad

- ✅ Credenciales almacenadas en `storage/app/` (no accesible públicamente)
- ✅ Tokens de dispositivos encriptados en base de datos
- ✅ Validación de tokens antes de enviar
- ✅ Limpieza automática de tokens inválidos

## 📚 Recursos

- **Documentación Firebase PHP SDK:** https://firebase-php.readthedocs.io/
- **Documentación FCM:** https://firebase.google.com/docs/cloud-messaging
- **Documentación APNs:** https://developer.apple.com/documentation/usernotifications

## ✅ Checklist de Deployment

- [x] Credenciales de Firebase en `storage/app/firebase-credentials.json`
- [x] Variable `FIREBASE_CREDENTIALS_PATH` en `.env`
- [x] Paquete `kreait/firebase-php` instalado
- [x] `NotificationService` implementado
- [x] Comando de limpieza creado
- [x] Logging configurado
- [ ] Probar envío real en Android
- [ ] Probar envío real en iOS
- [ ] Configurar APNs en Firebase Console (para iOS)

## 🎯 Próximos Pasos

1. **Probar notificaciones en Android:**
   - Registrar un device token desde la app móvil
   - Ejecutar `php artisan notifications:schedule`
   - Verificar que la notificación llegue

2. **Configurar APNs para iOS:**
   - Subir certificado `.p8` en Firebase Console
   - Configurar Key ID y Team ID
   - Probar envío en dispositivo iOS real

3. **Monitoreo:**
   - Revisar logs regularmente
   - Ejecutar `notifications:cleanup-tokens` periódicamente
   - Monitorear tasa de éxito/fallo
