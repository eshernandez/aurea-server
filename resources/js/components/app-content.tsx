import { Box } from '@mui/material';
import * as React from 'react';

type Props = React.ComponentProps<'div'> & {
    variant?: 'header' | 'sidebar';
};

export function AppContent({ variant = 'header', children, ...props }: Props) {
    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                bgcolor: 'background.default',
                minHeight: '100vh',
            }}
            {...props}
        >
            {children}
        </Box>
    );
}
