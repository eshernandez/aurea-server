import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { Link } from '@inertiajs/react';
import { Box, Container, Typography, Paper } from '@mui/material';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                py: 4,
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                        <Link href={home()} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <img
                                src="/img/logo-7.png"
                                alt="Aurea"
                                style={{ height: 80, maxWidth: 200, marginBottom: 16 }}
                            />
                        </Link>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center">
                            {description}
                        </Typography>
                    </Box>
                    {children}
                </Paper>
            </Container>
        </Box>
    );
}
