import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { SITE_JOURNEY } from '../../constants/site-content.constant';
import { SITE_IMAGES } from '../../constants/site-images.constant';
import { SiteSectionHeader } from '../SiteSectionHeader';
import { SiteVisualImage } from '../SiteVisualImage';
import { siteJourneyTagSx, siteSectionSx } from '../../styles/site.styles';
import { sitePalette } from '../../styles/site.palette';

const JOURNEY_IMAGE_POSITION = 'center' as const;

/** Proporção nativa do asset (~1672×941, ~16:9) */
const JOURNEY_IMAGE_SX = {
  width: '100%',
  aspectRatio: { xs: '16 / 10', md: '16 / 9' },
  maxHeight: { md: 'none' },
};

const STEP_SUMMARY_SX = {
  fontSize: { xs: '1.0625rem', md: '1.125rem' },
  lineHeight: 1.55,
  color: sitePalette.inkMuted,
};

type JourneyStepProps = {
  step: (typeof SITE_JOURNEY)[number];
  index: number;
};

function JourneyStep({ step, index }: JourneyStepProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flex: { md: 1 },
        minHeight: { md: 84 },
        alignItems: 'flex-start',
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          bgcolor: sitePalette.surface,
          color: sitePalette.inkSoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '1.0625rem',
          border: `1px solid ${sitePalette.border}`,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </Box>

      <Stack flex={1} spacing={1} minWidth={0} pt={0.25}>
        <Typography
          fontWeight={800}
          color={sitePalette.ink}
          lineHeight={1.25}
          fontSize={{ xs: '1.1875rem', md: '1.3125rem' }}
        >
          {step.step}
        </Typography>

        <Typography sx={STEP_SUMMARY_SX}>{step.summary}</Typography>

        <Stack direction="row" flexWrap="wrap" alignItems="baseline" component="span">
          {step.modules.map((mod) => (
            <Typography key={mod} component="span" sx={siteJourneyTagSx}>
              {mod}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export function SiteModulesSection() {
  return (
    <Box
      component="section"
      sx={{
        ...siteSectionSx,
        pt: { xs: 9, md: 11 },
        pb: { xs: 11, md: 16 },
        background: sitePalette.sectionEmphasisGradient,
      }}
    >
      <Container maxWidth="lg">
        <SiteSectionHeader
          dense
          title={
            <>
              Do mapeamento à{' '}
              <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                gestão viva do PGR
              </Box>
            </>
          }
          subtitle="Inventário, plano de ação, evidências e revisões no mesmo fluxo — para demonstrar que o PGR está implementado, rastreável e em evolução."
          align="center"
          maxWidth={720}
          subtitleMaxWidth={840}
        />

        <Grid container spacing={{ xs: 4, md: 2.5 }} alignItems="flex-start">
          <Grid item xs={12} order={{ xs: 1, md: 2 }} sx={{ display: { md: 'none' } }}>
            <SiteVisualImage
              imageSrc={SITE_IMAGES.journey}
              imageAlt="Fluxo do PGR: inventário, avaliação, plano de ação, evidências e revisões no painel e no app"
              layout="open"
              variant="workplace"
              objectPosition={JOURNEY_IMAGE_POSITION}
              sx={JOURNEY_IMAGE_SX}
            />
          </Grid>

          <Grid
            item
            xs={12}
            md={5}
            order={{ xs: 2, md: 1 }}
            sx={{ pr: { md: 0.5 }, maxWidth: { md: 520 } }}
          >
            <Stack
              sx={{
                minHeight: { md: 400 },
                height: '100%',
                justifyContent: { md: 'space-between' },
                spacing: { xs: 3.5, md: 0 },
              }}
            >
              {SITE_JOURNEY.map((phase, index) => (
                <JourneyStep key={phase.step} step={phase} index={index} />
              ))}
            </Stack>
          </Grid>

          <Grid
            item
            xs={12}
            md={7}
            order={{ xs: 1, md: 2 }}
            sx={{
              display: { xs: 'none', md: 'block' },
              pl: { md: 0 },
            }}
          >
            <Box
              sx={{
                position: 'sticky',
                top: 96,
                width: { md: '102%' },
                ml: { md: '-2%' },
                mr: 0,
              }}
            >
              <SiteVisualImage
                imageSrc={SITE_IMAGES.journey}
                imageAlt="Fluxo do PGR: inventário, avaliação, plano de ação, evidências e revisões no painel e no app"
                layout="open"
                variant="workplace"
                objectPosition={JOURNEY_IMAGE_POSITION}
                sx={JOURNEY_IMAGE_SX}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
