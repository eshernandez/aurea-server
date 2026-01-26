import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Monitor as MonitorIcon, DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';

export default function AppearanceToggleTab() {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: typeof Sun; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    const handleChange = (_event: React.MouseEvent<HTMLElement>, newValue: Appearance | null) => {
        if (newValue !== null) {
            updateAppearance(newValue);
        }
    };

    const getIcon = (iconType: typeof Sun) => {
        if (iconType === Sun) return <LightModeIcon fontSize="small" />;
        if (iconType === Moon) return <DarkModeIcon fontSize="small" />;
        return <MonitorIcon fontSize="small" />;
    };

    return (
        <Box
            sx={{
                display: 'inline-flex',
                gap: 0.5,
                p: 0.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
            }}
        >
            <ToggleButtonGroup
                value={appearance}
                exclusive
                onChange={handleChange}
                aria-label="appearance selection"
                size="small"
                sx={{
                    '& .MuiToggleButton-root': {
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        '&.Mui-selected': {
                            bgcolor: 'background.paper',
                            color: 'text.primary',
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        },
                    },
                }}
            >
                {tabs.map(({ value, icon, label }) => (
                    <ToggleButton key={value} value={value} aria-label={label}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getIcon(icon)}
                            <Box component="span" sx={{ fontSize: '0.875rem' }}>
                                {label}
                            </Box>
                        </Box>
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
}
