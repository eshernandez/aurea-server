import Heading from '@/components/heading';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { disable, enable, show } from '@/routes/two-factor';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import {
    Box,
    Button,
    Chip,
    Typography,
} from '@mui/material';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-Factor Authentication',
        href: show.url(),
    },
];

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    const { post: postDisable, processing: processingDisable } = useForm({});
    const { post: postEnable, processing: processingEnable } = useForm({});

    const handleDisable = (e: React.FormEvent) => {
        e.preventDefault();
        postDisable(disable().url);
    };

    const handleEnable = (e: React.FormEvent) => {
        e.preventDefault();
        postEnable(enable().url, {
            onSuccess: () => setShowSetupModal(true),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Two-Factor Authentication" />

            <Typography component="h1" sx={{ position: 'absolute', left: '-9999px' }}>
                Two-Factor Authentication Settings
            </Typography>

            <SettingsLayout>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Heading
                        variant="small"
                        title="Two-Factor Authentication"
                        description="Manage your two-factor authentication settings"
                    />
                    {twoFactorEnabled ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Chip label="Enabled" color="success" sx={{ alignSelf: 'flex-start' }} />
                            <Typography variant="body2" color="text.secondary">
                                With two-factor authentication enabled, you will
                                be prompted for a secure, random pin during
                                login, which you can retrieve from the
                                TOTP-supported application on your phone.
                            </Typography>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <Box component="form" onSubmit={handleDisable}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="error"
                                    disabled={processingDisable}
                                    startIcon={<ShieldBan size={20} />}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Disable 2FA
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Chip label="Disabled" color="error" sx={{ alignSelf: 'flex-start' }} />
                            <Typography variant="body2" color="text.secondary">
                                When you enable two-factor authentication, you
                                will be prompted for a secure pin during login.
                                This pin can be retrieved from a TOTP-supported
                                application on your phone.
                            </Typography>

                            <Box>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                        variant="contained"
                                        startIcon={<ShieldCheck size={20} />}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Continue Setup
                                    </Button>
                                ) : (
                                    <Box component="form" onSubmit={handleEnable}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={processingEnable}
                                            startIcon={<ShieldCheck size={20} />}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Enable 2FA
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </Box>
            </SettingsLayout>
        </AppLayout>
    );
}
