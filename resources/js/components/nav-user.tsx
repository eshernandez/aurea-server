import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Box,
    Divider,
    Avatar,
} from '@mui/material';
import { useState } from 'react';
import { MoreVert } from '@mui/icons-material';

export function NavUser({ collapsed = false }: { collapsed?: boolean }) {
    const { auth } = usePage<SharedData>().props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (collapsed) {
        return (
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                <IconButton
                    size="small"
                    onClick={handleClick}
                    sx={{
                        width: 40,
                        height: 40,
                    }}
                >
                    <Avatar
                        src={auth.user.avatar || undefined}
                        alt={auth.user.name}
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                        }}
                    >
                        {!auth.user.avatar && auth.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </Avatar>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                >
                    <UserMenuContent user={auth.user} onClose={handleClose} />
                </Menu>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    borderRadius: 1,
                }}
            >
                <UserInfo user={auth.user} />
                <IconButton
                    size="small"
                    onClick={handleClick}
                    sx={{ ml: 'auto' }}
                >
                    <MoreVert />
                </IconButton>
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <UserMenuContent user={auth.user} onClose={handleClose} />
            </Menu>
        </Box>
    );
}
