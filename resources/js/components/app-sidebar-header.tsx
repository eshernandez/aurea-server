import { Breadcrumbs } from '@/components/breadcrumbs';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import {
    AppBar,
    Toolbar,
    IconButton,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

export function AppSidebarHeader({
    breadcrumbs = [],
    onMenuClick,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    onMenuClick?: () => void;
}) {
    return (
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
            <Toolbar>
                <IconButton
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2 }}
                    aria-label="toggle sidebar"
                >
                    <MenuIcon />
                </IconButton>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </Toolbar>
        </AppBar>
    );
}
