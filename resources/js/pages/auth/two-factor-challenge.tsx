import InputError from '@/components/input-error';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/two-factor/login';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Link as MuiLink,
    CircularProgress,
} from '@mui/material';
import { useMemo, useState } from 'react';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        code: '',
        recovery_code: '',
    });

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Recovery Code',
                description:
                    'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'login using an authentication code',
            };
        }

        return {
            title: 'Authentication Code',
            description:
                'Enter the authentication code provided by your authenticator application.',
            toggleText: 'login using a recovery code',
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = (): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
        setData('code', '');
        setData('recovery_code', '');
    };

    const handleCodeChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '').slice(0, OTP_MAX_LENGTH);
        setCode(digitsOnly);
        setData('code', digitsOnly);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store().url);
    };

    return (
        <AuthLayout
            title={authConfigContent.title}
            description={authConfigContent.description}
        >
            <Head title="Two-Factor Authentication" />

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {showRecoveryInput ? (
                    <TextField
                        name="recovery_code"
                        type="text"
                        label="Recovery Code"
                        value={data.recovery_code}
                        onChange={(e) => setData('recovery_code', e.target.value)}
                        required
                        autoFocus
                        placeholder="Enter recovery code"
                        error={!!errors.recovery_code}
                        helperText={errors.recovery_code}
                        fullWidth
                    />
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <TextField
                            name="code"
                            type="text"
                            label="Authentication Code"
                            value={code}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            required
                            autoFocus
                            placeholder="Enter 6-digit code"
                            error={!!errors.code}
                            helperText={errors.code}
                            inputProps={{
                                maxLength: OTP_MAX_LENGTH,
                                pattern: '[0-9]*',
                            }}
                            sx={{
                                width: '100%',
                                maxWidth: 300,
                                '& input': {
                                    textAlign: 'center',
                                    fontSize: '1.5rem',
                                    letterSpacing: '0.5rem',
                                    fontFamily: 'monospace',
                                },
                            }}
                            fullWidth
                        />
                    </Box>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={processing}
                    sx={{ textTransform: 'none' }}
                >
                    {processing ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Processing...
                        </>
                    ) : (
                        'Continue'
                    )}
                </Button>

                <Typography variant="body2" color="text.secondary" align="center">
                    or you can{' '}
                    <MuiLink
                        component="button"
                        type="button"
                        onClick={toggleRecoveryMode}
                        sx={{
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            '&:hover': {
                                textDecoration: 'none',
                            },
                        }}
                    >
                        {authConfigContent.toggleText}
                    </MuiLink>
                </Typography>
            </Box>
        </AuthLayout>
    );
}
