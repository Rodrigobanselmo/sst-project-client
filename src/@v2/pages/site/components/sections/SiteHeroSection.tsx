import { Box, Button, Container, Grid, Stack, Typography } from '@mui/material';
import NextLink from 'next/link';
import { SiteDecorativeGlow } from '../SiteDecorativeGlow';
import { SiteHeroHumanVisual } from '../SiteHeroHumanVisual';
import { SiteScrollHint } from '../SiteScrollHint';
import { SITE_SPACING } from '../../styles/site.spacing';
import { siteDisplayTitleSx, siteLeadSx } from '../../styles/site.styles';
import { sitePalette } from '../../styles/site.palette';

const LOGIN_PATH = '/login';

export function SiteHeroSection() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        pt: SITE_SPACING.sectionYHero,
        pb: SITE_SPACING.sectionYHeroBottom,
        px: SITE_SPACING.contentMax,
        background: sitePalette.heroGradient,
        overflow: 'hidden',
      }}
    >
      <SiteDecorativeGlow />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: { xs: 72, md: 88 },
          background: 'linear-gradient(180deg, transparent 0%, #FAF8F5 90%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={SITE_SPACING.gridGap} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack spacing={2} maxWidth={580}>
              <Typography component="h1" sx={siteDisplayTitleSx}>
                A gestão de SST que traz alívio
              </Typography>
              <Typography component="p" sx={siteLeadSx}>
                Clara, conectada e confiável.
              </Typography>
              <Typography
                component="p"
                sx={{
                  fontSize: { xs: '1.125rem', md: '1.3125rem' },
                  lineHeight: 1.65,
                  color: sitePalette.inkSoft,
                }}
              >
                Menos retrabalho, mais segurança na entrega. Riscos, documentos e plano de ação no
                mesmo fluxo — para sua equipe e seu cliente trabalharem com a mesma referência técnica.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} pt={0.5}>
                <Button
                  component="a"
                  href="#contato"
                  variant="contained"
                  size="large"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1.0625rem',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    bgcolor: sitePalette.orange,
                    boxShadow: `0 12px 32px ${sitePalette.orangeGlow}`,
                    '&:hover': {
                      bgcolor: '#e0651f',
                      boxShadow: `0 16px 40px ${sitePalette.orangeGlow}`,
                    },
                  }}
                >
                  Solicitar demonstração
                </Button>
                <Button
                  component={NextLink}
                  href={LOGIN_PATH}
                  variant="outlined"
                  size="large"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.0625rem',
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    borderColor: sitePalette.border,
                    color: sitePalette.ink,
                    bgcolor: sitePalette.surface,
                    '&:hover': { borderColor: sitePalette.inkMuted, bgcolor: sitePalette.surface },
                  }}
                >
                  Acessar sistema
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <SiteHeroHumanVisual />
          </Grid>
        </Grid>
        <SiteScrollHint />
      </Container>
    </Box>
  );
}
