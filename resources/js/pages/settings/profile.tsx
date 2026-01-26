import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Link as MuiLink,
    Alert,
    Fade,
    CircularProgress,
} from '@mui/material';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const { data, setData, patch, processing, recentlySuccessful, errors } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(ProfileController.update().url, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <Typography component="h1" sx={{ position: 'absolute', left: '-9999px' }}>
                Profile Settings
            </Typography>

            <SettingsLayout>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            id="name"
                            name="name"
                            label="Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Full name"
                            error={!!errors.name}
                            helperText={errors.name}
                            fullWidth
                        />

                        <TextField
                            id="email"
                            name="email"
                            type="email"
                            label="Email address"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Email address"
                            error={!!errors.email}
                            helperText={errors.email}
                            fullWidth
                        />

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Your email address is unverified.{' '}
                                    <MuiLink
                                        component={Link}
                                        href={send().url}
                                        sx={{
                                            textDecoration: 'underline',
                                            '&:hover': {
                                                textDecoration: 'none',
                                            },
                                        }}
                                    >
                                        Click here to resend the verification email.
                                    </MuiLink>
                                </Typography>

                                {status === 'verification-link-sent' && (
                                    <Alert severity="success" sx={{ mt: 1 }}>
                                        A new verification link has been sent to your email address.
                                    </Alert>
                                )}
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={processing}
                                data-test="update-profile-button"
                                sx={{ textTransform: 'none' }}
                            >
                                {processing ? (
                                    <>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </Button>

                            <Fade in={recentlySuccessful}>
                                <Typography variant="body2" color="text.secondary">
                                    Saved
                                </Typography>
                            </Fade>
                        </Box>
                    </Box>
                </Box>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
