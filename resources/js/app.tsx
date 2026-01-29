import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';
import { aureaTheme } from './theme/aurea-theme';

const appName = import.meta.env.VITE_APP_NAME || 'Aurea';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        // Verify that the element exists and is a valid Node
        if (!el || !(el instanceof Node)) {
            console.error('Invalid root element for Inertia app');
            return;
        }

        const root = createRoot(el);

        root.render(
            <StrictMode>
                <ThemeProvider theme={aureaTheme}>
                    <CssBaseline />
                    <App {...props} />
                </ThemeProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#D4AF37', // Color primario de Aurea
    },
});

// This will set light / dark mode on load...
initializeTheme();
