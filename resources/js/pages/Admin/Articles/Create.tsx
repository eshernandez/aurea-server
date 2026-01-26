import InputError from '@/components/input-error';
import ImageInput from '@/components/image-input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
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
    Alert,
    Snackbar,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Psychology as PsychologyIcon } from '@mui/icons-material';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Props {
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
        title: 'Crear',
        href: '/admin/articles/create',
    },
];

export default function ArticlesCreate({ categories }: Props) {
    const { data, setData, post, processing, errors, transform } = useForm({
        title: '',
        content: '',
        summary: '',
        category_id: categories[0]?.id || 0,
        image_url: '',
        image_file: null as File | null,
        is_active: true,
    });

    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiGenerated, setAiGenerated] = useState(false); // Track if AI content was generated

    // Transformar datos cuando hay un archivo para usar FormData
    transform((data) => {
        if (data.image_file instanceof File) {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('content', data.content);
            formData.append('summary', data.summary || '');
            formData.append('category_id', data.category_id.toString());
            formData.append('is_active', data.is_active ? '1' : '0');
            formData.append('image_file', data.image_file);
            return formData;
        }
        // Si no hay archivo, retornar datos normales
        const submitData: any = {
            title: data.title,
            content: data.content,
            summary: data.summary || '',
            category_id: data.category_id,
            is_active: data.is_active,
        };
        if (data.image_url) {
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
        post('/admin/articles', {
            preserveScroll: true,
        });
    };

    const handleGenerateWithAI = async () => {
        if (!data.category_id || data.category_id === 0) {
            setAiError('Por favor, selecciona una categoría primero.');
            return;
        }

        setAiGenerating(true);
        setAiError(null);

        try {
            // Obtener el token CSRF del meta tag o cookie
            let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            // Si no está en el meta tag, buscar en las cookies
            if (!csrfToken) {
                const cookies = document.cookie.split('; ');
                const xsrfCookie = cookies.find(row => row.startsWith('XSRF-TOKEN='));
                if (xsrfCookie) {
                    // Laravel codifica el token en la cookie, necesitamos decodificarlo
                    csrfToken = decodeURIComponent(xsrfCookie.split('=')[1]);
                }
            }

            if (!csrfToken) {
                throw new Error('No se pudo obtener el token CSRF');
            }

            const response = await fetch('/admin/articles/generate-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    category_id: data.category_id,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al generar el artículo');
            }

            // Llenar el formulario con los datos generados
            setData('title', result.title || '');
            setData('summary', result.summary || '');
            setData('content', result.content || '');
            if (result.image_url) {
                setData('image_url', result.image_url);
                setData('image_file', null);
            }
            setAiGenerated(true); // Marcar que se generó contenido con IA
        } catch (error) {
            console.error('Error generating article with AI:', error);
            setAiError(error instanceof Error ? error.message : 'Error al generar el artículo con IA');
        } finally {
            setAiGenerating(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Artículo" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                            Crear Artículo
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Agrega un nuevo artículo o historia
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
                            {/* AI Generation Alert */}
                            {aiGenerating && (
                                <Alert severity="info" icon={<CircularProgress size={20} />}>
                                    Generando artículo con IA. Por favor, espera...
                                </Alert>
                            )}

                            {/* Error Alert */}
                            {aiError && (
                                <Alert 
                                    severity="error" 
                                    onClose={() => setAiError(null)}
                                    sx={{ mb: 2 }}
                                >
                                    {aiError}
                                </Alert>
                            )}

                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <TextField
                                    id="title"
                                    label="Título"
                                    value={data.title}
                                    onChange={(e) => {
                                        setData('title', e.target.value);
                                        setAiGenerated(false); // Reset flag when user edits
                                    }}
                                    required
                                    error={!!errors.title}
                                    helperText={errors.title}
                                    fullWidth
                                />
                                <Stack direction="column" spacing={1}>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        startIcon={aiGenerating ? <CircularProgress size={20} /> : <PsychologyIcon />}
                                        onClick={handleGenerateWithAI}
                                        disabled={aiGenerating || processing || !data.category_id || data.category_id === 0}
                                        sx={{ 
                                            textTransform: 'none',
                                            minWidth: 150,
                                            height: '56px', // Match TextField height
                                        }}
                                    >
                                        {aiGenerating ? 'Generando...' : 'Generar con IA'}
                                    </Button>
                                    {aiGenerated && !aiGenerating && (
                                        <Button
                                            type="button"
                                            variant="text"
                                            size="small"
                                            startIcon={<PsychologyIcon />}
                                            onClick={handleGenerateWithAI}
                                            disabled={processing || !data.category_id || data.category_id === 0}
                                            sx={{ 
                                                textTransform: 'none',
                                                minWidth: 150,
                                            }}
                                        >
                                            Otro
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>

                            <TextField
                                id="summary"
                                label="Resumen"
                                value={data.summary}
                                onChange={(e) => setData('summary', e.target.value)}
                                multiline
                                rows={3}
                                placeholder="Breve descripción del artículo..."
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
                                        'Crear Artículo'
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
