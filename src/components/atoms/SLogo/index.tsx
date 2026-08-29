import React, { FC } from 'react';

import { Stack, Typography, useTheme } from '@mui/material';

import LogoSimpleIcon from '../../../assets/logo/logo-simple/logo-simple';
import { SLogoProps } from './types';

type SimpleSstWordmarkProps = {
  fontSize?: number | string | Array<number | string>;
  fontWeight?: number | string;
};

/**
 * Assinatura Simple / SST — mesma composição da LogoNavbar.
 */
export function SimpleSstWordmark({
  fontSize = 24,
  fontWeight = 500,
}: SimpleSstWordmarkProps) {
  return (
    <Typography
      component="span"
      fontSize={fontSize}
      fontWeight={fontWeight}
      color="text.main"
      sx={{ display: 'inline' }}
    >
      Simple
      <Typography
        color="primary.main"
        fontSize="inherit"
        fontWeight="bold"
        ml={1}
        component="span"
      >
        SST
      </Typography>
    </Typography>
  );
}

export const SLogo: FC<{ children?: any } & SLogoProps> = ({
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const markColor = isDark
    ? theme.palette.primary.main
    : theme.palette.text.dark;

  return (
    <Stack
      direction="row"
      gap={2}
      sx={{ alignItems: 'center', ...sx }}
      {...props}
    >
      <LogoSimpleIcon color={markColor} size="2.2rem" aria-hidden />
      <SimpleSstWordmark />
    </Stack>
  );
};
