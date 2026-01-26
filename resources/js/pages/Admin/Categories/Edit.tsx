import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    Stack,
    CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
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
        title: 'Editar',
        href: '#',
    },
];

export default function CategoriesEdit({ category }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        is_active: category.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/categories/${category.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Categoría" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                            Editar Categoría
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Modifica la información de la categoría
                        </Typography>
                    </Box>
                    <Button
                        component={Link}
                        href="/admin/categories"
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        sx={{ textTransform: 'none' }}
                    >
                        Volver
                    </Button>
                </Box>

                <Card>
                    <CardHeader
                        title={
                            <Typography variant="h6" fontWeight={600}>
                                Información de la Categoría
                            </Typography>
                        }
                    />
                    <CardContent>
                        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                id="name"
                                label="Nombre"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                error={!!errors.name}
                                helperText={errors.name}
                                fullWidth
                            />

                            <TextField
                                id="slug"
                                label="Slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                required
                                error={!!errors.slug}
                                helperText={errors.slug}
                                fullWidth
                            />

                            <TextField
                                id="description"
                                label="Descripción"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                multiline
                                rows={3}
                                error={!!errors.description}
                                helperText={errors.description}
                                fullWidth
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                }
                                label="Categoría activa"
                            />

                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={processing}
                                    sx={{ textTransform: 'none' }}
                                >
                                    {processing ? (
                                        <>
                                            <CircularProgress size={20} sx={{ mr: 1 }} />
                                            Guardando...
                                        </>
                                    ) : (
                                        'Actualizar Categoría'
                                    )}
                                </Button>
                                <Button
                                    component={Link}
                                    href="/admin/categories"
                                    variant="outlined"
                                    sx={{ textTransform: 'none' }}
                                >
                                    Cancelar
                                </Button>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </AppLayout>
    );
}
