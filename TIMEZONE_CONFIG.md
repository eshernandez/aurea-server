# ⏰ Configuración de Zona Horaria

## ✅ Cambios Realizados

### 1. **Timezone por Defecto del Servidor**
- **Archivo:** `config/app.php`
- **Cambio:** `'timezone' => 'America/Bogota'` (Colombia)
- **Antes:** `'UTC'`

### 2. **Defaults en Controladores**
Actualizados para usar `America/Bogota` como default:

- **`UserPreferenceController`**: Al crear preferencias nuevas
- **`AuthController`**: Al registrar nuevos usuarios
- **`SchedulingService`**: Fallback cuando no hay timezone en preferencias

### 3. **Migración de Base de Datos**
- **Archivo:** `database/migrations/2026_01_22_200806_create_user_preferences_table.php`
- **Cambio:** `default('America/Bogota')` en lugar de `default('UTC')`

### 4. **App Móvil - Selector de Timezones**
- **Archivo:** `aurea-mobile/src/utils/timezones.ts`
- **Lista completa** de timezones reconocidos con:
  - País
  - Ciudad
  - Offset UTC
  - Organizados por región

- **Archivo:** `aurea-mobile/src/pages/Settings.tsx`
- **Cambio:** Reemplazado `TextField` por `Select` con lista de timezones
- **Mejora UX:** Muestra país, ciudad y offset UTC

## 📋 Timezones Disponibles

### América del Norte
- New York, Estados Unidos (UTC-5/UTC-4)
- Chicago, Estados Unidos (UTC-6/UTC-5)
- Los Angeles, Estados Unidos (UTC-8/UTC-7)
- Ciudad de México, México (UTC-6)
- Toronto, Canadá (UTC-5/UTC-4)

### América Central y Caribe
- Guatemala, Guatemala (UTC-6)
- San Salvador, El Salvador (UTC-6)
- Managua, Nicaragua (UTC-6)
- San José, Costa Rica (UTC-6)
- Panamá, Panamá (UTC-5)
- La Habana, Cuba (UTC-5)
- Santo Domingo, República Dominicana (UTC-4)

### América del Sur
- **Bogotá, Colombia (UTC-5)** ⭐ Default
- Lima, Perú (UTC-5)
- Caracas, Venezuela (UTC-4)
- La Paz, Bolivia (UTC-4)
- Quito, Ecuador (UTC-5)
- Santiago, Chile (UTC-3/UTC-4)
- Buenos Aires, Argentina (UTC-3)
- São Paulo, Brasil (UTC-3)
- Y más...

### Europa
- Londres, Reino Unido (UTC+0/UTC+1)
- París, Francia (UTC+1/UTC+2)
- Madrid, España (UTC+1/UTC+2)
- Roma, Italia (UTC+1/UTC+2)
- Berlín, Alemania (UTC+1/UTC+2)
- Y más...

### Asia, Oceanía, y más
- Incluye principales ciudades de Asia, Oceanía y otras regiones

## 🔍 Verificar Hora del Servidor

### Opción 1: Comando PHP
```bash
php -r "echo 'Server time: ' . date('Y-m-d H:i:s') . PHP_EOL; echo 'Timezone: ' . date_default_timezone_get() . PHP_EOL;"
```

### Opción 2: Artisan Tinker
```bash
php artisan tinker
# Luego:
now() // Hora actual del servidor
config('app.timezone') // Timezone configurado
now('America/Bogota') // Hora en Colombia
```

### Opción 3: Crear comando personalizado
```bash
php artisan make:command ShowServerTime
```

## 📱 App Móvil

### Antes
- Campo de texto libre donde el usuario debía escribir el timezone
- Ejemplo: "America/Mexico_City"
- Propenso a errores de escritura

### Ahora
- Selector dropdown con lista completa de timezones
- Muestra: "Ciudad, País - UTC Offset"
- Ejemplo: "Bogotá, Colombia - UTC-5"
- Más fácil de usar y sin errores

## 🎯 Comportamiento

### Nuevos Usuarios
- Al registrarse, se les asigna `America/Bogota` por defecto
- Pueden cambiarlo desde Settings en la app móvil

### Usuarios Existentes
- Mantienen su timezone actual
- Pueden cambiarlo desde Settings si lo desean

### Notificaciones
- Se programan según el timezone del usuario
- Si el timezone es inválido, se usa `America/Bogota` como fallback

## 🔧 Archivos Modificados

### Backend
- `config/app.php`
- `app/Http/Controllers/Api/V1/UserPreferenceController.php`
- `app/Http/Controllers/Api/V1/AuthController.php`
- `app/Services/SchedulingService.php`
- `database/migrations/2026_01_22_200806_create_user_preferences_table.php`

### Frontend (Mobile)
- `src/utils/timezones.ts` (nuevo)
- `src/pages/Settings.tsx`

## ⚠️ Nota Importante

Si ya tienes usuarios en producción con `UTC` como timezone, puedes:

1. **Dejarlos como están** - Funcionará correctamente
2. **Actualizar masivamente** - Crear un comando para cambiar todos a `America/Bogota`
3. **Actualizar solo nuevos usuarios** - Los existentes mantienen su configuración

## 🧪 Testing

1. **Verificar timezone del servidor:**
   ```bash
   php artisan tinker
   # Ver: now(), config('app.timezone')
   ```

2. **Probar registro de nuevo usuario:**
   - Debe tener `America/Bogota` por defecto

3. **Probar selector en app móvil:**
   - Abrir Settings
   - Verificar que el selector muestre la lista de timezones
   - Seleccionar un timezone diferente
   - Guardar y verificar que se actualice

4. **Probar programación de notificaciones:**
   - Cambiar timezone del usuario
   - Ejecutar `php artisan notifications:schedule`
   - Verificar que las fechas se calculen correctamente según el nuevo timezone
