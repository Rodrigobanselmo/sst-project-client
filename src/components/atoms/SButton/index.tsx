/* eslint-disable react/no-children-prop */
import React, { FC } from 'react';

import { STButton } from './styles';
import { SButtonProps } from './types';

export const SButton: FC<SButtonProps> = ({
  children,
  loading,
  variant = 'contained',
  sx,
  ...props
}) => {
  return (
    <STButton
      variant={variant}
      loading={loading}
      sx={{ minWidth: '100px', textTransform: 'none', ...sx }}
      {...props}
    >
      {children}
    </STButton>
  );
};
