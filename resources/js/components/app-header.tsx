import { Breadcrumbs } from '@/components/breadcrumbs';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    AppBar,
    Toolbar,
    Box,
    Button,
    IconButton,
    Menu,
    Avatar,
    Typography,
    Divider,
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { BookOpen, Folder, LayoutGrid, Menu as MenuIcon, Search } from 'lucide-react';
import { Menu as MenuIconMui, Search as SearchIcon, Book as BookIcon, Folder as FolderIcon } from '@mui/icons-material';
import { useState } from 'react';
import AppLogo from './app-logo';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { isCurrentUrl } = useCurrentUrl();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setUserMenuAnchor(null);
    };

    return (
        <>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
                    {/* Mobile Menu */}
                    {isMobile && (
                        <IconButton
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIconMui />
                        </IconButton>
                    )}

                    <Link
                        href={dashboard()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                        }}
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <Box sx={{ ml: 3, display: { xs: 'none', lg: 'flex' }, gap: 1 }}>
                        {mainNavItems.map((item, index) => (
                            <Button
                                key={index}
                                component={Link}
                                href={item.href}
                                variant={isCurrentUrl(item.href) ? 'contained' : 'text'}
                                startIcon={item.icon && <item.icon size={20} />}
                                sx={{
                                    textTransform: 'none',
                                    bgcolor: isCurrentUrl(item.href) ? 'primary.main' : 'transparent',
                                    color: isCurrentUrl(item.href) ? 'primary.contrastText' : 'text.primary',
                                }}
                            >
                                {item.title}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton size="small">
                            <SearchIcon />
                        </IconButton>
                        <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 0.5 }}>
                            {rightNavItems.map((item) => (
                                <IconButton
                                    key={item.title}
                                    component="a"
                                    href={toUrl(item.href)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    size="small"
                                    title={item.title}
                                >
                                    {item.icon === Folder ? (
                                        <FolderIcon />
                                    ) : item.icon === BookOpen ? (
                                        <BookIcon />
                                    ) : (
                                        item.icon && <item.icon size={20} />
                                    )}
                                </IconButton>
                            ))}
                        </Box>
                        <IconButton
                            onClick={handleUserMenuOpen}
                            sx={{ p: 0.5 }}
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
                                {!auth.user.avatar &&
                                    auth.user.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()
                                        .slice(0, 2)}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={userMenuAnchor}
                            open={Boolean(userMenuAnchor)}
                            onClose={handleUserMenuClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <UserMenuContent user={auth.user} onClose={handleUserMenuClose} />
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', lg: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 280,
                        bgcolor: 'background.paper',
                    },
                }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <img
                        src="/img/logo-7.png"
                        alt="Aurea"
                        style={{ height: 40, width: 'auto' }}
                    />
                </Box>
                <List sx={{ flex: 1, p: 2 }}>
                    {mainNavItems.map((item) => (
                        <ListItem key={item.title} disablePadding>
                            <ListItemButton
                                component={Link}
                                href={item.href}
                                selected={isCurrentUrl(item.href)}
                                onClick={handleDrawerToggle}
                            >
                                {item.icon && (
                                    <ListItemIcon>
                                        <item.icon size={20} />
                                    </ListItemIcon>
                                )}
                                <ListItemText primary={item.title} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List sx={{ p: 2 }}>
                    {rightNavItems.map((item) => (
                        <ListItem key={item.title} disablePadding>
                            <ListItemButton
                                component="a"
                                href={toUrl(item.href)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleDrawerToggle}
                            >
                                {item.icon && (
                                    <ListItemIcon>
                                        {item.icon === Folder ? (
                                            <FolderIcon />
                                        ) : item.icon === BookOpen ? (
                                            <BookIcon />
                                        ) : (
                                            <item.icon size={20} />
                                        )}
                                    </ListItemIcon>
                                )}
                                <ListItemText primary={item.title} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 1 && (
                <Box
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Toolbar
                        variant="dense"
                        sx={{
                            px: { xs: 2, md: 4 },
                            minHeight: '48px !important',
                        }}
                    >
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </Toolbar>
                </Box>
            )}
        </>
    );
}
