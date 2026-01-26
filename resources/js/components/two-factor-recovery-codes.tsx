import { regenerateRecoveryCodes } from '@/routes/two-factor';
import { useForm } from '@inertiajs/react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Button,
    Box,
    Fade,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Eye, EyeOff, LockKeyhole, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AlertError from './alert-error';
import { Visibility, VisibilityOff, RefreshCw as RefreshCwIcon, Lock as LockIcon } from '@mui/icons-material';

type Props = {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorRecoveryCodes({
    recoveryCodesList,
    fetchRecoveryCodes,
    errors,
}: Props) {
    const [codesAreVisible, setCodesAreVisible] = useState<boolean>(false);
    const codesSectionRef = useRef<HTMLDivElement | null>(null);
    const canRegenerateCodes = recoveryCodesList.length > 0 && codesAreVisible;

    const { post, processing } = useForm({});

    const toggleCodesVisibility = useCallback(async () => {
        if (!codesAreVisible && !recoveryCodesList.length) {
            await fetchRecoveryCodes();
        }

        setCodesAreVisible(!codesAreVisible);

        if (!codesAreVisible) {
            setTimeout(() => {
                codesSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            });
        }
    }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes]);

    useEffect(() => {
        if (!recoveryCodesList.length) {
            fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes]);

    const handleRegenerate = (e: React.FormEvent) => {
        e.preventDefault();
        post(regenerateRecoveryCodes().url, {
            preserveScroll: true,
            onSuccess: fetchRecoveryCodes,
        });
    };

    return (
        <Card>
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LockIcon fontSize="small" />
                        <Typography variant="h6">2FA Recovery Codes</Typography>
                    </Box>
                }
            />
            <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Recovery codes let you regain access if you lose your 2FA
                    device. Store them in a secure password manager.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
                    <Button
                        onClick={toggleCodesVisibility}
                        variant="outlined"
                        startIcon={codesAreVisible ? <VisibilityOff /> : <Visibility />}
                        aria-expanded={codesAreVisible}
                        aria-controls="recovery-codes-section"
                        sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                    >
                        {codesAreVisible ? 'Hide' : 'View'} Recovery Codes
                    </Button>

                    {canRegenerateCodes && (
                        <Box component="form" onSubmit={handleRegenerate}>
                            <Button
                                variant="outlined"
                                type="submit"
                                disabled={processing}
                                startIcon={processing ? <CircularProgress size={16} /> : <RefreshCwIcon />}
                                aria-describedby="regenerate-warning"
                                sx={{ textTransform: 'none' }}
                            >
                                Regenerate Codes
                            </Button>
                        </Box>
                    )}
                </Box>
                <Fade in={codesAreVisible}>
                    <Box
                        id="recovery-codes-section"
                        sx={{
                            display: codesAreVisible ? 'block' : 'none',
                        }}
                        aria-hidden={!codesAreVisible}
                    >
                        {errors?.length ? (
                            <AlertError errors={errors} />
                        ) : (
                            <Box>
                                <Box
                                    ref={codesSectionRef}
                                    sx={{
                                        display: 'grid',
                                        gap: 1,
                                        p: 2,
                                        bgcolor: 'action.hover',
                                        borderRadius: 2,
                                        fontFamily: 'monospace',
                                        fontSize: '0.875rem',
                                    }}
                                    role="list"
                                    aria-label="Recovery codes"
                                >
                                    {recoveryCodesList.length ? (
                                        recoveryCodesList.map((code, index) => (
                                            <Box
                                                key={index}
                                                role="listitem"
                                                sx={{
                                                    userSelect: 'text',
                                                }}
                                            >
                                                {code}
                                            </Box>
                                        ))
                                    ) : (
                                        <Box aria-label="Loading recovery codes">
                                            {Array.from({ length: 8 }, (_, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        height: 16,
                                                        mb: 0.5,
                                                        borderRadius: 1,
                                                        bgcolor: 'action.disabledBackground',
                                                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                                    }}
                                                    aria-hidden="true"
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Box>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', mt: 2 }}
                                    id="regenerate-warning"
                                >
                                    Each recovery code can be used once to
                                    access your account and will be removed
                                    after use. If you need more, click{' '}
                                    <Box component="span" fontWeight={600}>
                                        Regenerate Codes
                                    </Box>{' '}
                                    above.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Fade>
            </CardContent>
        </Card>
    );
}
