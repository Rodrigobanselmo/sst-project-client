import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { SITE_SOLUTION_STORIES } from '../../constants/site-content.constant';
import { SITE_IMAGES } from '../../constants/site-images.constant';
import { SiteSectionHeader } from '../SiteSectionHeader';
import { SiteVisualImage } from '../SiteVisualImage';
import {
  SITE_SPACING,
  siteBodyLargeSx,
  siteCardTitleSx,
  siteElevatedCardSx,
  siteLabelSx,
  siteSectionSx,
} from '../../styles/site.styles';
import { sitePalette } from '../../styles/site.palette';

function StoryStep({ label, text }: { label: string; text: string }) {
  return (
    <Stack spacing={0.5}>
      <Typography sx={siteLabelSx}>{label}</Typography>
      <Typography sx={{ ...siteBodyLargeSx, color: sitePalette.inkSoft, fontWeight: 500 }}>
        {text}
      </Typography>
    </Stack>
  );
}

export function SiteProblemsSection() {
  return (
    <Box
      component="section"
      id="solucoes"
      sx={{ ...siteSectionSx, bgcolor: sitePalette.surface, mt: { xs: -1, md: -2 } }}
    >
      <Container maxWidth="lg">
        <SiteSectionHeader
          title="Do problema ao alívio"
          lead="Quatro histórias reais sobre o que trava a SST — e como o SimpleSST organiza o caminho."
          subtitle="Veja o que acontece hoje, o que isso custa e o que muda quando riscos, documentos e plano de ação ficam no mesmo fluxo."
        />

        <Grid container spacing={SITE_SPACING.gridGap} alignItems="flex-start">
          <Grid item xs={12} md={5}>
            <Box sx={{ position: { md: 'sticky' }, top: 88 }}>
              <SiteVisualImage
                imageSrc={SITE_IMAGES.problemSolution}
                imageAlt="Fluxo de documentos físicos para gestão digital no SimpleSST"
                layout="open"
                variant="workplace"
                objectPosition={{ xs: '50% 46%', md: '44% 50%' }}
                sx={{
                  aspectRatio: { xs: '2.2 / 1', md: '3 / 4' },
                  maxHeight: { xs: 180, md: 360 },
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={7}>
            <Stack spacing={SITE_SPACING.stackGap}>
              {SITE_SOLUTION_STORIES.map((story) => (
                <Stack
                  key={story.problem}
                  spacing={2}
                  sx={{
                    ...siteElevatedCardSx,
                    p: { xs: 3, md: 4 },
                  }}
                >
                  <Typography sx={siteCardTitleSx}>{story.problem}</Typography>
                  <StoryStep label="O que acontece" text={story.consequence} />
                  <StoryStep label="Com o SimpleSST" text={story.solution} />
                  <Typography
                    sx={{
                      pt: 2,
                      mt: 0.5,
                      borderTop: `1px solid ${sitePalette.border}`,
                      fontWeight: 600,
                      fontSize: '1.0625rem',
                      color: sitePalette.ink,
                    }}
                  >
                    {story.benefit}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
