import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
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
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';

interface Category {
    id: number;
    name: string;
}

interface Quote {
    id: number;
    text: string;
    author: string | null;
    category_id: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category?: Category;
}

interface Props {
    quote: Quote;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Frases',
        href: '/admin/quotes',
    },
    {
        title: 'Detalle',
        href: '#',
    },
];

export default function QuotesShow({ quote }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detalle de Frase" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                            Detalle de Frase
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Información completa de la frase
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button
                            component={Link}
                            href={`/admin/quotes/${quote.id}/edit`}
                            variant="contained"
                            startIcon={<EditIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Editar
                        </Button>
                        <Button
                            component={Link}
                            href="/admin/quotes"
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Volver
                        </Button>
                    </Stack>
                </Box>

                <Card>
                    <CardHeader
                        title={
                            <Typography variant="h6" fontWeight={600}>
                                Información
                            </Typography>
                        }
                    />
                    <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Texto
                                </Typography>
                                <Typography variant="h6" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                    "{quote.text}"
                                </Typography>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Autor
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                    {quote.author || 'Sin autor'}
                                </Typography>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Categoría
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                    {quote.category?.name || '-'}
                                </Typography>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Estado
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                        label={quote.is_active ? 'Activo' : 'Inactivo'}
                                        color={quote.is_active ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Fechas
                                </Typography>
                                <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography variant="body2">
                                        Creado: {new Date(quote.created_at).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2">
                                        Actualizado: {new Date(quote.updated_at).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </AppLayout>
    );
}
