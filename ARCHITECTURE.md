# Arquitectura del Sistema Aurea

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP (Capacitor)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   React UI   │  │   MUI        │  │  Capacitor   │         │
│  │   Components │  │   Components │  │  Push Plugin │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                 │
│                            │                                    │
│                    ┌───────▼────────┐                          │
│                    │   API Client    │                          │
│                    │  (Auth Token)   │                          │
│                    └───────┬────────┘                          │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTPS/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    LARAVEL BACKEND                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API Routes (/api/v1/*)                                 │   │
│  │  - Auth (Sanctum)                                       │   │
│  │  - User Preferences                                     │   │
│  │  - Home (Quote + Article)                               │   │
│  │  - Notification History                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Admin Routes (Web/Inertia)                              │   │
│  │  - CRUD Quotes                                           │   │
│  │  - CRUD Articles                                         │   │
│  │  - CRUD Categories                                       │   │
│  │  - User Management                                       │   │
│  │  - Metrics Dashboard                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Scheduler (Laravel Cron)                                │   │
│  │  - Every minute: Check scheduled notifications          │   │
│  │  - Dispatch SendNotificationJob                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Queue Workers                                           │   │
│  │  - SendNotificationJob                                   │   │
│  │  - Select quote + article                                │   │
│  │  - Send via FCM/APNs                                    │   │
│  │  - Log delivery                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Services                                                │   │
│  │  - NotificationService (FCM/APNs)                        │   │
│  │  - ContentSelectionService (quote + article matching)   │   │
│  │  - SchedulingService (calculate next notifications)      │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    EXTERNAL SERVICES                              │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Firebase Cloud  │              │  Apple Push      │         │
│  │  Messaging (FCM) │              │  Notification    │         │
│  │                  │              │  Service (APNs)  │         │
│  └──────────────────┘              └──────────────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

## Flujo de Notificaciones

### 1. Programación de Notificaciones
```
Scheduler (cada minuto)
  → Buscar usuarios con notificaciones activas
  → Para cada usuario:
      → Calcular horarios del día (según timezone)
      → Verificar si hay notificación pendiente para este minuto
      → Si sí: Crear NotificationDelivery (scheduled_at)
      → Dispatch SendNotificationJob
```

### 2. Envío de Notificación
```
SendNotificationJob
  → Obtener NotificationDelivery pendiente
  → ContentSelectionService:
      → Obtener categorías preferidas del usuario
      → Seleccionar quote (evitar repetición 7 días)
      → Seleccionar artículo relacionado (misma categoría)
  → NotificationService:
      → Obtener device tokens del usuario
      → Enviar push via FCM/APNs
      → Actualizar NotificationDelivery (sent_at, status, payload)
```

### 3. Recepción en Mobile
```
Push Notification recibida
  → Capacitor maneja la notificación
  → Si app está abierta: mostrar en-app
  → Si app está cerrada: mostrar sistema
  → Al tocar: Deep link a pantalla de detalle
  → Mostrar quote + article exactos enviados
```

## Modelo de Datos

### Tablas Principales

1. **users** (existente, extender)
   - id, name, email, password, email_verified_at, created_at, updated_at

2. **user_preferences**
   - id, user_id, timezone, notifications_enabled, notifications_per_day, preferred_hours (JSON), preferred_categories (JSON), created_at, updated_at

3. **categories**
   - id, name, slug, description, is_active, created_at, updated_at

4. **quotes**
   - id, text, author (nullable), category_id, is_active, created_at, updated_at

5. **articles**
   - id, title, content, summary, category_id, image_url (nullable), is_active, created_at, updated_at

6. **device_tokens**
   - id, user_id, platform (android/ios), token, last_seen_at, created_at, updated_at

7. **notification_deliveries**
   - id, user_id, quote_id, article_id, scheduled_at, sent_at (nullable), status (pending/sent/failed), error_message (nullable), payload (JSON), created_at, updated_at

8. **quote_user_history** (para evitar repeticiones)
   - id, user_id, quote_id, sent_at, created_at

## Decisiones de Diseño

### Zona Horaria
- Se guarda en `user_preferences.timezone` (ej: "America/Mexico_City")
- Se usa Carbon para convertir horarios al timezone del usuario
- Horarios preferidos se guardan como array de horas (ej: [8, 12, 18]) o ventanas (ej: [{"start": "08:00", "end": "10:00"}])

### Horarios Preferidos
- Opción 1: Array simple de horas [8, 12, 18] → notificaciones a las 8:00, 12:00, 18:00
- Opción 2: Ventanas horarias [{"start": "08:00", "end": "10:00"}] → notificación aleatoria en la ventana
- **Decisión inicial**: Array simple de horas (más fácil de implementar)

### Selección de Contenido
- Si usuario tiene categorías preferidas → usar esas
- Si no → usar categoría "general" o aleatoria
- Evitar repetir quote al mismo usuario por 7 días
- Relación quote-article: misma categoría (automática)

### Notificaciones Push
- Android: FCM directamente
- iOS: FCM (que maneja APNs internamente)
- Payload incluye: quote_id, article_id para deep linking
