import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import {
    Box,
    Container,
    Card,
    CardContent,
    CardHeader,
    Typography,
} from '@mui/material';
import type { PropsWithChildren } from 'react';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                bgcolor: 'background.default',
                p: { xs: 3, md: 5 },
            }}
        >
            <Container maxWidth="sm">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Link
                        href={home()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                        }}
                    >
                        <img
                            src="/img/logo-7.png"
                            alt="Aurea"
                            style={{ height: 64, width: 'auto' }}
                        />
                    </Link>

                    <Card elevation={3} sx={{ borderRadius: 3 }}>
                        <CardHeader
                            sx={{
                                px: { xs: 4, md: 6 },
                                pt: 4,
                                pb: 0,
                                textAlign: 'center',
                            }}
                        >
                            {title && (
                                <Typography variant="h5" component="h1" fontWeight={600}>
                                    {title}
                                </Typography>
                            )}
                            {description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {description}
                                </Typography>
                            )}
                        </CardHeader>
                        <CardContent sx={{ px: { xs: 4, md: 6 }, py: 4 }}>
                            {children}
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}
