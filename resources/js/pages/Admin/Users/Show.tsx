import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Button,
    Chip,
    Grid,
    Divider,
    Stack,
    Snackbar,
    Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import ConfirmationDialog from '@/components/confirmation-dialog';

interface UserPreference {
    id: number;
    timezone: string;
    notifications_enabled: boolean;
    notifications_per_day: number;
    preferred_hours: number[];
    preferred_categories: number[] | null;
}

interface DeviceToken {
    id: number;
    platform: string;
    last_seen_at: string | null;
}

interface NotificationDelivery {
    id: number;
    status: string;
    sent_at: string | null;
    quote: {
        text: string;
    };
    article: {
        title: string;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    email_verified_at: string | null;
    created_at: string;
    preferences?: UserPreference;
    device_tokens?: DeviceToken[];
    notification_deliveries?: NotificationDelivery[];
}

interface Stats {
    total_notifications: number;
    sent_notifications: number;
    failed_notifications: number;
    device_tokens_count: number;
}

interface Props {
    user: User;
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Usuarios',
        href: '/admin/users',
    },
    {
        title: 'Detalles',
        href: '#',
    },
];

export default function UsersShow({ user, stats }: Props) {
    const { flash } = usePage().props as any;
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' | 'error' });
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    }>({
        open: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    useEffect(() => {
        if (flash?.success) {
            setSnackbar({ open: true, message: flash.success, severity: 'success' });
        } else if (flash?.info) {
            setSnackbar({ open: true, message: flash.info, severity: 'info' });
        } else if (flash?.error) {
            setSnackbar({ open: true, message: flash.error, severity: 'error' });
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                            {user.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Detalles del usuario
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        {!user.email_verified_at ? (
                            <Button
                                onClick={() => {
                                    setConfirmDialog({
                                        open: true,
                                        title: 'Activar usuario',
                                        message: '¿Estás seguro de activar este usuario? Esto verificará su correo electrónico.',
                                        confirmColor: 'success',
                                        onConfirm: () => {
                                            setConfirmDialog({ ...confirmDialog, open: false });
                                            router.post(`/admin/users/${user.id}/activate`, {}, {
                                                preserveScroll: true,
                                            });
                                        },
                                    });
                                }}
                                variant="contained"
                                color="success"
                                sx={{ textTransform: 'none' }}
                            >
                                Activar Usuario
                            </Button>
                        ) : (
                            <Button
                                onClick={() => {
                                    setConfirmDialog({
                                        open: true,
                                        title: 'Desactivar usuario',
                                        message: '¿Estás seguro de desactivar este usuario? Esto eliminará la verificación de su correo electrónico.',
                                        confirmColor: 'error',
                                        onConfirm: () => {
                                            setConfirmDialog({ ...confirmDialog, open: false });
                                            router.post(`/admin/users/${user.id}/deactivate`, {}, {
                                                preserveScroll: true,
                                            });
                                        },
                                    });
                                }}
                                variant="contained"
                                color="error"
                                sx={{ textTransform: 'none' }}
                            >
                                Desactivar Usuario
                            </Button>
                        )}
                        <Button
                            component={Link}
                            href="/admin/users"
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Volver
                        </Button>
                    </Stack>
                </Box>

                {/* User Info */}
                <Card sx={{ mb: 3 }}>
                    <CardHeader
                        title={
                            <Typography variant="h6" fontWeight={600}>
                                Información del Usuario
                            </Typography>
                        }
                    />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Nombre
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                    {user.name}
                                </Typography>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Email
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                    {user.email}
                                </Typography>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Estado de Verificación
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    {user.email_verified_at ? (
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label="Correo Verificado"
                                            color="success"
                                            size="small"
                                        />
                                    ) : (
                                        <Chip
                                            icon={<CancelIcon />}
                                            label="Pendiente de Verificación"
                                            color="warning"
                                            size="small"
                                        />
                                    )}
                                </Box>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Tipo
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                        label={user.is_admin ? 'Administrador' : 'Usuario'}
                                        color={user.is_admin ? 'primary' : 'default'}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Registrado
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                    {new Date(user.created_at).toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Preferences */}
                {user.preferences && (
                    <Card sx={{ mb: 3 }}>
                        <CardHeader
                            title={
                                <Typography variant="h6" fontWeight={600}>
                                    Preferencias
                                </Typography>
                            }
                        />
                        <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Zona Horaria
                                    </Typography>
                                    <Typography variant="body1" sx={{ mt: 0.5 }}>
                                        {user.preferences.timezone}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Notificaciones
                                    </Typography>
                                    <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2">Estado:</Typography>
                                            <Chip
                                                label={
                                                    user.preferences.notifications_enabled
                                                        ? 'Activas'
                                                        : 'Desactivadas'
                                                }
                                                color={user.preferences.notifications_enabled ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </Box>
                                        <Typography variant="body2">
                                            Por día: {user.preferences.notifications_per_day}
                                        </Typography>
                                        {user.preferences.preferred_hours &&
                                            user.preferences.preferred_hours.length > 0 && (
                                                <Typography variant="body2">
                                                    Horarios: {user.preferences.preferred_hours.join(', ')}
                                                </Typography>
                                            )}
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Statistics */}
                <Card sx={{ mb: 3 }}>
                    <CardHeader
                        title={
                            <Typography variant="h6" fontWeight={600}>
                                Estadísticas
                            </Typography>
                        }
                    />
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Total Notificaciones
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                                        {stats.total_notifications}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Enviadas
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
                                        {stats.sent_notifications}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Fallidas
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>
                                        {stats.failed_notifications}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Dispositivos
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                                        {stats.device_tokens_count}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Recent Notifications */}
                {user.notification_deliveries && user.notification_deliveries.length > 0 && (
                    <Card>
                        <CardHeader
                            title={
                                <Typography variant="h6" fontWeight={600}>
                                    Notificaciones Recientes
                                </Typography>
                            }
                        />
                        <CardContent>
                            <Stack spacing={2}>
                                {user.notification_deliveries.map((notification) => (
                                    <Box
                                        key={notification.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            pb: 2,
                                            borderBottom: 1,
                                            borderColor: 'divider',
                                            '&:last-child': {
                                                borderBottom: 0,
                                                pb: 0,
                                            },
                                        }}
                                    >
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                                {notification.quote.text.substring(0, 80)}...
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {notification.article.title}
                                            </Typography>
                                            {notification.sent_at && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                    {new Date(notification.sent_at).toLocaleString()}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Chip
                                            label={notification.status}
                                            color={
                                                notification.status === 'sent'
                                                    ? 'success'
                                                    : notification.status === 'failed'
                                                      ? 'error'
                                                      : 'default'
                                            }
                                            size="small"
                                            sx={{ ml: 2 }}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                {/* Snackbar for flash messages */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>

                <ConfirmationDialog
                    open={confirmDialog.open}
                    onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                    onConfirm={confirmDialog.onConfirm}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmColor={confirmDialog.confirmColor}
                />
            </Container>
        </AppLayout>
    );
}
