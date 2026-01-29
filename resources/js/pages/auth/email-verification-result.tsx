import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';
import {
    Box,
    Alert,
    Typography,
    Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { router } from '@inertiajs/react';

interface EmailVerificationResultProps {
    success: boolean;
    message: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export default function EmailVerificationResult({ success, message, user }: EmailVerificationResultProps) {
    return (
        <AuthLayout
            title={success ? "¡Email verificado!" : "Error de verificación"}
            description={success 
                ? "Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión en la aplicación móvil."
                : "Hubo un problema al verificar tu email. Por favor intenta nuevamente."
            }
        >
            <Head title={success ? "Email verificado" : "Error de verificación"} />

            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                {success ? (
                    <>
                        <CheckCircleIcon 
                            sx={{ 
                                fontSize: 80, 
                                color: 'success.main',
                                mb: 2
                            }} 
                        />
                        <Alert severity="success" sx={{ width: '100%', textAlign: 'left' }}>
                            {message}
                        </Alert>
                        {user && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, width: '100%' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Cuenta verificada:
                                </Typography>
                                <Typography variant="h6" component="div">
                                    {user.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user.email}
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                            <Typography variant="body2" color="text.secondary">
                                Puedes cerrar esta ventana y abrir la aplicación móvil para iniciar sesión.
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <>
                        <ErrorIcon 
                            sx={{ 
                                fontSize: 80, 
                                color: 'error.main',
                                mb: 2
                            }} 
                        />
                        <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                            {message}
                        </Alert>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Si el problema persiste, por favor contacta al soporte o intenta registrarte nuevamente.
                        </Typography>
                    </>
                )}
            </Box>
        </AuthLayout>
    );
}
