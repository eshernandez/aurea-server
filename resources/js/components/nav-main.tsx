import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
} from '@mui/material';

export function NavMain({
    items = [],
    onItemClick,
    collapsed = false,
}: {
    items: NavItem[];
    onItemClick?: () => void;
    collapsed?: boolean;
}) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <Box sx={{ p: collapsed ? 1 : 2 }}>
            {!collapsed && (
                <Typography
                    variant="overline"
                    sx={{
                        px: 2,
                        py: 1,
                        color: 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                    }}
                >
                    Platform
                </Typography>
            )}
            <List>
                {items.map((item) => (
                    <ListItem key={item.title} disablePadding>
                        <ListItemButton
                            component={Link}
                            href={item.href}
                            selected={isCurrentUrl(item.href)}
                            onClick={onItemClick}
                            sx={{
                                borderRadius: 1,
                                mx: collapsed ? 0.5 : 1,
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                minHeight: 48,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.contrastText',
                                    },
                                },
                            }}
                        >
                            {item.icon && (
                                <ListItemIcon
                                    sx={{
                                        minWidth: collapsed ? 0 : 40,
                                        justifyContent: 'center',
                                        color: 'inherit',
                                    }}
                                >
                                    <item.icon size={20} />
                                </ListItemIcon>
                            )}
                            {!collapsed && <ListItemText primary={item.title} />}
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}
