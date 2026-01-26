# Checklist de Deployment - Sistema Aurea

## Configuración de Base de Datos
- [x] MySQL configurado
- [ ] Variables de entorno configuradas:
  - `DB_CONNECTION=mysql`
  - `DB_HOST=`
  - `DB_PORT=3306`
  - `DB_DATABASE=`
  - `DB_USERNAME=`
  - `DB_PASSWORD=`

## Configuración de Firebase
- [ ] Obtener archivo de credenciales de Firebase (JSON)
- [ ] Colocar en `storage/app/firebase-credentials.json`
- [ ] Configurar variable de entorno:
  - `FIREBASE_CREDENTIALS_PATH=storage/app/firebase-credentials.json`

## Configuración de Colas
- [ ] Configurar driver de colas en `.env`:
  - `QUEUE_CONNECTION=database` (o `redis` para producción)
- [ ] Ejecutar migraciones de colas:
  ```bash
  php artisan migrate
  ```
- [ ] Configurar worker de colas:
  ```bash
  php artisan queue:work --tries=3
  ```
  O usar supervisor/systemd para producción

## Configuración del Scheduler
- [ ] Agregar al crontab:
  ```bash
  * * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
  ```

## Configuración de API
- [ ] Configurar CORS si es necesario
- [ ] Configurar rate limiting
- [ ] Verificar que Sanctum esté funcionando

## Mobile App - Configuración
- [ ] Configurar URL de API en mobile app
- [ ] Configurar Capacitor Push Notifications
- [ ] Obtener tokens FCM/APNs
- [ ] Configurar deep linking

## Testing
- [ ] Probar registro/login de usuarios
- [ ] Probar registro de device tokens
- [ ] Probar actualización de preferencias
- [ ] Probar envío de notificaciones push
- [ ] Probar scheduler de notificaciones
- [ ] Probar deep linking desde notificaciones

## Producción
- [ ] Configurar HTTPS
- [ ] Configurar logs
- [ ] Configurar backups de base de datos
- [ ] Configurar monitoreo
- [ ] Revisar permisos de archivos
- [ ] Optimizar autoloader:
  ```bash
  composer install --optimize-autoloader --no-dev
  ```
- [ ] Cachear configuración:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```

## Variables de Entorno Necesarias

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aurea
DB_USERNAME=root
DB_PASSWORD=

# Firebase
FIREBASE_CREDENTIALS_PATH=storage/app/firebase-credentials.json

# Queue
QUEUE_CONNECTION=database

# App
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Sanctum
SANCTUM_STATEFUL_DOMAINS=your-domain.com
```
