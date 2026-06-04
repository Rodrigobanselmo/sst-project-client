import { useCallback, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { SITE_IMAGES } from '../../constants/site-images.constant';
import { SiteSectionHeader } from '../SiteSectionHeader';
import { SITE_SPACING, siteBodyLargeSx } from '../../styles/site.styles';
import { sitePalette } from '../../styles/site.palette';

const PSYCHOSOCIAL_IMAGE_ALT =
  'Painel de FRPS com indicadores agregados, sigilo preservado, plano de ação e integração ao PGR';

/** Preserva painel FRPS — menos corte vertical em faixas mais altas */
const PSYCHOSOCIAL_IMAGE_POSITION = {
  xs: '50% 40%',
  md: '42% 50%',
  lg: '42% 48%',
  xl: '40% 46%',
} as const;

/** Altura mínima da faixa — independe do texto; sobe em lg/xl para telas largas */
const PSYCHOSOCIAL_STRIP_MIN_HEIGHT = {
  xs: 280,
  md: 600,
  lg: 640,
  xl: 720,
} as const;

/** Fade da imagem para o fundo da faixa (metade textual) */
const IMAGE_FADE_TO_SECTION_MD =
  'linear-gradient(90deg, transparent 0%, transparent 52%, rgba(240, 237, 232, 0.55) 72%, #F0EDE8 94%)';

const IMAGE_FADE_TO_SECTION_XS =
  'linear-gradient(180deg, transparent 0%, transparent 55%, rgba(240, 237, 232, 0.75) 82%, #F0EDE8 100%)';

const HIGHLIGHTS = [
  {
    title: 'Metodologia aplicada',
    text: 'Questionários, indicadores e critérios organizados para apoiar a caracterização dos fatores de riscos psicossociais no PGR.',
  },
  {
    title: 'Sigilo preservado',
    text: 'Análise agregada por grupos, setores ou unidades, evitando exposição individual e apoiando decisões técnicas com segurança.',
  },
  {
    title: 'Integrado ao GRO',
    text: 'FRPS, inventário de riscos e plano de ação no mesmo fluxo de gestão — sem tratar o psicossocial como documento à parte.',
  },
] as const;

function PsychosocialImagePanel() {
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: { xs: '100%', md: '50%' },
        minHeight: PSYCHOSOCIAL_STRIP_MIN_HEIGHT,
        flexShrink: 0,
        overflow: 'hidden',
        bgcolor: sitePalette.surfaceMuted,
      }}
    >
      {!failed ? (
        <Box
          component="img"
          src={SITE_IMAGES.psychosocial}
          alt={PSYCHOSOCIAL_IMAGE_ALT}
          loading="lazy"
          decoding="async"
          onError={handleError}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: PSYCHOSOCIAL_IMAGE_POSITION,
            display: 'block',
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(165deg, ${sitePalette.surfaceMuted} 0%, #D6E4F0 100%)`,
          }}
        />
      )}

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: {
            xs: IMAGE_FADE_TO_SECTION_XS,
            md: IMAGE_FADE_TO_SECTION_MD,
          },
        }}
      />
    </Box>
  );
}

function PsychosocialContentPanel() {
  return (
    <Box
      sx={{
        width: { xs: '100%', md: '50%' },
        flex: { md: '0 0 50%' },
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'transparent',
        py: { xs: 5, md: 9, lg: 10, xl: 11 },
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        pr: { md: 5, lg: 6 },
      }}
    >
      <Stack spacing={SITE_SPACING.stackGap} sx={{ width: '100%', maxWidth: 560 }}>
        <SiteSectionHeader
          title="FRPS no PGR, com método e segurança"
          subtitle="Da coleta das respostas ao plano de ação: indicadores psicossociais analisados de forma agregada, com sigilo preservado e integração ao GRO/PGR."
          align="left"
          maxWidth={560}
        />
        <Stack spacing={0}>
          {HIGHLIGHTS.map((item) => (
            <Box
              key={item.title}
              sx={{
                py: 2.5,
                borderBottom: `1px solid ${sitePalette.border}`,
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Typography
                fontWeight={700}
                color={sitePalette.ink}
                fontSize="1.25rem"
                gutterBottom
              >
                {item.title}
              </Typography>
              <Typography sx={siteBodyLargeSx}>{item.text}</Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

export function SitePsychosocialSection() {
  return (
    <Box
      component="section"
      id="psicossocial"
      sx={{
        width: '100%',
        overflow: 'hidden',
        background: sitePalette.sectionEmphasisGradient,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'stretch',
          minHeight: {
            md: PSYCHOSOCIAL_STRIP_MIN_HEIGHT.md,
            lg: PSYCHOSOCIAL_STRIP_MIN_HEIGHT.lg,
            xl: PSYCHOSOCIAL_STRIP_MIN_HEIGHT.xl,
          },
        }}
      >
        <PsychosocialImagePanel />
        <PsychosocialContentPanel />
      </Box>
    </Box>
  );
}
