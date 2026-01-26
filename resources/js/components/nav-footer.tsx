import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
} from '@mui/material';

export function NavFooter({
    items = [],
    onItemClick,
    collapsed = false,
}: {
    items: NavItem[];
    onItemClick?: () => void;
    collapsed?: boolean;
}) {
    return (
        <Box sx={{ p: collapsed ? 1 : 2 }}>
            <List>
                {items.map((item) => (
                    <ListItem key={item.title} disablePadding>
                        <ListItemButton
                            component={Link}
                            href={item.href}
                            onClick={onItemClick}
                            sx={{
                                borderRadius: 1,
                                mx: collapsed ? 0.5 : 1,
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                minHeight: 48,
                            }}
                        >
                            {item.icon && (
                                <ListItemIcon
                                    sx={{
                                        minWidth: collapsed ? 0 : 40,
                                        justifyContent: 'center',
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
