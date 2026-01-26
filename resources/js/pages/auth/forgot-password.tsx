import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    TextField,
    Alert,
    CircularProgress,
    Typography,
} from '@mui/material';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(email().url);
    };

    return (
        <AuthLayout
            title="Forgot password"
            description="Enter your email to receive a password reset link"
        >
            <Head title="Forgot password" />

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
                    label="Email address"
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

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={processing}
                    data-test="email-password-reset-link-button"
                    sx={{ textTransform: 'none' }}
                >
                    {processing ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Sending...
                        </>
                    ) : (
                        'Email password reset link'
                    )}
                </Button>

                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                    Or, return to{' '}
                    <TextLink href={login()}>log in</TextLink>
                </Typography>
            </Box>
        </AuthLayout>
    );
}
