import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Link as MuiLink,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store().url, {
            onSuccess: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <AuthLayout
            title="Crear Cuenta"
            description="Ingresa tus datos para crear tu cuenta en Aurea"
        >
            <Head title="Registrarse - Aurea" />
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                    id="name"
                    name="name"
                    type="text"
                    label="Nombre completo"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    autoFocus
                    autoComplete="name"
                    placeholder="Nombre completo"
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
                    autoComplete="email"
                    placeholder="email@example.com"
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                />

                <TextField
                    id="password"
                    name="password"
                    type="password"
                    label="Contraseña"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Contraseña"
                    error={!!errors.password}
                    helperText={errors.password}
                    fullWidth
                />

                <TextField
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    label="Confirmar contraseña"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Confirmar contraseña"
                    error={!!errors.password_confirmation}
                    helperText={errors.password_confirmation}
                    fullWidth
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={processing}
                    startIcon={<PersonAdd />}
                    sx={{ textTransform: 'none', mt: 2 }}
                >
                    {processing ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>

                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    ¿Ya tienes una cuenta?{' '}
                    <MuiLink
                        href={login()}
                        component="a"
                        sx={{ fontWeight: 600 }}
                    >
                        Inicia sesión
                    </MuiLink>
                </Typography>
            </Box>
        </AuthLayout>
    );
}
