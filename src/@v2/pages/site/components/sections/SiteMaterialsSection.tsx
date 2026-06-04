import { Box, Container, Stack, Typography } from '@mui/material';
import { SITE_MATERIALS } from '../../constants/site-content.constant';
import { siteSectionCompactSx } from '../../styles/site.styles';
import { sitePalette } from '../../styles/site.palette';

export function SiteMaterialsSection() {
  return (
    <Box
      component="section"
      sx={{ ...siteSectionCompactSx, background: sitePalette.sectionEmphasisGradient }}
    >
      <Container maxWidth="md">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="overline" color={sitePalette.inkMuted} fontWeight={600}>
              Em breve
            </Typography>
            <Typography variant="h6" fontWeight={700} color={sitePalette.ink}>
              Materiais gratuitos
            </Typography>
            <Typography color={sitePalette.inkMuted} mt={0.5} fontSize="1.0625rem">
              Artigos, e-books e referências de metodologia para sua equipe.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            {SITE_MATERIALS.map((m) => (
              <Typography
                key={m.title}
                variant="body2"
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: sitePalette.surface,
                  color: sitePalette.inkMuted,
                  border: `1px solid ${sitePalette.border}`,
                }}
              >
                {m.title}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
