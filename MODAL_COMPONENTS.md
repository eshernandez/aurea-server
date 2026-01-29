# 🎨 Componentes Modales - Reemplazo de alert() y confirm()

## ✅ Componentes Creados

### 1. **ConfirmationDialog** (`components/confirmation-dialog.tsx`)
Componente modal para confirmaciones con botones "Sí" y "No".

**Props:**
- `open: boolean` - Controla si el modal está abierto
- `onClose: () => void` - Función al cerrar
- `onConfirm: () => void` - Función al confirmar
- `title?: string` - Título del modal (default: "Confirmar acción")
- `message: string` - Mensaje a mostrar
- `confirmText?: string` - Texto del botón confirmar (default: "Sí")
- `cancelText?: string` - Texto del botón cancelar (default: "No")
- `confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'` - Color del botón confirmar
- `loading?: boolean` - Si está cargando (deshabilita botones)

**Ejemplo de uso:**
```tsx
const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
});

// Abrir diálogo
setConfirmDialog({
    open: true,
    title: 'Eliminar categoría',
    message: '¿Estás seguro de eliminar esta categoría?',
    confirmColor: 'error',
    onConfirm: () => {
        setConfirmDialog({ ...confirmDialog, open: false });
        // Ejecutar acción
    },
});

// En el JSX
<ConfirmationDialog
    open={confirmDialog.open}
    onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
    onConfirm={confirmDialog.onConfirm}
    title={confirmDialog.title}
    message={confirmDialog.message}
    confirmColor={confirmDialog.confirmColor}
/>
```

### 2. **AlertDialog** (`components/alert-dialog.tsx`)
Componente modal para alertas informativas con botón "Aceptar".

**Props:**
- `open: boolean` - Controla si el modal está abierto
- `onClose: () => void` - Función al cerrar
- `title?: string` - Título del modal (opcional, se genera automáticamente según severity)
- `message: string` - Mensaje a mostrar
- `severity?: 'info' | 'success' | 'error' | 'warning'` - Tipo de alerta (default: 'info')
- `buttonText?: string` - Texto del botón (default: "Aceptar")

**Ejemplo de uso:**
```tsx
const [alertDialog, setAlertDialog] = useState({
    open: false,
    message: '',
    severity: 'error' as 'info' | 'success' | 'error' | 'warning',
});

// Mostrar alerta
setAlertDialog({
    open: true,
    message: 'Por favor, selecciona un archivo de imagen válido.',
    severity: 'error',
});

// En el JSX
<AlertDialog
    open={alertDialog.open}
    onClose={() => setAlertDialog({ ...alertDialog, open: false })}
    message={alertDialog.message}
    severity={alertDialog.severity}
/>
```

## 📋 Archivos Actualizados

### Backend (Admin Panel)

#### 1. **Notifications/Index.tsx**
- ✅ Reemplazados 3 `confirm()` por `ConfirmationDialog`
  - Enviar notificación ahora
  - Reactivar notificación
  - Cancelar notificación

#### 2. **Notifications/Show.tsx**
- ✅ Reemplazados 3 `confirm()` por `ConfirmationDialog`
  - Enviar notificación ahora
  - Reactivar notificación
  - Cancelar notificación

#### 3. **Users/Show.tsx**
- ✅ Reemplazados 2 `confirm()` por `ConfirmationDialog`
  - Activar usuario
  - Desactivar usuario

#### 4. **Categories/Index.tsx**
- ✅ Reemplazado 1 `confirm()` por `ConfirmationDialog`
  - Eliminar categoría

#### 5. **Quotes/Index.tsx**
- ✅ Reemplazado 1 `confirm()` por `ConfirmationDialog`
  - Eliminar frase

#### 6. **Articles/Index.tsx**
- ✅ Reemplazado 1 `confirm()` por `ConfirmationDialog`
  - Eliminar artículo

#### 7. **image-input.tsx**
- ✅ Reemplazados 2 `alert()` por `AlertDialog`
  - Archivo de imagen inválido
  - Imagen excede 5MB

## 🎯 Características

### ConfirmationDialog
- ✅ Icono de advertencia
- ✅ Título personalizable
- ✅ Mensaje personalizable
- ✅ Botones "Sí" y "No" personalizables
- ✅ Color del botón confirmar personalizable
- ✅ Estado de carga (deshabilita botones)
- ✅ Diseño consistente con Material-UI

### AlertDialog
- ✅ Icono según severity (info, success, error, warning)
- ✅ Título automático según severity (o personalizable)
- ✅ Mensaje personalizable
- ✅ Botón "Aceptar" personalizable
- ✅ Color del botón según severity
- ✅ Diseño consistente con Material-UI

## 🔄 Patrón de Uso

### Para Confirmaciones
```tsx
// 1. Estado
const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmColor: 'primary',
});

// 2. Abrir diálogo
const handleAction = () => {
    setConfirmDialog({
        open: true,
        title: 'Título',
        message: '¿Mensaje de confirmación?',
        confirmColor: 'error', // o 'primary', 'warning', 'success', etc.
        onConfirm: () => {
            setConfirmDialog({ ...confirmDialog, open: false });
            // Ejecutar acción aquí
        },
    });
};

// 3. Renderizar
<ConfirmationDialog
    open={confirmDialog.open}
    onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
    onConfirm={confirmDialog.onConfirm}
    title={confirmDialog.title}
    message={confirmDialog.message}
    confirmColor={confirmDialog.confirmColor}
/>
```

### Para Alertas
```tsx
// 1. Estado
const [alertDialog, setAlertDialog] = useState({
    open: false,
    message: '',
    severity: 'error' as 'info' | 'success' | 'error' | 'warning',
});

// 2. Mostrar alerta
const handleError = () => {
    setAlertDialog({
        open: true,
        message: 'Mensaje de error',
        severity: 'error',
    });
};

// 3. Renderizar
<AlertDialog
    open={alertDialog.open}
    onClose={() => setAlertDialog({ ...alertDialog, open: false })}
    message={alertDialog.message}
    severity={alertDialog.severity}
/>
```

## ✅ Beneficios

1. **Mejor UX**: Modales más profesionales y consistentes
2. **Personalizable**: Colores, textos, títulos según necesidad
3. **Accesible**: Componentes Material-UI con mejor accesibilidad
4. **Consistente**: Mismo diseño en toda la aplicación
5. **Responsive**: Se adapta a diferentes tamaños de pantalla
6. **Sin bloqueo**: No bloquea toda la página como `alert()`/`confirm()`

## 📝 Notas

- El único `confirm()` que queda es `confirm().url` en `two-factor-setup-modal.tsx`, que es una función de rutas de Laravel Wayfinder, no el `confirm()` de JavaScript.
- Todos los `alert()` y `confirm()` de JavaScript han sido reemplazados.
- Los componentes usan Material-UI Dialog para consistencia con el resto de la aplicación.
