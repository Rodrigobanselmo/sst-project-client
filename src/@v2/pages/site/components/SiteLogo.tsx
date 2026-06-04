import { useCallback, useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import NextImage from 'next/image';
import { brandNameConstant } from 'core/constants/brand.constant';
import { SITE_BRAND } from '../constants/site-brand.constant';
import { sitePalette } from '../styles/site.palette';

type SiteLogoSize = 'md' | 'lg';

const SIZE_MAP = {
  md: {
    height: 32,
    maxWidth: 148,
    fallbackImage: 36,
    fontSize: '1.0625rem',
  },
  lg: {
    height: { xs: 32, md: 38 },
    maxWidth: { xs: 160, md: 188 },
    fallbackImage: 40,
    fontSize: '1.125rem',
  },
} as const;

export function SiteLogo({ size = 'md' }: { size?: SiteLogoSize }) {
  const config = SIZE_MAP[size];
  const [useFallback, setUseFallback] = useState(false);

  const handleError = useCallback(() => {
    setUseFallback(true);
  }, []);

  if (useFallback) {
    return (
      <Stack direction="row" gap={1.5} alignItems="center">
        <NextImage
          alt="SimpleSST"
          src="/icons/brand/logo-simple.svg"
          width={config.fallbackImage}
          height={config.fallbackImage}
          priority={size === 'lg'}
        />
        <Typography
          fontWeight={800}
          color={sitePalette.ink}
          lineHeight={1.2}
          sx={{ fontSize: config.fontSize, letterSpacing: '-0.02em' }}
        >
          {brandNameConstant}
        </Typography>
      </Stack>
    );
  }

  return (
    <Box
      component="img"
      src={SITE_BRAND.logoHorizontal}
      alt="SimpleSST"
      onError={handleError}
      sx={{
        height: config.height,
        width: 'auto',
        maxWidth: config.maxWidth,
        objectFit: 'contain',
        objectPosition: 'left center',
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}
