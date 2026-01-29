import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
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
    Stack,
    Divider,
    Snackbar,
    Alert,
    Grid,
    Paper,
} from '@mui/material';
import { useState, useEffect } from 'react';
import {
    ArrowBack as ArrowBackIcon,
    Send as SendIcon,
    Refresh as RefreshIcon,
    Cancel as CancelIcon,
} from '@mui/icons-material';
import ConfirmationDialog from '@/components/confirmation-dialog';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Quote {
    id: number;
    text: string;
    author?: string;
}

interface Article {
    id: number;
    title: string;
    content: string;
    summary?: string;
}

interface NotificationDelivery {
    id: number;
    user_id: number;
    quote_id: number;
    article_id: number;
    scheduled_at: string;
    sent_at: string | null;
    cancelled_at: string | null;
    status: 'pending' | 'sent' | 'failed';
    error_message: string | null;
    payload: any;
    created_at: string;
    updated_at: string;
    user?: User;
    quote?: Quote;
    article?: Article;
}

interface Props {
    notification: NotificationDelivery;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Notificaciones',
        href: '/admin/notifications',
    },
    {
        title: 'Detalle',
        href: '#',
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'sent':
            return 'success';
        case 'failed':
            return 'error';
        case 'pending':
            return 'warning';
        default:
            return 'default';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'sent':
            return 'Enviada';
        case 'failed':
            return 'Fallida';
        case 'pending':
            return 'Pendiente';
        default:
            return status;
    }
};

