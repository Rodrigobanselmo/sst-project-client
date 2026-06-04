import { useCallback, useState } from 'react';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import { SITE_PILLARS } from '../../constants/site-content.constant';
import { SiteSectionHeader } from '../SiteSectionHeader';
import {
  SITE_SPACING,
  siteBodyLargeSx,
  siteElevatedCardSx,
  siteSectionSx,
} from '../../styles/site.styles';
import { sitePalette } from '../../styles/site.palette';

/** Reserva igual para título + texto — imagens começam no mesmo eixo */
const PILLAR_COPY_MIN_HEIGHT = { xs: 168, md: 188 };

/** Proporção nativa dos assets (~1024×1536) — altura derivada da largura do card */
const PILLAR_IMAGE_ASPECT = '2 / 3';

/** Fundo discreto se houver micro-margem do contain */
const PILLAR_IMAGE_WELL_BG = '#152238';

type PillarCardProps = (typeof SITE_PILLARS)[number];

function PillarCardImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: PILLAR_IMAGE_ASPECT,
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: PILLAR_IMAGE_WELL_BG,
        position: 'relative',
      }}
    >
      {!failed ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={handleError}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(165deg, ${PILLAR_IMAGE_WELL_BG} 0%, #1e3a5f 100%)`,
          }}
        />
      )}
    </Box>
  );
}

function PillarCard({ title, description, image, imageAlt }: PillarCardProps) {
  return (
    <Stack
      spacing={2.5}
      sx={{
        ...siteElevatedCardSx,
        height: '100%',
        p: { xs: 3, md: 3.5 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          minHeight: PILLAR_COPY_MIN_HEIGHT,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack spacing={1.25}>
          <Typography fontWeight={800} color={sitePalette.ink} lineHeight={1.2} fontSize="1.375rem">
            {title}
          </Typography>
          <Typography sx={{ ...siteBodyLargeSx, mb: 0 }}>{description}</Typography>
        </Stack>
      </Box>

      <PillarCardImage src={image} alt={imageAlt} />
    </Stack>
  );
}

export function SiteDifferentialsSection() {
  return (
    <Box
      component="section"
      sx={{
        ...siteSectionSx,
        pt: { xs: 10, md: 13 },
        pb: { xs: 9, md: 11 },
        bgcolor: sitePalette.surface,
      }}
    >
      <Container maxWidth="lg">
        <SiteSectionHeader
          title="Três pilares para entregar SST com mais segurança"
          subtitle="Rastreabilidade, padrão e IA a serviço do profissional — não no lugar dele."
          align="center"
          maxWidth={520}
        />
        <Grid container spacing={SITE_SPACING.gridGap} alignItems="stretch">
          {SITE_PILLARS.map((pillar) => (
            <Grid item xs={12} md={4} key={pillar.title}>
              <PillarCard {...pillar} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
