import { home } from '@/routes';
import type { AuthLayoutProps, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    useTheme,
    useMediaQuery,
} from '@mui/material';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage<SharedData>().props;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                minHeight: '100vh',
            }}
        >
            {/* Left side - Desktop only */}
            <Box
                sx={{
                    display: { xs: 'none', lg: 'flex' },
                    flexDirection: 'column',
                    bgcolor: 'grey.900',
                    color: 'white',
                    p: 5,
                    position: 'relative',
                }}
            >
                <Link
                    href={home()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'white',
                        position: 'relative',
                        zIndex: 2,
                        marginBottom: 'auto',
                    }}
                >
                    <img
                        src="/img/logo-7.png"
                        alt="Aurea"
                        style={{ height: 40, width: 'auto', marginRight: 8 }}
                    />
                    <Typography variant="h6" component="span" fontWeight={500}>
                        {name}
                    </Typography>
                </Link>
            </Box>

            {/* Right side - Form */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 3, lg: 4 },
                    width: '100%',
                }}
            >
                <Container maxWidth="sm">
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Mobile logo */}
                        <Box
                            sx={{
                                display: { xs: 'flex', lg: 'none' },
                                justifyContent: 'center',
                                mb: 2,
                            }}
                        >
                            <Link
                                href={home()}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textDecoration: 'none',
                                }}
                            >
                                <img
                                    src="/img/logo-7.png"
                                    alt="Aurea"
                                    style={{ height: 64, width: 'auto' }}
                                />
                            </Link>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                textAlign: { xs: 'center', sm: 'center' },
                            }}
                        >
                            <Typography variant="h5" component="h1" fontWeight={500}>
                                {title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {description}
                            </Typography>
                        </Box>

                        {children}
                    </Box>
                </Container>
            </Box>
        </Box>
    );
}
