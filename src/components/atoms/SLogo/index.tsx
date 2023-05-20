import React, { FC } from 'react';

import { Stack, Typography } from '@mui/material';
import NextImage from 'next/image';

import { brandNameConstant } from '../../../core/constants/brand.constant';
import { SLogoProps } from './types';

export const SLogo: FC<{ children?: any } & SLogoProps> = ({
  sx,
  ...props
}) => {
  return (
    <Stack
      direction="row"
      gap={2}
      sx={{ alignItems: 'center', ...sx }}
      {...props}
    >
      <NextImage
        alt="logo"
        src="/icons/brand/logo-simple.svg"
        width={35}
        height={35}
      />
      <Typography mt={2} fontWeight="bold" color={'text.light'} variant="h6">
        {brandNameConstant}
      </Typography>
    </Stack>
  );
};
