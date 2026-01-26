import { Typography } from '@mui/material';
import type { HTMLAttributes } from 'react';

export default function InputError({
    message,
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    if (!message) return null;

    return (
        <Typography
            variant="caption"
            color="error"
            sx={{ mt: 0.5, display: 'block' }}
            {...props}
        >
            {message}
        </Typography>
    );
}
