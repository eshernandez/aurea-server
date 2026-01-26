import { Typography, Box } from '@mui/material';

export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <Box sx={variant === 'small' ? {} : { mb: 4 }}>
            <Typography
                variant={variant === 'small' ? 'h6' : 'h5'}
                component="h2"
                fontWeight={variant === 'small' ? 500 : 600}
                gutterBottom={!!description}
            >
                {title}
            </Typography>
            {description && (
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            )}
        </Box>
    );
}
