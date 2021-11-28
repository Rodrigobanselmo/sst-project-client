import React, { FC } from 'react';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { SButtonProps } from './types';

export const SButton: FC<SButtonProps> = ({
  children,
  circularProps,
  loading,
  disabled,
  variant = 'contained',
  sx,
  ...props
}) => {
  return (
    <Button
      sx={{ color: 'white', ...sx }}
      variant={variant}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <CircularProgress {...circularProps} /> : children}
    </Button>
  );
};
