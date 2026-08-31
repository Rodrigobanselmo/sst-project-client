import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import {
  LOGIN_HEADLINE_ACCENT,
  LOGIN_HEADLINE_LEAD,
  LOGIN_HEADLINE_REST,
  LOGIN_SUBTITLE,
} from '../../constants/login-institutional.content';
import { LoginAmbientGraphic } from '../LoginAmbientGraphic/LoginAmbientGraphic';
import { LoginAuthBrand } from '../LoginAuthBrand/LoginAuthBrand';
import { LoginInstitutionalStats } from '../LoginInstitutionalStats/LoginInstitutionalStats';
import { LoginModuleMap } from '../LoginModuleMap/LoginModuleMap';

export function LoginHeadline({ compact = false }: { compact?: boolean }) {
  return (
    <Typography
      component="h1"
      sx={{
        color: 'text.dark',
        fontWeight: 700,
        fontSize: compact
          ? '1.35rem'
          : { sm: '1.65rem', md: '1.9rem', lg: '2.35rem' },
        lineHeight: 1.25,
        letterSpacing: '-0.02em',
        mt: compact ? 6 : { sm: 6, md: 8, lg: 10 },
        mb: compact ? 0 : { sm: 3, md: 4 },
      }}
    >
      {LOGIN_HEADLINE_LEAD}
      <br />
      {LOGIN_HEADLINE_REST}{' '}
      <Box component="span" sx={{ color: 'primary.main' }}>
        {LOGIN_HEADLINE_ACCENT}
      </Box>
    </Typography>
  );
}

export function LoginInstitutionalPanel() {
  return (
    <Box
      component="section"
      aria-label="SimpleSST"
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: { sm: 'flex-start', md: 'center' },
        flex: 1,
        minWidth: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '10% 12% 22% 8%',
          pointerEvents: 'none',
          zIndex: 0,
          background: (theme) =>
            `radial-gradient(ellipse 70% 55% at 42% 48%, ${alpha(
              theme.palette.primary.main,
              theme.palette.mode === 'dark' ? 0.07 : 0.035,
            )} 0%, transparent 64%)`,
        },
      }}
    >
      <LoginAmbientGraphic />
      <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }}>
        <LoginAuthBrand />
      </Box>
      <Box sx={{ display: { xs: 'none', sm: 'block' }, position: 'relative' }}>
        <LoginHeadline />
        <Typography
          sx={{
            color: 'text.medium',
            fontSize: { sm: '0.875rem', md: '0.9375rem' },
            lineHeight: 1.55,
            maxWidth: 480,
            mb: { sm: 6, md: 7, lg: 8 },
          }}
        >
          {LOGIN_SUBTITLE}
        </Typography>
      </Box>
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { lg: 'center' },
          gap: { md: 6, lg: 5 },
          minWidth: 0,
        }}
      >
        <Box sx={{ position: 'relative', flex: { lg: 1 }, minWidth: 0 }}>
          <LoginModuleMap />
        </Box>
        <LoginInstitutionalStats />
      </Box>
    </Box>
  );
}
