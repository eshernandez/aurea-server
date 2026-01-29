import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardHeader,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Stack,
    IconButton,
} from '@mui/material';
import { useState } from 'react';
import { Search as SearchIcon, Add as AddIcon, Visibility, Edit, Delete } from '@mui/icons-material';
import ConfirmationDialog from '@/components/confirmation-dialog';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    quotes_count?: number;
    articles_count?: number;
}

interface PaginatedCategories {
    data: Category[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    categories: PaginatedCategories;
    filters: {
        search?: string;
        is_active?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Categorías',
        href: '/admin/categories',
    },
];

export default function CategoriesIndex({ categories, filters: initialFilters }: Props) {
    const [filters, setFilters] = useState(initialFilters);
    const [search, setSearch] = useState(initialFilters.search || '');

    const handleSearch = () => {
        router.get(
            '/admin/categories',
            { search, is_active: filters.is_active },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value === 'all' ? undefined : value === 'true' };
        setFilters(newFilters);
        router.get('/admin/categories', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
    }>({
        open: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const handleDelete = (id: number) => {
        setConfirmDialog({
            open: true,
            title: 'Eliminar categoría',
            message: '¿Estás seguro de eliminar esta categoría?',
            confirmColor: 'error',
            onConfirm: () => {
                setConfirmDialog({ ...confirmDialog, open: false });
                router.delete(`/admin/categories/${id}`, {
                    preserveScroll: true,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categorías" />
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                            Categorías
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Gestiona las categorías de contenido
                        </Typography>
                    </Box>
                    <Button
                        component={Link}
                        href="/admin/categories/create"
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ textTransform: 'none' }}
                    >
                        Nueva Categoría
                    </Button>
                </Box>

                {/* Filters */}
                <Card sx={{ mb: 3 }}>
                    <CardHeader title="Filtros" />
                    <CardContent>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <TextField
                                id="search"
                                label="Buscar"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Buscar por nombre o slug..."
                                sx={{ flex: 1, minWidth: 200 }}
                                InputProps={{
                                    endAdornment: (
                                        <Button
                                            onClick={handleSearch}
                                            startIcon={<SearchIcon />}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Buscar
                                        </Button>
                                    ),
                                }}
                            />
                            <FormControl sx={{ minWidth: 150 }}>
                                <InputLabel id="is_active-label">Estado</InputLabel>
                                <Select
                                    labelId="is_active-label"
                                    id="is_active"
                                    value={filters.is_active === undefined ? 'all' : filters.is_active.toString()}
                                    onChange={(e) => handleFilterChange('is_active', e.target.value)}
                                    label="Estado"
                                >
                                    <MenuItem value="all">Todos</MenuItem>
                                    <MenuItem value="true">Activos</MenuItem>
                                    <MenuItem value="false">Inactivos</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader
                        title={
                            <Typography variant="h6" fontWeight={600}>
                                Lista de Categorías ({categories.total})
                            </Typography>
                        }
                    />
                    <CardContent>
                        {categories.data.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                                No se encontraron categorías
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Nombre</TableCell>
                                            <TableCell>Slug</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell>Frases</TableCell>
                                            <TableCell>Artículos</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {categories.data.map((category) => (
                                            <TableRow key={category.id} hover>
                                                <TableCell>{category.id}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {category.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {category.slug}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={category.is_active ? 'Activo' : 'Inactivo'}
                                                        color={category.is_active ? 'success' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{category.quotes_count || 0}</TableCell>
                                                <TableCell>{category.articles_count || 0}</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1}>
                                                        <IconButton
                                                            component={Link}
                                                            href={`/admin/categories/${category.id}`}
                                                            size="small"
                                                            color="primary"
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            component={Link}
                                                            href={`/admin/categories/${category.id}/edit`}
                                                            size="small"
                                                            color="primary"
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleDelete(category.id)}
                                                            size="small"
                                                            color="error"
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* Pagination */}
                        {categories.last_page > 1 && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Mostrando {categories.data.length} de {categories.total} categorías
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    {categories.links.map((link, index) => {
                                        if (!link.url) {
                                            return (
                                                <Button
                                                    key={index}
                                                    disabled
                                                    variant={link.active ? 'contained' : 'outlined'}
                                                    sx={{ minWidth: 40 }}
                                                >
                                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                </Button>
                                            );
                                        }
                                        return (
                                            <Button
                                                key={index}
                                                component={Link}
                                                href={link.url}
                                                variant={link.active ? 'contained' : 'outlined'}
                                                sx={{ minWidth: 40, textTransform: 'none' }}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Button>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Container>

            <ConfirmationDialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                confirmColor={confirmDialog.confirmColor}
            />
        </AppLayout>
    );
}
