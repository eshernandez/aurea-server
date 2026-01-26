import { dashboard } from '@/routes';
import type { NavItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Typography,
    useTheme,
} from '@mui/material';
import { LayoutGrid, Users, FolderTree, FileText, Quote } from 'lucide-react';
import AppLogo from './app-logo';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

export function AppSidebar({ onClose, collapsed = false }: { onClose?: () => void; collapsed?: boolean }) {
    const theme = useTheme();
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.is_admin || false;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: isAdmin ? '/admin/dashboard' : dashboard().url,
            icon: LayoutGrid,
        },
    ];

    // Solo agregar opciones de admin si el usuario es administrador
    if (isAdmin) {
        mainNavItems.push(
            {
                title: 'Usuarios',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Categorías',
                href: '/admin/categories',
                icon: FolderTree,
            },
            {
                title: 'Artículos',
                href: '/admin/articles',
                icon: FileText,
            },
            {
                title: 'Frases',
                href: '/admin/quotes',
                icon: Quote,
            }
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: 'background.paper',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: collapsed ? 1.5 : 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    alignItems: 'center',
                }}
            >
                <Link
                    href={isAdmin ? '/admin/dashboard' : dashboard().url}
                    style={{
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        width: '100%',
                    }}
                    onClick={onClose}
                >
                    {collapsed ? (
                        <img
                            src="/img/circly-only.png"
                            alt="Aurea"
                            style={{ height: 32, width: 32 }}
                        />
                    ) : (
                        <AppLogo />
                    )}
                </Link>
            </Box>

            {/* Main Navigation */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <NavMain items={mainNavItems} onItemClick={onClose} collapsed={collapsed} />
            </Box>

            {/* Footer */}
            <Box>
                <Divider />
                <NavUser collapsed={collapsed} />
            </Box>
        </Box>
    );
}
