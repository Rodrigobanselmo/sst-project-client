import { Box, Typography } from '@mui/material';
import { SITE_IMAGES } from '../constants/site-images.constant';
import { SiteVisualImage } from './SiteVisualImage';
import { sitePalette } from '../styles/site.palette';

const HERO_CHIP_SX = {
  position: 'absolute' as const,
  px: 1.25,
  py: 0.625,
  borderRadius: 1.5,
  bgcolor: 'rgba(255, 255, 255, 0.78)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.65)',
  boxShadow: '0 2px 10px rgba(26, 35, 50, 0.04)',
  pointerEvents: 'none' as const,
};

type HeroChip = {
  text: string;
  sx: Record<string, unknown>;
  showFrom?: 'sm';
};

const HERO_CHIPS: HeroChip[] = [
  {
    text: 'Menos retrabalho',
    sx: {
      top: { xs: 8, sm: 16, md: 20 },
      right: { xs: 12, md: 16 },
    },
  },
  {
    text: 'PGR conectado',
    showFrom: 'sm',
    sx: {
      bottom: { xs: '27%', md: '29%' },
      left: { xs: 10, md: 14 },
    },
  },
];

export function SiteHeroHumanVisual() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: { xs: '100%', md: 540 },
        mx: { xs: 'auto', md: 0 },
        ml: { md: 'auto' },
      }}
    >
      <SiteVisualImage
        imageSrc={SITE_IMAGES.hero}
        imageAlt="Profissional de SST em operação com equipe ao fundo"
        layout="hero"
        variant="team"
        aspectRatio="5 / 4"
        priority
      />

      {HERO_CHIPS.map((chip) => (
        <Box
          key={chip.text}
          sx={{
            ...HERO_CHIP_SX,
            ...chip.sx,
            display: chip.showFrom ? { xs: 'none', [chip.showFrom]: 'block' } : 'block',
          }}
        >
          <Typography
            fontWeight={500}
            color={sitePalette.inkMuted}
            fontSize="0.8125rem"
            lineHeight={1.3}
            noWrap
          >
            {chip.text}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
