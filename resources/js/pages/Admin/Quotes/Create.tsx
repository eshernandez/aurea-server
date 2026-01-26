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
    Alert,
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
        title: 'Frases',
        href: '/admin/quotes',
    },
    {
        title: 'Crear',
        href: '/admin/quotes/create',
    },
];

export default function QuotesCreate({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        text: '',
        author: '',
        category_id: categories[0]?.id || 0,
        is_active: true,
    });

    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiGenerated, setAiGenerated] = useState(false); // Track if AI content was generated

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/quotes');
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

            const response = await fetch('/admin/quotes/generate-ai', {
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
                throw new Error(result.error || 'Error al generar la frase');
            }

            // Llenar el formulario con los datos generados
            setData('text', result.text || '');
            setData('author', result.author || '');
            setAiGenerated(true); // Marcar que se generó contenido con IA
        } catch (error) {
            console.error('Error generating quote with AI:', error);
            setAiError(error instanceof Error ? error.message : 'Error al generar la frase con IA');
        } finally {
            setAiGenerating(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Frase" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                            Crear Frase
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Agrega una nueva frase o cita
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
                            {/* AI Generation Alert */}
                            {aiGenerating && (
                                <Alert severity="info" icon={<CircularProgress size={20} />}>
                                    Generando frase con IA. Por favor, espera...
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
                                    id="text"
                                    label="Texto de la frase"
                                    value={data.text}
                                    onChange={(e) => {
                                        setData('text', e.target.value);
                                        setAiGenerated(false); // Reset flag when user edits
                                    }}
                                    multiline
                                    rows={4}
                                    required
                                    error={!!errors.text}
                                    helperText={errors.text}
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
                                id="author"
                                label="Autor"
                                value={data.author}
                                onChange={(e) => setData('author', e.target.value)}
                                placeholder="Opcional"
                                error={!!errors.author}
                                helperText={errors.author}
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
                                        'Crear Frase'
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
