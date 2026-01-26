import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
} from '@mui/material';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Aurea" />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                        Bienvenido a Aurea
                    </Typography>
                    <Typography variant="h6" color="text.secondary" fontWeight={400}>
                        Tu aplicación de inspiración diaria
                    </Typography>
                </Box>
            </Container>
        </AppLayout>
    );
}
