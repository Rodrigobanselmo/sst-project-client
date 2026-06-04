import { Box, Container, Typography } from '@mui/material';
import { SITE_RELIEF_POINTS } from '../constants/site-content.constant';
import { siteSectionCompactSx } from '../styles/site.styles';
import { sitePalette } from '../styles/site.palette';

export function SiteReliefStrip() {
  return (
    <Box
      sx={{
        ...siteSectionCompactSx,
        bgcolor: sitePalette.surface,
        borderTop: `1px solid ${sitePalette.border}`,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          textAlign="center"
          color={sitePalette.inkSoft}
          fontSize={{ xs: '1rem', md: '1.0625rem' }}
          lineHeight={1.6}
        >
          {SITE_RELIEF_POINTS.join(' · ')}
        </Typography>
      </Container>
    </Box>
  );
}
