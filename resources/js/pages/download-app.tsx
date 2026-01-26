import { home } from '@/routes';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Box,
    Button,
    Container,
    Typography,
    AppBar,
    Toolbar,
    Grid,
    Card,
    CardContent,
    CardActions,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Android,
    Apple,
    Download,
} from '@mui/icons-material';
import ContactForm from '@/components/contact-form';

export default function DownloadApp() {
    const { auth } = usePage<SharedData>().props;
    const theme = useTheme();

    const downloadOptions = [
        {
            icon: <Android sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
            title: 'ANDROID',
            subtitle: 'Google Play Store',
            link: 'https://play.google.com/store/apps/details?id=com.aurea.app', // Link temporal
        },
        {
            icon: <Apple sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
            title: 'IOS',
            subtitle: 'App Store',
            link: 'https://apps.apple.com/app/aurea/id123456789', // Link temporal
        },
        {
            icon: <Download sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
            title: 'ANDROID',
            subtitle: 'Descarga Directa - APP V2.0.0',
            link: 'https://example.com/aurea-v2.0.0.apk', // Link temporal
        },
    ];

    return (
        <>
            <Head title="Descarga Nuestra APP - Aurea" />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.default',
                }}
            >
                {/* Header */}
                <AppBar
                    position="sticky"
                    elevation={0}
                    sx={{
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Toolbar>
                        <Link
                            href={home().url}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                textDecoration: 'none',
                            }}
                        >
                            <img
                                src="/img/logo-7.png"
                                alt="Aurea"
                                style={{ height: 50, maxWidth: 150 }}
                            />
                        </Link>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                            component={Link}
                            href={home().url}
                            variant="text"
                            sx={{ textTransform: 'none', mr: 2 }}
                        >
                            Inicio
                        </Button>
                        <Button
                            component={Link}
                            href="/download-app"
                            variant="text"
                            sx={{ textTransform: 'none', mr: 2 }}
                        >
                            Descargar
                        </Button>
                        {auth.user && (
                            <Button
                                component={Link}
                                href="/dashboard"
                                variant="contained"
                                sx={{ textTransform: 'none' }}
                            >
                                Dashboard
                            </Button>
                        )}
                    </Toolbar>
                </AppBar>

                {/* Main Content */}
                <Box
                    sx={{
                        position: 'relative',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                        py: { xs: 8, md: 12 },
                        overflow: 'hidden',
                        flexGrow: 1,
                    }}
                >
                    {/* Wavy background pattern */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '200px',
                            background: `linear-gradient(to top, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
                            clipPath: 'polygon(0 30%, 100% 0%, 100% 100%, 0% 100%)',
                        }}
                    />

                    <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                        {/* Title Section */}
                        <Box sx={{ textAlign: 'center', mb: 8 }}>
                            <Typography
                                variant="h2"
                                component="h1"
                                sx={{
                                    fontWeight: 700,
                                    color: theme.palette.primary.main,
                                    mb: 3,
                                    fontSize: { xs: '2rem', md: '3rem' },
                                }}
                            >
                                Descarga Nuestra APP
                            </Typography>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{
                                    maxWidth: 600,
                                    mx: 'auto',
                                    fontWeight: 400,
                                    fontSize: { xs: '1rem', md: '1.25rem' },
                                }}
                            >
                                Puedes descargar y utilizar nuestro sistema en los siguientes SO
                            </Typography>
                        </Box>

                        {/* Download Cards */}
                        <Grid 
                            container 
                            spacing={4} 
                            sx={{ 
                                mb: 8,
                                justifyContent: 'center',
                                alignItems: 'stretch',
                            }}
                        >
                            {downloadOptions.map((option, index) => (
                                <Grid 
                                    item 
                                    xs={12} 
                                    sm={6} 
                                    md={4} 
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                    }}
                                >
                                    <Card
                                        elevation={3}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            borderRadius: 2,
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 6,
                                            },
                                        }}
                                    >
                                        <CardContent 
                                            sx={{ 
                                                flexGrow: 1, 
                                                textAlign: 'center', 
                                                py: 5, 
                                                px: 3,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                minHeight: 240,
                                            }}
                                        >
                                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <Box sx={{ mb: 3, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {option.icon}
                                                </Box>
                                                <Typography
                                                    variant="h5"
                                                    component="h3"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: theme.palette.primary.main,
                                                        mb: 2,
                                                        fontSize: '1.5rem',
                                                        height: 36,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    {option.title}
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontSize: '1rem',
                                                        lineHeight: 1.6,
                                                        minHeight: 60,
                                                        maxHeight: 60,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {option.subtitle}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'center', pb: 4, px: 3, pt: 0, mt: 'auto' }}>
                                            <Button
                                                component="a"
                                                href={option.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                variant="contained"
                                                sx={{
                                                    bgcolor: theme.palette.primary.main,
                                                    color: 'white',
                                                    textTransform: 'none',
                                                    px: 4,
                                                    py: 1.5,
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    minWidth: 120,
                                                    width: 120,
                                                    '&:hover': {
                                                        bgcolor: theme.palette.primary.dark,
                                                    },
                                                }}
                                            >
                                                IR
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Contact Form Section */}
                        <Box sx={{ mt: 8 }}>
                            <ContactForm
                                title="Contáctanos"
                                description="¿Tienes alguna pregunta sobre la descarga o necesitas ayuda? Escríbenos y te responderemos pronto."
                            />
                        </Box>
                    </Container>
                </Box>
            </Box>
        </>
    );
}
