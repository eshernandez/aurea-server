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
    slug: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    quotes_count?: number;
    articles_count?: number;
}

interface Props {
    category: Category;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Categorías',
        href: '/admin/categories',
    },
    {
        title: 'Detalles',
        href: '#',
    },
];

export default function CategoriesShow({ category }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name} />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                            {category.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Detalles de la categoría
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button
                            component={Link}
                            href={`/admin/categories/${category.id}/edit`}
                            variant="contained"
                            startIcon={<EditIcon />}
                            sx={{ textTransform: 'none' }}
                        >
                            Editar
                        </Button>
                        <Button
                            component={Link}
                            href="/admin/categories"
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
                                    Nombre
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                    {category.name}
                                </Typography>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Slug
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
                                    {category.slug}
                                </Typography>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Descripción
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                    {category.description || 'Sin descripción'}
                                </Typography>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Estado
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                        label={category.is_active ? 'Activo' : 'Inactivo'}
                                        color={category.is_active ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Estadísticas
                                </Typography>
                                <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography variant="body2">
                                        Frases: {category.quotes_count || 0}
                                    </Typography>
                                    <Typography variant="body2">
                                        Artículos: {category.articles_count || 0}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    Fechas
                                </Typography>
                                <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography variant="body2">
                                        Creado: {new Date(category.created_at).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2">
                                        Actualizado: {new Date(category.updated_at).toLocaleString()}
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
