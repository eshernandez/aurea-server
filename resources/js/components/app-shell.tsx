import { Box } from '@mui/material';
import type { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    variant?: 'header' | 'sidebar';
};

export function AppShell({ children, variant = 'header' }: Props) {
    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                bgcolor: 'background.default',
            }}
        >
            {children}
        </Box>
    );
}
