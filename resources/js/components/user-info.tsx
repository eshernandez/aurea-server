import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';
import { Avatar, Box, Typography } from '@mui/material';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
                src={user.avatar || undefined}
                alt={user.name}
                sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                }}
            >
                {!user.avatar && getInitials(user.name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {user.name}
                </Typography>
                {showEmail && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {user.email}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
