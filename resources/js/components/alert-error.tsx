import { Alert, AlertTitle } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

export default function AlertError({
    errors,
    title,
}: {
    errors: string[];
    title?: string;
}) {
    if (errors.length === 0) return null;

    return (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 3 }}>
            <AlertTitle>{title || 'Something went wrong.'}</AlertTitle>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
                {Array.from(new Set(errors)).map((error, index) => (
                    <li key={index}>{error}</li>
                ))}
            </ul>
        </Alert>
    );
}
