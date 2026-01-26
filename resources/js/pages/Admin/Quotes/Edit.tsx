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
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    FormControlLabel,
    Checkbox,
    Stack,
    CircularProgress,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

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
    category?: Category;
}

interface Props {
    quote: Quote;
    categories: Category[];
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
        title: 'Editar',
        href: '#',
    },
];

export default function QuotesEdit({ quote, categories }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        text: quote.text,
        author: quote.author || '',
        category_id: quote.category_id,
        is_active: quote.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/quotes/${quote.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Frase" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                            Editar Frase
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Modifica la información de la frase
                        </Typography>
                    </Box>
                    <Button
                        component={Link}
                        href="/admin/quotes"
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
                                Información de la Frase
                            </Typography>
                        }
                    />
                    <CardContent>
                        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                id="text"
                                label="Texto de la frase"
                                value={data.text}
                                onChange={(e) => setData('text', e.target.value)}
                                multiline
                                rows={4}
                                required
                                error={!!errors.text}
                                helperText={errors.text}
                                fullWidth
                            />

                            <TextField
                                id="author"
                                label="Autor"
                                value={data.author}
                                onChange={(e) => setData('author', e.target.value)}
                                error={!!errors.author}
                                helperText={errors.author}
                                fullWidth
                            />

                            <FormControl fullWidth required error={!!errors.category_id}>
                                <InputLabel id="category_id-label">Categoría</InputLabel>
                                <Select
                                    labelId="category_id-label"
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', parseInt(e.target.value))}
                                    label="Categoría"
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.category_id && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                        {errors.category_id}
                                    </Typography>
                                )}
                            </FormControl>

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                }
                                label="Frase activa"
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
                                        'Guardar Cambios'
                                    )}
                                </Button>
                                <Button
                                    component={Link}
                                    href="/admin/quotes"
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
