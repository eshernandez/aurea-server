import TextLink from '@/components/text-link';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(send().url);
    };

    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    A new verification link has been sent to the email address
                    you provided during registration.
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Button
                    type="submit"
                    variant="outlined"
                    disabled={processing}
                    sx={{ textTransform: 'none' }}
                >
                    {processing ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Sending...
                        </>
                    ) : (
                        'Resend verification email'
                    )}
                </Button>

                <TextLink
                    href={logout()}
                    sx={{ fontSize: '0.875rem' }}
                >
                    Log out
                </TextLink>
            </Box>
        </AuthLayout>
    );
}
