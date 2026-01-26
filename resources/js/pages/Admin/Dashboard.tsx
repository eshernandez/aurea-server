import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';

interface Metrics {
    users: {
        total: number;
        active: number;
        admins: number;
    };
    content: {
        categories: {
            total: number;
            active: number;
        };
        quotes: {
            total: number;
            active: number;
        };
        articles: {
            total: number;
            active: number;
        };
    };
    notifications: {
        today: {
            total: number;
            sent: number;
            failed: number;
        };
        last_7_days: {
            total: number;
            sent: number;
        };
    };
}

interface NotificationDelivery {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
    };
    quote: {
        id: number;
        text: string;
    } | null;
    article: {
        id: number;
        title: string;
    } | null;
    sent_at: string;
    status: string;
}

interface Props {
    metrics: Metrics;
    recentNotifications: NotificationDelivery[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function AdminDashboard({ metrics, recentNotifications }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                        Panel de Administración
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Resumen general del sistema Aurea
                    </Typography>
                </Box>

                {/* User Metrics */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardHeader 
                                title={
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Usuarios
                                    </Typography>
                                }
                                sx={{ pb: 1.5, pt: 2 }}
                            />
                            <CardContent sx={{ flexGrow: 1, py: 2, px: 3 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Total:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {metrics.users.total}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Activos:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {metrics.users.active}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Administradores:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {metrics.users.admins}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardHeader 
                                title={
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Contenido
                                    </Typography>
                                }
                                sx={{ pb: 1.5, pt: 2 }}
                            />
                            <CardContent sx={{ flexGrow: 1, py: 2, px: 3 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Categorías:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {metrics.content.categories.active} / {metrics.content.categories.total}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Frases:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {metrics.content.quotes.active} / {metrics.content.quotes.total}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Artículos:
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {metrics.content.articles.active} / {metrics.content.articles.total}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardHeader 
                                title={
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Notificaciones
                                    </Typography>
                                }
                                sx={{ pb: 1.5, pt: 2 }}
                            />
                            <CardContent sx={{ flexGrow: 1, py: 2, px: 3 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                                            Hoy:
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ml: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Enviadas:
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {metrics.notifications.today.sent}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ml: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Fallidas:
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600} color="error">
                                                {metrics.notifications.today.failed}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                                            Últimos 7 días:
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ml: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Enviadas:
                                            </Typography>
                                            <Typography variant="body1" fontWeight={600}>
                                                {metrics.notifications.last_7_days.sent}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Recent Notifications */}
                <Card>
                    <CardHeader title="Notificaciones Recientes" />
                    <CardContent>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Usuario</TableCell>
                                        <TableCell>Contenido</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentNotifications.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                <Typography variant="body2" color="text.secondary">
                                                    No hay notificaciones recientes
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentNotifications.map((notification) => (
                                            <TableRow key={notification.id}>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {notification.user.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {notification.user.email}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {notification.quote ? (
                                                        <Typography variant="body2">
                                                            Frase: {notification.quote.text.substring(0, 50)}...
                                                        </Typography>
                                                    ) : notification.article ? (
                                                        <Typography variant="body2">
                                                            Artículo: {notification.article.title}
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            N/A
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {new Date(notification.sent_at).toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
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
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Container>
        </AppLayout>
    );
}
