import { Box, Typography } from '@mui/material';

export default function AppLogo() {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                    src="/img/logo-7.png"
                    alt="Aurea"
                    style={{ height: 32, width: 'auto' }}
                />
            </Box>
            <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                    Aurea
                </Typography>
            </Box>
        </Box>
    );
}
