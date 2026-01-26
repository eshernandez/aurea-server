import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/user-password';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Fade,
    CircularProgress,
} from '@mui/material';
import { useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, recentlySuccessful, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(PasswordController.update().url, {
            preserveScroll: true,
            onError: (errors) => {
                if (errors.password) {
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    currentPasswordInput.current?.focus();
                }
            },
            onSuccess: () => {
                reset('password', 'password_confirmation', 'current_password');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <Typography component="h1" sx={{ position: 'absolute', left: '-9999px' }}>
                Password Settings
            </Typography>

            <SettingsLayout>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Heading
                        variant="small"
                        title="Update password"
                        description="Ensure your account is using a long, random password to stay secure"
                    />

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            id="current_password"
                            name="current_password"
                            type="password"
                            label="Current password"
                            inputRef={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="Current password"
                            error={!!errors.current_password}
                            helperText={errors.current_password}
                            fullWidth
                        />

                        <TextField
                            id="password"
                            name="password"
                            type="password"
                            label="New password"
                            inputRef={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="New password"
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

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={processing}
                                data-test="update-password-button"
                                sx={{ textTransform: 'none' }}
                            >
                                {processing ? (
                                    <>
                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                        Saving...
                                    </>
                                ) : (
                                    'Save password'
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
            </SettingsLayout>
        </AppLayout>
    );
}
