import InputError from '@/components/input-error';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    TextField,
    CircularProgress,
} from '@mui/material';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
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
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    required
                    autoFocus
                    autoComplete="current-password"
                    placeholder="Password"
                    error={!!errors.password}
                    helperText={errors.password}
                    fullWidth
                />

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={processing}
                    data-test="confirm-password-button"
                    sx={{ textTransform: 'none' }}
                >
                    {processing ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Confirming...
                        </>
                    ) : (
                        'Confirm password'
                    )}
                </Button>
            </Box>
        </AuthLayout>
    );
}
