import { useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Paper,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useState } from 'react';

type Props = {
    title?: string;
    description?: string;
};

export default function ContactForm({ 
    title = 'Contáctanos',
    description = '¿Tienes alguna pregunta o sugerencia? Escríbenos y te responderemos pronto.'
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => {
                reset();
                setSuccess(true);
                setTimeout(() => setSuccess(false), 5000);
            },
        });
    };

    return (
        <Paper
            elevation={2}
            sx={{
                p: 4,
                borderRadius: 2,
            }}
        >
            <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                {title}
            </Typography>
            {description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {description}
                </Typography>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    ¡Mensaje enviado exitosamente! Te responderemos pronto.
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                    id="name"
                    name="name"
                    label="Nombre completo"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                    fullWidth
                />

                <TextField
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                />

                <TextField
                    id="subject"
                    name="subject"
                    label="Asunto"
                    value={data.subject}
                    onChange={(e) => setData('subject', e.target.value)}
                    required
                    error={!!errors.subject}
                    helperText={errors.subject}
                    fullWidth
                />

                <TextField
                    id="message"
                    name="message"
                    label="Mensaje"
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    required
                    multiline
                    rows={5}
                    error={!!errors.message}
                    helperText={errors.message}
                    fullWidth
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={processing}
                    startIcon={processing ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                >
                    {processing ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
            </Box>
        </Paper>
    );
}
