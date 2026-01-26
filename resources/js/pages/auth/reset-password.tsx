import InputError from '@/components/input-error';
import AuthLayout from '@/layouts/auth-layout';
import { update } from '@/routes/password';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    TextField,
    CircularProgress,
} from '@mui/material';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email: emailProp }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: emailProp,
        password: '',
        password_confirmation: '',
        token,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(update().url, {
            onSuccess: () => {
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <AuthLayout
            title="Reset password"
            description="Please enter your new password below"
        >
            <Head title="Reset password" />

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    value={data.email}
                    InputProps={{
                        readOnly: true,
                    }}
                    fullWidth
                />

                <TextField
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    required
                    autoFocus
                    autoComplete="new-password"
                    placeholder="Password"
                    error={!!errors.password}
                    helperText={errors.password}
                    fullWidth
                />

                <TextField
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    label="Confirm password"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Confirm password"
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
                    data-test="reset-password-button"
                    sx={{ textTransform: 'none', mt: 2 }}
                >
                    {processing ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Resetting...
                        </>
                    ) : (
                        'Reset password'
                    )}
                </Button>
            </Box>
        </AuthLayout>
    );
}
