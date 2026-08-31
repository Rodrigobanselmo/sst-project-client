import { Box, BoxProps, useTheme } from '@mui/material';

import { LOGIN_BRAND } from '../../constants/login-institutional.content';

type LoginAuthBrandProps = Pick<BoxProps, 'sx'>;

export function LoginAuthBrand({ sx }: LoginAuthBrandProps) {
  const isDark = useTheme().palette.mode === 'dark';
  const src = isDark ? LOGIN_BRAND.logoOnDark : LOGIN_BRAND.logoOnLight;

  return (
    <Box
      component="img"
      src={src}
      alt="SimpleSST"
      sx={{
        display: 'block',
        height: { xs: '2.45rem', md: '3.15rem' },
        width: 'auto',
        maxWidth: { xs: '14.5rem', md: '18.5rem' },
        objectFit: 'contain',
        objectPosition: 'left center',
        ...sx,
      }}
    />
  );
}
