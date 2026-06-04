import { Box, Typography } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { sitePalette } from '../styles/site.palette';

export function SiteScrollHint() {
  return (
    <Box
      component="a"
      href="#solucoes"
      aria-label="Rolar para ver mais"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        pt: 3,
        pb: 0.5,
        textDecoration: 'none',
        color: sitePalette.inkMuted,
        animation: 'siteScrollBounce 2s ease-in-out infinite',
        '@keyframes siteScrollBounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      }}
    >
      <Typography variant="body2" fontWeight={600} fontSize="0.9375rem">
        Veja como ajudamos
      </Typography>
      <KeyboardArrowDownRoundedIcon sx={{ fontSize: 28 }} />
    </Box>
  );
}
