import { useCallback, useState } from 'react';
import type { ElementType } from 'react';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { Box, Container, Stack, Typography } from '@mui/material';
import { SITE_AUDIENCE } from '../../constants/site-content.constant';
import { SITE_IMAGES } from '../../constants/site-images.constant';
import { SiteSectionHeader } from '../SiteSectionHeader';
import { SITE_SPACING, siteBodyLargeSx, siteCardTitleSx, siteSectionSx } from '../../styles/site.styles';
import { sitePalette } from '../../styles/site.palette';

const AUDIENCE_IMAGE_ALT =
  'Equipe multidisciplinar em SST com indicadores, laudos, planos de ação e gestão integrada';

const AUDIENCE_IMAGE_POSITION = { xs: '50% 42%', md: '50% 40%' } as const;

const IMAGE_FADE_TOP =
  'linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, transparent 28%)';

const IMAGE_FADE_BOTTOM =
  'linear-gradient(180deg, transparent 45%, rgba(255, 255, 255, 0.55) 72%, #FFFFFF 96%)';

const AUDIENCE_ICONS: Record<(typeof SITE_AUDIENCE)[number]['title'], ElementType> = {
  Empresas: BusinessOutlinedIcon,
  Consultorias: GroupsOutlinedIcon,
  SESMT: WorkOutlineOutlinedIcon,
  'Medicina ocupacional': LocalHospitalOutlinedIcon,
  'Profissionais de SST': HealthAndSafetyOutlinedIcon,
};

function AudienceHeroImage() {
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => {
    setFailed(true);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: { xs: '4 / 3', sm: '3 / 2' },
        maxHeight: { md: 560 },
        borderRadius: { xs: 2.5, md: 4 },
        overflow: 'hidden',
        bgcolor: sitePalette.surfaceMuted,
      }}
    >
      {!failed ? (
        <Box
          component="img"
          src={SITE_IMAGES.audience}
          alt={AUDIENCE_IMAGE_ALT}
          loading="lazy"
          decoding="async"
          onError={handleError}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: AUDIENCE_IMAGE_POSITION,
            display: 'block',
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(165deg, ${sitePalette.surfaceMuted} 0%, #D8E2EC 100%)`,
          }}
        />
      )}

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: IMAGE_FADE_TOP,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: IMAGE_FADE_BOTTOM,
        }}
      />
    </Box>
  );
}

function AudienceCard({
  title,
  description,
}: {
  title: (typeof SITE_AUDIENCE)[number]['title'];
  description: string;
}) {
  const Icon = AUDIENCE_ICONS[title];

  return (
    <Box
      sx={{
        bgcolor: sitePalette.surface,
        borderRadius: 2.5,
        border: `1px solid ${sitePalette.border}`,
        boxShadow: '0 12px 40px rgba(26, 35, 50, 0.08)',
        p: { xs: 2.5, md: 2.75 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start" flex={1}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: sitePalette.surfaceMuted,
            border: `1px solid ${sitePalette.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 20, color: sitePalette.inkSoft }} aria-hidden />
        </Box>
        <Stack spacing={0.75} minWidth={0}>
          <Typography sx={{ ...siteCardTitleSx, fontSize: { xs: '1.125rem', md: '1.1875rem' } }}>
            {title}
          </Typography>
          <Typography
            sx={{
              ...siteBodyLargeSx,
              fontSize: { xs: '1rem', md: '1.0625rem' },
              lineHeight: 1.55,
            }}
          >
            {description}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

export function SiteAudienceSection() {
  return (
    <Box component="section" id="para-quem-e" sx={{ ...siteSectionSx, bgcolor: sitePalette.surface }}>
      <Container maxWidth="lg">
        <SiteSectionHeader
          title={
            <>
              Feito para quem vive
              <br />
              <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                SST na prática
              </Box>
            </>
          }
          subtitle="Consultorias, empresas, SESMT e medicina ocupacional — para quem precisa transformar dados, laudos e planos de ação em gestão rastreável."
          align="center"
          maxWidth={640}
          subtitleMaxWidth={860}
        />

        <Box sx={{ position: 'relative', mt: { xs: 1, md: 2 } }}>
          <AudienceHeroImage />

          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              mt: { xs: 3, md: -7 },
              px: { xs: 0, md: 2 },
              pb: { xs: 0, md: 1 },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
                gap: { xs: 2, md: 2.5 },
              }}
            >
              {SITE_AUDIENCE.map((item) => (
                <AudienceCard key={item.title} title={item.title} description={item.description} />
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
