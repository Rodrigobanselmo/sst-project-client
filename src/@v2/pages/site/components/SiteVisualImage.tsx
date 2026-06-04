import { useCallback, useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import type { ResponsiveStyleValue } from '@mui/system';
import type { CSSProperties } from 'react';
import { sitePalette } from '../styles/site.palette';

/** Variações de apresentação — evita “card com borda” em todas as seções */
export type SiteVisualLayout = 'hero' | 'open' | 'fade' | 'edge' | 'ambient';

type SiteVisualImageProps = {
  imageSrc?: string;
  imageAlt?: string;
  layout?: SiteVisualLayout;
  variant?: 'team' | 'workplace';
  aspectRatio?: string;
  fill?: boolean;
  minHeight?: CSSProperties['minHeight'];
  priority?: boolean;
  /** Reduz altura do bloco quando a foto ainda não está disponível */
  compactFallback?: boolean;
  /** Recorte — use no Hero para preservar enquadramento da foto */
  objectPosition?: ResponsiveStyleValue<CSSProperties['objectPosition']>;
  sx?: SxProps<Theme>;
};

const FALLBACK_COMPACT_SX: Record<SiteVisualLayout, SxProps<Theme>> = {
  hero: {},
  open: { maxHeight: { xs: 200, md: 280 } },
  fade: { maxHeight: { xs: 132, md: 220 }, aspectRatio: { xs: '2.2 / 1', md: '4 / 3' } },
  edge: { maxHeight: { xs: 150, md: 190 } },
  ambient: { minHeight: { xs: 160, md: 240 } },
};

function SoftFallback({ variant, compact }: { variant: 'team' | 'workplace'; compact?: boolean }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        background:
          variant === 'team'
            ? `radial-gradient(ellipse ${compact ? '55% 45%' : '80% 70%'} at 35% 75%, rgba(197, 212, 227, 0.75) 0%, transparent 55%),
               radial-gradient(ellipse 40% 30% at 75% 25%, rgba(237, 232, 226, 0.9) 0%, transparent 50%),
               linear-gradient(160deg, #EDE8E2 0%, #D8E2EC 100%)`
            : `linear-gradient(165deg, ${sitePalette.surfaceMuted} 0%, #D6E4F0 100%)`,
      }}
    />
  );
}

function getLayoutShell(layout: SiteVisualLayout): SxProps<Theme> {
  switch (layout) {
    case 'hero':
      return {
        borderRadius: { xs: 2.5, md: 4 },
        overflow: 'hidden',
        boxShadow: '0 28px 72px rgba(26, 35, 50, 0.12)',
        border: 'none',
      };
    case 'open':
      return {
        borderRadius: { xs: 2, md: 2.5 },
        overflow: 'hidden',
        border: 'none',
        boxShadow: 'none',
      };
    case 'fade':
      return {
        borderRadius: 2,
        overflow: 'hidden',
        border: 'none',
        boxShadow: '0 16px 48px rgba(26, 35, 50, 0.06)',
      };
    case 'edge':
      return {
        borderRadius: { xs: 2, md: 3 },
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        overflow: 'hidden',
        border: 'none',
        boxShadow: '0 20px 56px rgba(26, 35, 50, 0.08)',
      };
    case 'ambient':
      return {
        borderRadius: 0,
        overflow: 'hidden',
        border: 'none',
        boxShadow: 'none',
      };
    default:
      return {};
  }
}

function getOverlay(layout: SiteVisualLayout, hasImage: boolean): string {
  if (!hasImage) {
    return 'linear-gradient(180deg, transparent 50%, rgba(26, 35, 50, 0.12) 100%)';
  }
  switch (layout) {
    case 'hero':
      return `linear-gradient(180deg, transparent 55%, rgba(26, 35, 50, 0.2) 100%)`;
    case 'open':
      return `linear-gradient(180deg, transparent 0%, rgba(250, 248, 245, 0.15) 70%, rgba(250, 248, 245, 0.85) 100%)`;
    case 'fade':
      return `linear-gradient(180deg, rgba(26, 35, 50, 0.05) 0%, rgba(26, 35, 50, 0.25) 100%),
        linear-gradient(90deg, rgba(250, 248, 245, 0.2) 0%, transparent 30%)`;
    case 'edge':
      return `linear-gradient(180deg, transparent 60%, rgba(26, 35, 50, 0.18) 100%)`;
    case 'ambient':
      return `linear-gradient(105deg, transparent 0%, rgba(250, 248, 245, 0.4) 45%, rgba(250, 248, 245, 0.92) 72%)`;
    default:
      return 'transparent';
  }
}

export function SiteVisualImage({
  imageSrc,
  imageAlt = 'Equipe em operação',
  layout = 'open',
  variant = 'team',
  aspectRatio = '4 / 3',
  fill = false,
  minHeight,
  priority = false,
  compactFallback = layout !== 'hero',
  objectPosition,
  sx,
}: SiteVisualImageProps) {
  const resolvedObjectPosition =
    objectPosition ??
    (layout === 'hero' ? ({ xs: '70% 44%', md: '62% 42%' } as const) : 'center');
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageSrc) && !imageFailed;
  const useCompactFallback = compactFallback && !showImage;

  const handleImageError = useCallback(() => {
    setImageFailed(true);
  }, []);

  const resolvedMinHeight =
    fill && useCompactFallback
      ? (minHeight ?? { xs: 160, md: 240 })
      : minHeight ?? (fill ? { xs: 280, md: 360 } : undefined);

  const shellSx: SxProps<Theme> = [
    {
      position: 'relative',
      width: '100%',
      bgcolor: sitePalette.surfaceMuted,
      ...(fill
        ? { height: '100%', minHeight: resolvedMinHeight }
        : aspectRatio
          ? { aspectRatio }
          : {}),
    },
    getLayoutShell(layout),
    useCompactFallback ? FALLBACK_COMPACT_SX[layout] : {},
    ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
  ];

  return (
    <Box sx={shellSx}>
      <SoftFallback variant={variant} compact={useCompactFallback} />

      {showImage && imageSrc ? (
        <Box
          component="img"
          src={imageSrc}
          alt={imageAlt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onError={handleImageError}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: resolvedObjectPosition,
            display: 'block',
          }}
        />
      ) : null}

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: getOverlay(layout, showImage),
          pointerEvents: 'none',
        }}
      />

      {!showImage ? (
        <Box
          component="span"
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 16,
            zIndex: 1,
            fontSize: '0.75rem',
            letterSpacing: '0.04em',
            color: 'rgba(26, 35, 50, 0.35)',
            textTransform: 'uppercase',
          }}
        >
          Foto institucional
        </Box>
      ) : null}
    </Box>
  );
}

/** @deprecated Use SiteVisualImage — mantido para imports existentes */
export const SitePhotoReadyPanel = SiteVisualImage;
