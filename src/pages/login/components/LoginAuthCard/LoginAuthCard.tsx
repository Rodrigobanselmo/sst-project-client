import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

import {
  LOGIN_AUTH_SUBTITLE_AFTER,
  LOGIN_AUTH_SUBTITLE_BEFORE,
  LOGIN_AUTH_SUBTITLE_BRAND,
  LOGIN_AUTH_TITLE,
} from '../../constants/login-institutional.content';

export function LoginAuthCard({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 440,
        mx: 'auto',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'background.border',
        borderRadius: 2,
        p: { xs: 8, sm: 10, md: 10, lg: 12 },
      }}
    >
      <Typography
        component="h2"
        sx={{
          color: 'text.dark',
          fontWeight: 700,
          fontSize: { xs: '1.35rem', md: '1.5rem' },
          lineHeight: 1.3,
          mb: 2,
        }}
      >
        {LOGIN_AUTH_TITLE}
      </Typography>
      <Typography
        sx={{
          color: 'text.medium',
          fontSize: { xs: '0.8125rem', md: '0.875rem' },
          lineHeight: 1.5,
          mb: { xs: 8, md: 10 },
        }}
      >
        {LOGIN_AUTH_SUBTITLE_BEFORE}
        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          {LOGIN_AUTH_SUBTITLE_BRAND}
        </Box>
        {LOGIN_AUTH_SUBTITLE_AFTER}
      </Typography>
      {children}
    </Box>
  );
}
