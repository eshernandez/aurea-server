import Heading from '@/components/heading';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    Box,
    Button,
    Divider,
    List,
    ListItem,
    ListItemButton,
    Typography,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import type { PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: edit().url,
        icon: null,
    },
    {
        title: 'Password',
        href: editPassword().url,
        icon: null,
    },
    {
        title: 'Two-Factor Auth',
        href: show().url,
        icon: null,
    },
    {
        title: 'Appearance',
        href: editAppearance().url,
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <Box sx={{ px: 3, py: 3 }}>
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', lg: 'row' },
                    gap: 3,
                }}
            >
                <Box
                    component="aside"
                    sx={{
                        width: { xs: '100%', lg: 200 },
                        maxWidth: { xs: '100%', lg: 200 },
                    }}
                >
                    <Box
                        component="nav"
                        aria-label="Settings"
                    >
                        <List>
                            {sidebarNavItems.map((item, index) => (
                                <ListItem key={`${toUrl(item.href)}-${index}`} disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        href={item.href}
                                        selected={isCurrentUrl(item.href)}
                                        sx={{
                                            borderRadius: 1,
                                            '&.Mui-selected': {
                                                bgcolor: 'action.selected',
                                            },
                                        }}
                                    >
                                        {item.icon && (
                                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                                <item.icon size={16} />
                                            </Box>
                                        )}
                                        <Typography variant="body2">{item.title}</Typography>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>

                {isMobile && <Divider />}

                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        maxWidth: { md: 672 },
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {children}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