export default function NotificationsShow({ notification }: Props) {
    const { flash } = usePage().props as any;
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
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
        } else if (flash?.error) {
            setSnackbar({ open: true, message: flash.error, severity: 'error' });
        }
    }, [flash]);

    const handleSendNow = () => {
        setConfirmDialog({
            open: true,
            title: 'Enviar notificación',
            message: '¿Estás seguro de enviar esta notificación ahora?',
            confirmColor: 'primary',
            onConfirm: () => {
                setConfirmDialog({ ...confirmDialog, open: false });
                router.post(`/admin/notifications/${notification.id}/send-now`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSnackbar({ open: true, message: 'Notificación enviada', severity: 'success' });
                    },
                });
            },
        });
    };

    const handleReactivate = () => {
        setConfirmDialog({
            open: true,
            title: 'Reactivar notificación',
            message: '¿Estás seguro de reactivar esta notificación?',
            confirmColor: 'success',
            onConfirm: () => {
                setConfirmDialog({ ...confirmDialog, open: false });
                router.post(`/admin/notifications/${notification.id}/reactivate`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSnackbar({ open: true, message: 'Notificación reactivada', severity: 'success' });
                    },
                });
            },
        });
    };

    const handleCancel = () => {
        setConfirmDialog({
            open: true,
            title: 'Cancelar notificación',
            message: '¿Estás seguro de cancelar esta notificación para hoy?',
            confirmColor: 'warning',
            onConfirm: () => {
                setConfirmDialog({ ...confirmDialog, open: false });
                router.post(`/admin/notifications/${notification.id}/cancel`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSnackbar({ open: true, message: 'Notificación cancelada para hoy', severity: 'success' });
                    },
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Notificación #${notification.id}`} />

            <Container maxWidth="lg">
                <Box sx={{ py: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Button
                            component={Link}
                            href="/admin/notifications"
                            startIcon={<ArrowBackIcon />}
                            variant="outlined"
                        >
                            Volver
                        </Button>
                        <Typography variant="h4">Notificación #{notification.id}</Typography>
                        <Chip
                            label={getStatusLabel(notification.status)}
                            color={getStatusColor(notification.status) as any}
                            size="medium"
                        />
                    </Stack>

                    <Grid container spacing={3}>
                        {/* Información General */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardHeader title="Información General" />
                                <CardContent>
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Estado
                                            </Typography>
                                            <Typography variant="body1">
                                                <Chip
                                                    label={getStatusLabel(notification.status)}
                                                    color={getStatusColor(notification.status) as any}
                                                    size="small"
                                                />
                                            </Typography>
                                        </Box>

                                        <Divider />

                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Fecha Programada
                                            </Typography>
                                            <Typography variant="body1">
                                                {new Date(notification.scheduled_at).toLocaleString('es-ES', {
                                                    dateStyle: 'full',
                                                    timeStyle: 'long',
                                                })}
                                            </Typography>
                                        </Box>

                                        {notification.sent_at && (
                                            <>
                                                <Divider />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Fecha de Envío
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {new Date(notification.sent_at).toLocaleString('es-ES', {
                                                            dateStyle: 'full',
                                                            timeStyle: 'long',
                                                        })}
                                                    </Typography>
                                                </Box>
                                            </>
                                        )}

                                        {notification.cancelled_at && (
                                            <>
                                                <Divider />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Cancelada el
                                                    </Typography>
                                                    <Typography variant="body1" color="warning.main">
                                                        {new Date(notification.cancelled_at).toLocaleString('es-ES', {
                                                            dateStyle: 'full',
                                                            timeStyle: 'long',
                                                        })}
                                                    </Typography>
                                                </Box>
                                            </>
                                        )}

                                        {notification.error_message && (
                                            <>
                                                <Divider />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Mensaje de Error
                                                    </Typography>
                                                    <Typography variant="body1" color="error.main">
                                                        {notification.error_message}
                                                    </Typography>
                                                </Box>
                                            </>
                                        )}

                                        <Divider />

                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Creada
                                            </Typography>
                                            <Typography variant="body1">
                                                {new Date(notification.created_at).toLocaleString('es-ES')}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Usuario */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardHeader title="Usuario" />
                                <CardContent>
                                    {notification.user ? (
                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Nombre
                                                </Typography>
                                                <Typography variant="body1">{notification.user.name}</Typography>
                                            </Box>
                                            <Divider />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    Email
                                                </Typography>
                                                <Typography variant="body1">{notification.user.email}</Typography>
                                            </Box>
                                            <Button
                                                component={Link}
                                                href={`/admin/users/${notification.user.id}`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ mt: 2 }}
                                            >
                                                Ver Usuario
                                            </Button>
                                        </Stack>
                                    ) : (
                                        <Typography color="text.secondary">Usuario no encontrado</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Contenido - Frase */}
                        <Grid item xs={12}>
                            <Card>
                                <CardHeader title="Frase" />
                                <CardContent>
                                    {notification.quote ? (
                                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                                            <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 1 }}>
                                                "{notification.quote.text}"
                                            </Typography>
                                            {notification.quote.author && (
                                                <Typography variant="caption" color="text.secondary" align="right">
                                                    — {notification.quote.author}
                                                </Typography>
                                            )}
                                        </Paper>
                                    ) : (
                                        <Typography color="text.secondary">Frase no seleccionada aún</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Contenido - Artículo */}
                        <Grid item xs={12}>
                            <Card>
                                <CardHeader title="Artículo" />
                                <CardContent>
                                    {notification.article ? (
                                        <Stack spacing={2}>
                                            <Box>
                                                <Typography variant="h6">{notification.article.title}</Typography>
                                            </Box>
                                            {notification.article.summary && (
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {notification.article.summary}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Box>
                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                    {notification.article.content.substring(0, 500)}
                                                    {notification.article.content.length > 500 && '...'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    ) : (
                                        <Typography color="text.secondary">Artículo no seleccionado aún</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Acciones */}
                        <Grid item xs={12}>
                            <Card>
                                <CardHeader title="Acciones" />
                                <CardContent>
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        {notification.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    startIcon={<SendIcon />}
                                                    onClick={handleSendNow}
                                                    color="primary"
                                                >
                                                    Enviar Ahora
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<CancelIcon />}
                                                    onClick={handleCancel}
                                                    color="warning"
                                                >
                                                    Cancelar para Hoy
                                                </Button>
                                            </>
                                        )}

                                        {(notification.status === 'sent' || notification.status === 'failed') && (
                                            <Button
                                                variant="contained"
                                                startIcon={<RefreshIcon />}
                                                onClick={handleReactivate}
                                                color="success"
                                            >
                                                Reactivar
                                            </Button>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
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
        </AppLayout>
    );
}
