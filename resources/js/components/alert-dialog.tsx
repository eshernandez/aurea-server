import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import { Info as InfoIcon, Error as ErrorIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

interface AlertDialogProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    severity?: 'info' | 'success' | 'error' | 'warning';
    buttonText?: string;
}

export default function AlertDialog({
    open,
    onClose,
    title,
    message,
    severity = 'info',
    buttonText = 'Aceptar',
}: AlertDialogProps) {
    const getIcon = () => {
        switch (severity) {
            case 'success':
                return <CheckCircleIcon color="success" />;
            case 'error':
                return <ErrorIcon color="error" />;
            case 'warning':
                return <InfoIcon color="warning" />;
            default:
                return <InfoIcon color="info" />;
        }
    };

    const getTitle = () => {
        if (title) return title;
        switch (severity) {
            case 'success':
                return 'Éxito';
            case 'error':
                return 'Error';
            case 'warning':
                return 'Advertencia';
            default:
                return 'Información';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                },
            }}
        >
            <DialogTitle>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getIcon()}
                    {getTitle()}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1">{message}</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="contained" color={severity === 'error' ? 'error' : 'primary'} autoFocus>
                    {buttonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
