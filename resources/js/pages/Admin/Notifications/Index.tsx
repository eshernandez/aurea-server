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
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Pagination,
    Stack,
    Snackbar,
    Alert,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import {
    Search as SearchIcon,
    Send as SendIcon,
    Refresh as RefreshIcon,
    Cancel as CancelIcon,
    Visibility as VisibilityIcon,
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
}

interface Article {
    id: number;
    title: string;
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
    user?: User;
    quote?: Quote;
    article?: Article;
}

interface PaginatedNotifications {
    data: NotificationDelivery[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    notifications: PaginatedNotifications;
    filters: {
        status?: string;
        user_id?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
    };
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

export default function NotificationsIndex({ notifications, filters: initialFilters }: Props) {
    const { flash } = usePage().props as any;
    const [filters, setFilters] = useState(initialFilters);
    const [search, setSearch] = useState(initialFilters.search || '');
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
        } else if (flash?.error) {
            setSnackbar({ open: true, message: flash.error, severity: 'error' });
        }
    }, [flash]);

    const handleFilter = () => {
        router.get(
            '/admin/notifications',
            {
                ...filters,
                search,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSendNow = (notificationId: number) => {
        setConfirmDialog({
            open: true,
            title: 'Enviar notificación',
            message: '¿Estás seguro de enviar esta notificación ahora?',
            confirmColor: 'primary',
            onConfirm: () => {
                setConfirmDialog({ ...confirmDialog, open: false });
                router.post(`/admin/notifications/${notificationId}/send-now`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSnackbar({ open: true, message: 'Notificación enviada', severity: 'success' });
                    },
                });
            },
        });
    };

    const handleReactivate = (notificationId: number) => {
        setConfirmDialog({
            open: true,
            title: 'Reactivar notificación',
            message: '¿Estás seguro de reactivar esta notificación?',
            confirmColor: 'success',
            onConfirm: () => {
                setConfirmDialog({ ...confirmDialog, open: false });
                router.post(`/admin/notifications/${notificationId}/reactivate`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setSnackbar({ open: true, message: 'Notificación reactivada', severity: 'success' });
                    },
                });
            },
        });
    };

    const handleCancel = (notificationId: number) => {
        setConfirmDialog({
            open: true,
            title: 'Cancelar notificación',
            message: '¿Estás seguro de cancelar esta notificación para hoy?',
            confirmColor: 'warning',
            onConfirm: () => {
                setConfirmDialog({ ...confirmDialog, open: false });
                router.post(`/admin/notifications/${notificationId}/cancel`, {}, {
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
            <Head title="Notificaciones" />

            <Container maxWidth="xl">
                <Box sx={{ py: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Gestión de Notificaciones
                    </Typography>

                    <Card sx={{ mt: 3 }}>
                        <CardHeader title="Filtros" />
                        <CardContent>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <TextField
                                    label="Buscar"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                    size="small"
                                    sx={{ flex: 1 }}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                    }}
                                />

                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        value={filters.status || ''}
                                        label="Estado"
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <MenuItem value="">Todos</MenuItem>
                                        <MenuItem value="pending">Pendiente</MenuItem>
                                        <MenuItem value="sent">Enviada</MenuItem>
                                        <MenuItem value="failed">Fallida</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Fecha desde"
                                    type="date"
                                    value={filters.date_from || ''}
                                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />

                                <TextField
                                    label="Fecha hasta"
                                    type="date"
                                    value={filters.date_to || ''}
                                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />

                                <Button variant="contained" onClick={handleFilter} startIcon={<SearchIcon />}>
                                    Filtrar
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Card sx={{ mt: 3 }}>
                        <CardHeader
                            title={`Notificaciones (${notifications.total})`}
                            subheader={`Página ${notifications.current_page} de ${notifications.last_page}`}
                        />
                        <CardContent>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Usuario</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell>Programada</TableCell>
                                            <TableCell>Enviada</TableCell>
                                            <TableCell>Frase</TableCell>
                                            <TableCell>Artículo</TableCell>
                                            <TableCell align="right">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {notifications.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center">
                                                    <Typography color="text.secondary">
                                                        No se encontraron notificaciones
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            notifications.data.map((notification) => (
                                                <TableRow key={notification.id}>
                                                    <TableCell>{notification.id}</TableCell>
                                                    <TableCell>
                                                        {notification.user ? (
                                                            <>
                                                                <Typography variant="body2">
                                                                    {notification.user.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {notification.user.email}
                                                                </Typography>
                                                            </>
                                                        ) : (
                                                            'N/A'
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={getStatusLabel(notification.status)}
                                                            color={getStatusColor(notification.status) as any}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(notification.scheduled_at).toLocaleString('es-ES')}
                                                    </TableCell>
                                                    <TableCell>
                                                        {notification.sent_at
                                                            ? new Date(notification.sent_at).toLocaleString('es-ES')
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {notification.quote
                                                            ? notification.quote.text.substring(0, 50) + '...'
                                                            : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {notification.article
                                                            ? notification.article.title.substring(0, 50) + '...'
                                                            : 'N/A'}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                            <Tooltip title="Ver detalle">
                                                                <IconButton
                                                                    size="small"
                                                                    component={Link}
                                                                    href={`/admin/notifications/${notification.id}`}
                                                                >
                                                                    <VisibilityIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {notification.status === 'pending' && (
                                                                <>
                                                                    <Tooltip title="Enviar ahora">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="primary"
                                                                            onClick={() => handleSendNow(notification.id)}
                                                                        >
                                                                            <SendIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Cancelar para hoy">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="warning"
                                                                            onClick={() => handleCancel(notification.id)}
                                                                        >
                                                                            <CancelIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </>
                                                            )}

                                                            {(notification.status === 'sent' || notification.status === 'failed') && (
                                                                <Tooltip title="Reactivar">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="success"
                                                                        onClick={() => handleReactivate(notification.id)}
                                                                    >
                                                                        <RefreshIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            {notifications.last_page > 1 && (
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                    <Stack spacing={2}>
                                        {notifications.links.map((link, index) => (
                                            <Button
                                                key={index}
                                                component={link.url ? Link : 'span'}
                                                href={link.url || undefined}
                                                variant={link.active ? 'contained' : 'outlined'}
                                                disabled={!link.url}
                                                size="small"
                                            >
                                                {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
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
