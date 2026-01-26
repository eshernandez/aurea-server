import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';

export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItemType[];
}) {
    if (breadcrumbs.length === 0) {
        return null;
    }

    return (
        <MuiBreadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
        >
            {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return isLast ? (
                    <Typography key={index} color="text.primary" fontWeight={600}>
                        {item.title}
                    </Typography>
                ) : (
                    <Link
                        key={index}
                        href={item.href}
                        style={{
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        <Typography
                            color="text.secondary"
                            sx={{
                                '&:hover': {
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            {item.title}
                        </Typography>
                    </Link>
                );
            })}
        </MuiBreadcrumbs>
    );
}
