import { Link } from '@inertiajs/react';
import { Link as MuiLink } from '@mui/material';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof Link>;

export default function TextLink({
    className = '',
    children,
    ...props
}: Props) {
    return (
        <MuiLink
            component={Link}
            sx={{
                textDecoration: 'underline',
                '&:hover': {
                    textDecoration: 'none',
                },
            }}
            {...props}
        >
            {children}
        </MuiLink>
    );
}
