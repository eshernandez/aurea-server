import { createTheme } from '@mui/material/styles';

export const aureaTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#D4AF37', // Dorado elegante (Aurea = dorado)
            light: '#E8D5A3',
            dark: '#B8941F',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#1A4D3E', // Verde esmeralda oscuro (complementario elegante)
            light: '#2D6B5A',
            dark: '#0F2E24',
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#FAFAFA',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1A1A1A',
            secondary: '#666666',
        },
        error: {
            main: '#D32F2F',
        },
        warning: {
            main: '#F57C00',
        },
        info: {
            main: '#1976D2',
        },
        success: {
            main: '#388E3C',
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
    },
});
