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
    Paper,
    Chip,
    Pagination,
    Stack,
} from '@mui/material';
import { useState } from 'react';
import { Search as SearchIcon } from '@mui/icons-material';

interface UserPreference {
    id: number;
    notifications_enabled: boolean;
    notifications_per_day: number;
}

interface User {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    created_at: string;
    preferences?: UserPreference;
}

interface PaginatedUsers {
    data: User[];
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
    users: PaginatedUsers;
    filters: {
        search?: string;
        is_admin?: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Usuarios',
        href: '/admin/users',
    },
];

export default function UsersIndex({ users, filters: initialFilters }: Props) {
    const [filters, setFilters] = useState(initialFilters);
    const [search, setSearch] = useState(initialFilters.search || '');

    const handleSearch = () => {
        router.get(
            '/admin/users',
            { search, is_admin: filters.is_admin },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = {
            ...filters,
            [key]: value === 'all' ? undefined : value === 'true',
        };
        setFilters(newFilters);
        router.get('/admin/users', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                        Usuarios
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Gestiona los usuarios del sistema
                    </Typography>
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
                                placeholder="Buscar por nombre o email..."
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
                                <InputLabel id="is_admin-label">Tipo</InputLabel>
                                <Select
                                    labelId="is_admin-label"
                                    id="is_admin"
                                    value={filters.is_admin === undefined ? 'all' : filters.is_admin.toString()}
                                    onChange={(e) => handleFilterChange('is_admin', e.target.value)}
                                    label="Tipo"
                                >
                                    <MenuItem value="all">Todos</MenuItem>
                                    <MenuItem value="true">Admins</MenuItem>
                                    <MenuItem value="false">Usuarios</MenuItem>
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
                                Lista de Usuarios ({users.total})
                            </Typography>
                        }
                    />
                    <CardContent>
                        {users.data.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                                No se encontraron usuarios
                            </Typography>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Nombre</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Tipo</TableCell>
                                            <TableCell>Notificaciones</TableCell>
                                            <TableCell>Registrado</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id} hover>
                                                <TableCell>{user.id}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {user.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {user.email}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.is_admin ? 'Admin' : 'Usuario'}
                                                        color={user.is_admin ? 'primary' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {user.preferences?.notifications_enabled ? (
                                                        <Chip
                                                            label={`${user.preferences.notifications_per_day}/día`}
                                                            color="success"
                                                            size="small"
                                                        />
                                                    ) : (
                                                        <Chip label="Desactivadas" size="small" variant="outlined" />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        component={Link}
                                                        href={`/admin/users/${user.id}`}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Ver
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Mostrando {users.data.length} de {users.total} usuarios
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    {users.links.map((link, index) => {
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
        </AppLayout>
    );
}
