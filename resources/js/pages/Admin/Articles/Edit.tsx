import InputError from '@/components/input-error';
import ImageInput from '@/components/image-input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
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

interface Article {
    id: number;
    title: string;
    content: string;
    summary: string | null;
    category_id: number;
    image_url: string | null;
    is_active: boolean;
    category?: Category;
}

interface Props {
    article: Article;
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Artículos',
        href: '/admin/articles',
    },
    {
        title: 'Editar',
        href: '#',
    },
];

export default function ArticlesEdit({ article, categories }: Props) {
    const { data, setData, post, processing, errors, transform } = useForm({
        title: article.title,
        content: article.content,
        summary: article.summary || '',
        category_id: article.category_id,
        image_url: article.image_url || '',
        image_file: null as File | null,
        is_active: article.is_active,
        _method: 'PUT',
    });

    // Transformar datos cuando hay un archivo para usar FormData
    transform((data) => {
        // Si hay un archivo, construir FormData y NO incluir image_url
        if (data.image_file instanceof File) {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('content', data.content);
            formData.append('summary', data.summary || '');
            formData.append('category_id', data.category_id.toString());
            formData.append('is_active', data.is_active ? '1' : '0');
            formData.append('_method', 'PUT');
            formData.append('image_file', data.image_file);
            // No incluir image_url cuando hay archivo
            return formData;
        }
        // Si no hay archivo, retornar datos normales (puede incluir image_url)
        const submitData: any = {
            title: data.title,
            content: data.content,
            summary: data.summary || '',
            category_id: data.category_id,
            is_active: data.is_active,
            _method: 'PUT',
        };
        // Solo incluir image_url si no hay archivo
        if (data.image_url && !data.image_file) {
            submitData.image_url = data.image_url;
        }
        return submitData;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Limpiar el campo que no se está usando
        if (data.image_file instanceof File) {
            setData('image_url', '');
        } else if (data.image_url) {
            setData('image_file', null);
        }
        
        // Inertia usará FormData automáticamente cuando transform retorna FormData
        post(`/admin/articles/${article.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Artículo" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                            Editar Artículo
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Modifica la información del artículo
                        </Typography>
                    </Box>
                    <Button
                        component={Link}
                        href="/admin/articles"
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
                                Información del Artículo
                            </Typography>
                        }
                    />
                    <CardContent>
                        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <TextField
                                id="title"
                                label="Título"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                required
                                error={!!errors.title}
                                helperText={errors.title}
                                fullWidth
                            />

                            <TextField
                                id="summary"
                                label="Resumen"
                                value={data.summary}
                                onChange={(e) => setData('summary', e.target.value)}
                                multiline
                                rows={3}
                                error={!!errors.summary}
                                helperText={errors.summary}
                                fullWidth
                            />

                            <TextField
                                id="content"
                                label="Contenido"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                multiline
                                rows={10}
                                required
                                error={!!errors.content}
                                helperText={errors.content}
                                fullWidth
                            />

                            <FormControl fullWidth required error={!!errors.category_id}>
                                <InputLabel id="category_id-label">Categoría</InputLabel>
                                <Select
                                    labelId="category_id-label"
                                    id="category_id"
                                    value={data.category_id.toString()}
                                    onChange={(e) => setData('category_id', parseInt(e.target.value))}
                                    label="Categoría"
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id.toString()}>
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

                            <ImageInput
                                value={data.image_file || data.image_url || null}
                                onChange={(value) => {
                                    if (value instanceof File) {
                                        setData('image_file', value);
                                        setData('image_url', '');
                                    } else {
                                        setData('image_url', value || '');
                                        setData('image_file', null);
                                    }
                                }}
                                error={errors.image_url || errors.image_file}
                                label="Imagen del Artículo"
                                helperText="Sube una imagen o pega una URL"
                            />

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                }
                                label="Artículo activo"
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
                                    href="/admin/articles"
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
