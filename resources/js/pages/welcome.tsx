import { dashboard, home } from '@/routes';
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
    Paper,
    Stack,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Dashboard,
    FormatQuote,
    Article,
    Notifications,
    AccessTime,
    TrendingUp,
    Favorite,
    Star,
    Psychology,
    AutoAwesome,
    Download,
} from '@mui/icons-material';
import ContactForm from '@/components/contact-form';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const theme = useTheme();

    const features = [
        {
            icon: <FormatQuote sx={{ fontSize: 32 }} />,
            title: 'Frases Inspiradoras',
            description: 'Recibe frases motivadoras seleccionadas especialmente para ti cada día',
            color: theme.palette.primary.main,
        },
        {
            icon: <Article sx={{ fontSize: 32 }} />,
            title: 'Artículos de Calidad',
            description: 'Accede a contenido inspirador que te ayudará a crecer personalmente',
            color: theme.palette.secondary.main,
        },
        {
            icon: <Notifications sx={{ fontSize: 32 }} />,
            title: 'Notificaciones Personalizadas',
            description: 'Configura cuándo y cómo recibir tus notificaciones diarias',
            color: theme.palette.primary.light,
        },
        {
            icon: <AccessTime sx={{ fontSize: 32 }} />,
            title: 'Horarios Flexibles',
            description: 'Elige los momentos del día en que quieres recibir inspiración',
            color: theme.palette.secondary.light,
        },
        {
            icon: <Psychology sx={{ fontSize: 32 }} />,
            title: 'Crecimiento Personal',
            description: 'Desarrolla tu potencial con contenido diseñado para tu crecimiento',
            color: theme.palette.primary.main,
        },
        {
            icon: <AutoAwesome sx={{ fontSize: 32 }} />,
            title: 'Contenido Curado',
            description: 'Disfruta de contenido cuidadosamente seleccionado para inspirarte',
            color: theme.palette.secondary.main,
        },
    ];

    const benefits = [
        {
            icon: <TrendingUp sx={{ fontSize: 32 }} />,
            text: 'Mejora tu actitud diaria',
        },
        {
            icon: <Favorite sx={{ fontSize: 32 }} />,
            text: 'Mantén la motivación constante',
        },
        {
            icon: <Star sx={{ fontSize: 32 }} />,
            text: 'Desarrolla hábitos positivos',
        },
    ];

    return (
        <>
            <Head title="Aurea - Tu Inspiración Diaria" />
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
                            href="/download-app"
                            variant="text"
                            startIcon={<Download />}
                            sx={{ textTransform: 'none', mr: 2 }}
                        >
                            Descargar
                        </Button>
                        {auth.user ? (
                            <Button
                                component={Link}
                                href={dashboard().url}
                                variant="contained"
                                startIcon={<Dashboard />}
                                sx={{ textTransform: 'none' }}
                            >
                                Dashboard
                            </Button>
                        ) : null}
                    </Toolbar>
                </AppBar>

                {/* Hero Section */}
                <Box
                    sx={{
                        position: 'relative',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                        py: { xs: 8, md: 12 },
                        overflow: 'hidden',
                    }}
                >
                    <Container maxWidth="lg">
                        <Grid container spacing={4} alignItems="stretch">
                            <Grid item xs={12} lg={6}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: { xs: 'center', md: 'flex-start' },
                                        mb: 3,
                                    }}
                                >
                                    {/* <img
                                        src="/img/logo-7.png"
                                        alt="Aurea"
                                        style={{ height: 80, maxWidth: 200 }}
                                    /> */}
                                </Box>
                                <Typography
                                    variant="h2"
                                    component="h1"
                                    gutterBottom
                                    fontWeight={700}
                                    sx={{
                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                        lineHeight: 1.2,
                                        mb: 2,
                                    }}
                                >
                                    Inspiración
                                    <br />
                                    <Box
                                        component="span"
                                        sx={{
                                            color: 'primary.main',
                                            display: 'inline-block',
                                        }}
                                    >
                                        Todos los Días
                                    </Box>
                                </Typography>
                                <Typography
                                    variant="h5"
                                    color="text.secondary"
                                    paragraph
                                    sx={{ mb: 4, fontWeight: 400 }}
                                >
                                    Transforma cada día con frases motivadoras y artículos
                                    inspiradores. Tu bienestar personal comienza aquí.
                                </Typography>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                                    {!auth.user && (
                                        <>
                                            <Button
                                                component={Link}
                                                href="/download-app"
                                                variant="contained"
                                                size="large"
                                                startIcon={<Download />}
                                                sx={{
                                                    textTransform: 'none',
                                                    px: 4,
                                                    py: 1.5,
                                                    fontSize: '1.1rem',
                                                }}
                                            >
                                                Descargar App
                                            </Button>
                                        </>
                                    )}
                                    {auth.user && (
                                        <Button
                                            component={Link}
                                            href={dashboard().url}
                                            variant="contained"
                                            size="large"
                                            startIcon={<Dashboard />}
                                            sx={{
                                                textTransform: 'none',
                                                px: 4,
                                                py: 1.5,
                                                fontSize: '1.1rem',
                                            }}
                                        >
                                            Ir al Dashboard
                                        </Button>
                                    )}
                                </Stack>

                                {/* Benefits */}
                                <Stack direction="row" spacing={3} flexWrap="wrap">
                                    {benefits.map((benefit, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                color: 'text.secondary',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    color: 'primary.main',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                {benefit.icon}
                                            </Box>
                                            <Typography variant="body2" fontWeight={500}>
                                                {benefit.text}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Grid>
                            <Grid item xs={12} lg={6}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        gap: 2,
                                        width: '100%',
                                    }}
                                >
                                    <Paper
                                        elevation={8}
                                        sx={{
                                            p: 3,
                                            flex: 1,
                                            borderRadius: 4,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
                                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minHeight: { xs: 'auto', sm: 200 },
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontStyle: 'italic',
                                                color: 'text.primary',
                                                mb: 2,
                                                fontSize: '1rem',
                                                flexGrow: 1,
                                            }}
                                        >
                                            "El éxito no es final, el fracaso no es fatal:
                                            <br />
                                            es el valor de continuar lo que cuenta."
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="right">
                                            — Winston Churchill
                                        </Typography>
                                    </Paper>

                                    <Paper
                                        elevation={8}
                                        sx={{
                                            p: 3,
                                            flex: 1,
                                            borderRadius: 4,
                                            background: `linear-gradient(135deg, ${theme.palette.secondary.main}15 0%, ${theme.palette.primary.main}15 100%)`,
                                            border: `2px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minHeight: { xs: 'auto', sm: 200 },
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontStyle: 'italic',
                                                color: 'text.primary',
                                                mb: 2,
                                                fontSize: '1rem',
                                                flexGrow: 1,
                                            }}
                                        >
                                            "El único modo de hacer un gran trabajo es amar
                                            <br />
                                            lo que haces."
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="right">
                                            — Steve Jobs
                                        </Typography>
                                    </Paper>

                                    <Paper
                                        elevation={8}
                                        sx={{
                                            p: 3,
                                            flex: 1,
                                            borderRadius: 4,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
                                            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minHeight: { xs: 'auto', sm: 200 },
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontStyle: 'italic',
                                                color: 'text.primary',
                                                mb: 2,
                                                fontSize: '1rem',
                                                flexGrow: 1,
                                            }}
                                        >
                                            "La vida es lo que te pasa mientras estás ocupado
                                            <br />
                                            haciendo otros planes."
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="right">
                                            — John Lennon
                                        </Typography>
                                    </Paper>
                                </Box>
                            </Grid>
                        </Grid>
                    </Container>
                </Box>

                {/* Features Section */}
                <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h3"
                            component="h2"
                            gutterBottom
                            fontWeight={600}
                            sx={{ mb: 2 }}
                        >
                            ¿Por qué elegir Aurea?
                        </Typography>
                        <Typography variant="h6" color="text.secondary" maxWidth="600px" mx="auto">
                            Una plataforma diseñada para inspirarte y motivarte cada día de tu vida
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(3, 1fr)',
                            },
                            gap: 3,
                        }}
                    >
                        {features.map((feature, index) => (
                            <Box key={index} sx={{ display: 'flex' }}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        height: '100%',
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4,
                                        },
                                    }}
                                >
                                    <CardContent
                                        sx={{
                                            p: 3,
                                            flexGrow: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                color: feature.color,
                                                mb: 2,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                minHeight: 48,
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            component="h3"
                                            gutterBottom
                                            fontWeight={600}
                                            sx={{
                                                mb: 1.5,
                                                minHeight: { xs: 'auto', md: 56 },
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.1rem',
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                flexGrow: 1,
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                </Container>

                {/* CTA Section */}
                {!auth.user && (
                    <Box
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            py: { xs: 8, md: 12 },
                            color: 'white',
                        }}
                    >
                        <Container maxWidth="md">
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography
                                    variant="h3"
                                    component="h2"
                                    gutterBottom
                                    fontWeight={600}
                                    sx={{ mb: 2 }}
                                >
                                    ¿Listo para comenzar?
                                </Typography>
                                <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                                    Únete a miles de personas que ya están transformando sus días
                                    con Aurea
                                </Typography>
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    justifyContent="center"
                                >
                                    <Button
                                        component={Link}
                                        href="/download-app"
                                        variant="contained"
                                        size="large"
                                        startIcon={<Download />}
                                        sx={{
                                            textTransform: 'none',
                                            px: 4,
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            bgcolor: 'white',
                                            color: 'primary.main',
                                            '&:hover': {
                                                bgcolor: 'grey.100',
                                            },
                                        }}
                                    >
                                        Descargar App
                                    </Button>
                                </Stack>
                            </Box>
                        </Container>
                    </Box>
                )}

                {/* Contact Form Section */}
                <Box
                    sx={{
                        bgcolor: 'background.paper',
                        py: 8,
                    }}
                >
                    <Container maxWidth="md">
                        <ContactForm
                            title="Contáctanos"
                            description="¿Tienes alguna pregunta o sugerencia? Escríbenos y te responderemos pronto."
                        />
                    </Container>
                </Box>

                {/* Footer */}
                <Box
                    component="footer"
                    sx={{
                        bgcolor: 'background.paper',
                        borderTop: 1,
                        borderColor: 'divider',
                        py: 4,
                        mt: 'auto',
                    }}
                >
                    <Container maxWidth="lg">
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <img
                                    src="/img/logo-7.png"
                                    alt="Aurea"
                                    style={{ height: 40, maxWidth: 120 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    © {new Date().getFullYear()} Aurea. Inspiración diaria.
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    component={Link}
                                    href="/download-app"
                                    variant="text"
                                    size="small"
                                    sx={{ textTransform: 'none' }}
                                >
                                    Descargar App
                                </Button>
                                {auth.user && (
                                    <Button
                                        component={Link}
                                        href={dashboard().url}
                                        variant="text"
                                        size="small"
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Dashboard
                                    </Button>
                                )}
                            </Stack>
                        </Box>
                    </Container>
                </Box>
            </Box>
        </>
    );
}
