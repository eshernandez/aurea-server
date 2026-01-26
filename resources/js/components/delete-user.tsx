import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
} from '@mui/material';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    const { data, setData, delete: deleteMethod, processing, errors, reset } = useForm({
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        deleteMethod(ProfileController.destroy().url, {
            preserveScroll: true,
            onError: () => {
                passwordInput.current?.focus();
            },
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Heading
                variant="small"
                title="Delete account"
                description="Delete your account and all of its resources"
            />
            <Alert
                severity="warning"
                sx={{
                    bgcolor: 'error.light',
                    color: 'error.dark',
                    border: 1,
                    borderColor: 'error.main',
                }}
            >
                <Box>
                    <Box sx={{ fontWeight: 600, mb: 0.5 }}>Warning</Box>
                    <Box sx={{ fontSize: '0.875rem' }}>
                        Please proceed with caution, this cannot be undone.
                    </Box>
                </Box>
            </Alert>

            <Button
                variant="contained"
                color="error"
                onClick={() => setOpen(true)}
                data-test="delete-user-button"
                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
            >
                Delete account
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Are you sure you want to delete your account?
                </DialogTitle>
                <Box component="form" onSubmit={handleSubmit}>
                    <DialogContent>
                        <Box sx={{ mb: 2 }}>
                            Once your account is deleted, all of its resources
                            and data will also be permanently deleted. Please
                            enter your password to confirm you would like to
                            permanently delete your account.
                        </Box>
                        <TextField
                            id="password"
                            name="password"
                            type="password"
                            label="Password"
                            inputRef={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="Password"
                            error={!!errors.password}
                            helperText={errors.password}
                            fullWidth
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setOpen(false);
                                reset();
                            }}
                            sx={{ textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="error"
                            disabled={processing}
                            data-test="confirm-delete-user-button"
                            sx={{ textTransform: 'none' }}
                        >
                            Delete account
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Box>
    );
}
