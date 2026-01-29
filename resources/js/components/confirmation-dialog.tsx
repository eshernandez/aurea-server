import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    loading?: boolean;
}

export default function ConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title = 'Confirmar acción',
    message,
    confirmText = 'Sí',
    cancelText = 'No',
    confirmColor = 'primary',
    loading = false,
}: ConfirmationDialogProps) {
    const handleConfirm = () => {
        onConfirm();
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
                    <WarningIcon color="warning" />
                    {title}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1">{message}</Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading} variant="outlined">
                    {cancelText}
                </Button>
                <Button
                    onClick={handleConfirm}
                    disabled={loading}
                    variant="contained"
                    color={confirmColor}
                    autoFocus
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
