import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';
import { Link, router } from '@inertiajs/react';
import {
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Box,
} from '@mui/material';
import { Settings as SettingsIcon, Logout as LogoutIcon } from '@mui/icons-material';

type Props = {
    user: User;
    onClose?: () => void;
};

export function UserMenuContent({ user, onClose }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        cleanup();
        onClose?.();
        router.post(logout().url);
    };

    return (
        <>
            <Box sx={{ p: 2, minWidth: 200 }}>
                <UserInfo user={user} showEmail={true} />
            </Box>
            <Divider />
            <MenuItem
                component={Link}
                href={edit().url}
                onClick={() => {
                    cleanup();
                    onClose?.();
                }}
            >
                <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
                onClick={handleLogout}
            >
                <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Log out</ListItemText>
            </MenuItem>
        </>
    );
}
