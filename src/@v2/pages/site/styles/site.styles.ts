import { SxProps, Theme } from '@mui/material';
import { SITE_SPACING } from './site.spacing';
import { sitePalette } from './site.palette';

export { SITE_SPACING };

export const sitePageSx: SxProps<Theme> = {
  minHeight: '100vh',
  bgcolor: sitePalette.surface,
  color: sitePalette.ink,
};

/** Fundo destacado sutil — alternância ímpar (Hero, Jornada, Psicossocial…) */
export const siteSectionEmphasisBgSx: SxProps<Theme> = {
  background: sitePalette.sectionEmphasisGradient,
};

/** Fundo claro — alternância par (Problema, Pilares, Público…) */
export const siteSectionLightBgSx: SxProps<Theme> = {
  bgcolor: sitePalette.surface,
};

export const siteSectionSx: SxProps<Theme> = {
  py: SITE_SPACING.sectionY,
  px: SITE_SPACING.contentMax,
};

export const siteSectionCompactSx: SxProps<Theme> = {
  py: SITE_SPACING.sectionYCompact,
  px: SITE_SPACING.contentMax,
};

export const siteSectionHeaderMb: SxProps<Theme> = {
  mb: SITE_SPACING.headerMb,
};

export const siteDisplayTitleSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: '2.125rem', md: '2.875rem', lg: '3.125rem' },
  lineHeight: 1.12,
  letterSpacing: '-0.03em',
  color: sitePalette.ink,
};

export const siteSectionTitleSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: { xs: '1.875rem', md: '2.375rem' },
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
  color: sitePalette.ink,
};

export const siteSectionSubtitleSx: SxProps<Theme> = {
  color: sitePalette.inkSoft,
  fontSize: { xs: '1.125rem', md: '1.3125rem' },
  lineHeight: 1.65,
  maxWidth: 600,
};

/** Linha logo abaixo do título — peso e cor mais suaves que o H1/H2 */
export const siteLeadSx: SxProps<Theme> = {
  fontWeight: 500,
  fontSize: { xs: '1.1875rem', md: '1.375rem' },
  lineHeight: 1.45,
  color: sitePalette.inkMuted,
  letterSpacing: '-0.01em',
};

export const siteBodyLargeSx: SxProps<Theme> = {
  fontSize: { xs: '1.0625rem', md: '1.125rem' },
  lineHeight: 1.65,
  color: sitePalette.inkMuted,
};

export const siteCardTitleSx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: { xs: '1.25rem', md: '1.375rem' },
  lineHeight: 1.3,
  color: sitePalette.ink,
};

/** Destaque discreto — laranja reservado a CTAs */
export const siteEyebrowSx: SxProps<Theme> = {
  color: sitePalette.inkMuted,
  fontWeight: 600,
  fontSize: { xs: '0.8125rem', md: '0.875rem' },
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
};

export const siteLabelSx: SxProps<Theme> = {
  color: sitePalette.inkMuted,
  fontWeight: 600,
  fontSize: '0.8125rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

export const siteElevatedCardSx: SxProps<Theme> = {
  borderRadius: 3,
  bgcolor: sitePalette.surface,
  border: `1px solid ${sitePalette.border}`,
  boxShadow: '0 2px 16px rgba(26, 35, 50, 0.03)',
  transition: 'box-shadow 0.25s ease',
  '&:hover': {
    boxShadow: '0 12px 32px rgba(26, 35, 50, 0.06)',
  },
};

export const siteTagSx: SxProps<Theme> = {
  px: 2,
  py: 1,
  borderRadius: 2,
  bgcolor: sitePalette.surfaceMuted,
  color: sitePalette.inkSoft,
  fontWeight: 500,
  fontSize: '1rem',
  border: `1px solid ${sitePalette.border}`,
};

/** Tags informativas da jornada — sem aparência de botão */
export const siteJourneyTagSx: SxProps<Theme> = {
  px: 0,
  py: 0,
  color: sitePalette.inkMuted,
  fontWeight: 400,
  fontSize: '0.875rem',
  lineHeight: 1.45,
  '&:not(:last-of-type)::after': {
    content: '"·"',
    mx: 1,
    color: sitePalette.border,
    fontWeight: 600,
  },
};
