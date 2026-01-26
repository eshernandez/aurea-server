import InputError from '@/components/input-error';
import { useAppearance } from '@/hooks/use-appearance';
import { useClipboard } from '@/hooks/use-clipboard';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { confirm } from '@/routes/two-factor';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    TextField,
    Typography,
    Divider,
    IconButton,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import { Check, Copy, ScanLine } from 'lucide-react';
import { Check as CheckIcon, ContentCopy as CopyIcon, QrCodeScanner as QrCodeIcon } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AlertError from './alert-error';

function GridScanIcon() {
    return (
        <Box
            sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    border: 2,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        opacity: 0.5,
                    }}
                >
                    {Array.from({ length: 5 }, (_, i) => (
                        <Box
                            key={`col-${i + 1}`}
                            sx={{
                                borderRight: 1,
                                borderColor: 'divider',
                                '&:last-child': { borderRight: 0 },
                            }}
                        />
                    ))}
                </Box>
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'grid',
                        gridTemplateRows: 'repeat(5, 1fr)',
                        opacity: 0.5,
                    }}
                >
                    {Array.from({ length: 5 }, (_, i) => (
                        <Box
                            key={`row-${i + 1}`}
                            sx={{
                                borderBottom: 1,
                                borderColor: 'divider',
                                '&:last-child': { borderBottom: 0 },
                            }}
                        />
                    ))}
                </Box>
                <QrCodeIcon sx={{ position: 'relative', zIndex: 2 }} />
            </Box>
        </Box>
    );
}

function TwoFactorSetupStep({
    qrCodeSvg,
    manualSetupKey,
    buttonText,
    onNextStep,
    errors,
}: {
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    buttonText: string;
    onNextStep: () => void;
    errors: string[];
}) {
    const { resolvedAppearance } = useAppearance();
    const [copiedText, copy] = useClipboard();
    const isCopied = copiedText === manualSetupKey;

    return (
        <>
            {errors?.length ? (
                <AlertError errors={errors} />
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
                    <Box
                        sx={{
                            mx: 'auto',
                            maxWidth: 400,
                            aspectRatio: '1/1',
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2,
                            bgcolor: 'background.paper',
                        }}
                    >
                        {qrCodeSvg ? (
                            <Box
                                sx={{
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    bgcolor: 'white',
                                    p: 1,
                                    borderRadius: 1,
                                    '& svg': {
                                        width: '100%',
                                        height: '100%',
                                    },
                                    filter:
                                        resolvedAppearance === 'dark'
                                            ? 'invert(1) brightness(1.5)'
                                            : undefined,
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: qrCodeSvg,
                                }}
                            />
                        ) : (
                            <CircularProgress />
                        )}
                    </Box>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={onNextStep}
                        sx={{ textTransform: 'none' }}
                    >
                        {buttonText}
                    </Button>

                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', my: 2 }}>
                        <Divider sx={{ flex: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                            or, enter the code manually
                        </Typography>
                        <Divider sx={{ flex: 1 }} />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            value={manualSetupKey || ''}
                            InputProps={{
                                readOnly: true,
                                endAdornment: manualSetupKey ? (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => copy(manualSetupKey || '')}
                                            edge="end"
                                            size="small"
                                        >
                                            {isCopied ? <CheckIcon /> : <CopyIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ) : (
                                    <InputAdornment position="end">
                                        <CircularProgress size={20} />
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                            placeholder="Loading setup key..."
                        />
                    </Box>
                </Box>
            )}
        </>
    );
}

function TwoFactorVerificationStep({
    onClose,
    onBack,
}: {
    onClose: () => void;
    onBack: () => void;
}) {
    const [code, setCode] = useState<string>('');
    const pinInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    useEffect(() => {
        setTimeout(() => {
            pinInputRef.current?.focus();
        }, 0);
    }, []);

    const handleCodeChange = (value: string) => {
        const digitsOnly = value.replace(/\D/g, '').slice(0, OTP_MAX_LENGTH);
        setCode(digitsOnly);
        setData('code', digitsOnly);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(confirm().url, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
                inputRef={pinInputRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                label="Authentication Code"
                placeholder="Enter 6-digit code"
                required
                disabled={processing}
                error={!!errors?.confirmTwoFactorAuthentication?.code}
                helperText={errors?.confirmTwoFactorAuthentication?.code}
                inputProps={{
                    maxLength: OTP_MAX_LENGTH,
                    pattern: '[0-9]*',
                }}
                sx={{
                    '& input': {
                        textAlign: 'center',
                        fontSize: '1.5rem',
                        letterSpacing: '0.5rem',
                        fontFamily: 'monospace',
                    },
                }}
                fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    type="button"
                    variant="outlined"
                    onClick={onBack}
                    disabled={processing}
                    sx={{ flex: 1, textTransform: 'none' }}
                >
                    Back
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={processing || code.length < OTP_MAX_LENGTH}
                    sx={{ flex: 1, textTransform: 'none' }}
                >
                    {processing ? <CircularProgress size={20} /> : 'Confirm'}
                </Button>
            </Box>
        </Box>
    );
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string | null;
    manualSetupKey: string | null;
    clearSetupData: () => void;
    fetchSetupData: () => Promise<void>;
    errors: string[];
};

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    errors,
}: Props) {
    const [showVerificationStep, setShowVerificationStep] = useState<boolean>(false);

    const modalConfig = useMemo<{
        title: string;
        description: string;
        buttonText: string;
    }>(() => {
        if (twoFactorEnabled) {
            return {
                title: 'Two-Factor Authentication Enabled',
                description:
                    'Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.',
                buttonText: 'Close',
            };
        }

        if (showVerificationStep) {
            return {
                title: 'Verify Authentication Code',
                description: 'Enter the 6-digit code from your authenticator app',
                buttonText: 'Continue',
            };
        }

        return {
            title: 'Enable Two-Factor Authentication',
            description:
                'To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app',
            buttonText: 'Continue',
        };
    }, [twoFactorEnabled, showVerificationStep]);

    const handleModalNextStep = useCallback(() => {
        if (requiresConfirmation) {
            setShowVerificationStep(true);
            return;
        }

        clearSetupData();
        onClose();
    }, [requiresConfirmation, clearSetupData, onClose]);

    const resetModalState = useCallback(() => {
        setShowVerificationStep(false);

        if (twoFactorEnabled) {
            clearSetupData();
        }
    }, [twoFactorEnabled, clearSetupData]);

    useEffect(() => {
        if (isOpen && !qrCodeSvg) {
            fetchSetupData();
        }
    }, [isOpen, qrCodeSvg, fetchSetupData]);

    const handleClose = useCallback(() => {
        resetModalState();
        onClose();
    }, [onClose, resetModalState]);

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
                <GridScanIcon />
                <Typography variant="h6" component="div" gutterBottom>
                    {modalConfig.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {modalConfig.description}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
                    {showVerificationStep ? (
                        <TwoFactorVerificationStep
                            onClose={onClose}
                            onBack={() => setShowVerificationStep(false)}
                        />
                    ) : (
                        <TwoFactorSetupStep
                            qrCodeSvg={qrCodeSvg}
                            manualSetupKey={manualSetupKey}
                            buttonText={modalConfig.buttonText}
                            onNextStep={handleModalNextStep}
                            errors={errors}
                        />
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
