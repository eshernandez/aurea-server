import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Typography,
    Link as MuiLink,
    Alert,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store().url, {
            onSuccess: () => {
                reset('password');
            },
        });
    };

    return (
        <AuthLayout
            title="Iniciar Sesión"
            description="Ingresa tu email y contraseña para acceder a tu cuenta"
        >
            <Head title="Iniciar Sesión - Aurea" />

            {status && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {status}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder="email@example.com"
                    error={!!errors.email}
                    helperText={errors.email}
                    fullWidth
                />

                <Box>
                    <TextField
                        id="password"
                        name="password"
                        type="password"
                        label="Contraseña"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="Contraseña"
                        error={!!errors.password}
                        helperText={errors.password}
                        fullWidth
                    />
                    {canResetPassword && (
                        <MuiLink
                            href={request()}
                            component="a"
                            variant="body2"
                            sx={{ mt: 1, display: 'block', textAlign: 'right' }}
                        >
                            ¿Olvidaste tu contraseña?
                        </MuiLink>
                    )}
                </Box>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            name="remember"
                        />
                    }
                    label="Recordarme"
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={processing}
                    startIcon={<LoginIcon />}
                    sx={{ textTransform: 'none', mt: 2 }}
                >
                    {processing ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>

                {canRegister && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                        ¿No tienes una cuenta?{' '}
                        <MuiLink
                            href="#"
                            component="a"
                            sx={{ fontWeight: 600 }}
                            onClick={(e) => e.preventDefault()}
                        >
                            Regístrate
                        </MuiLink>
                    </Typography>
                )}
            </Box>
        </AuthLayout>
    );
}
