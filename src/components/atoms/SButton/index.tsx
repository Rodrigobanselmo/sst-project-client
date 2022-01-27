/* eslint-disable react/no-children-prop */
import React, { FC } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';

import { SButtonProps } from './types';

const ButtonTag: FC<SButtonProps> = ({ children, loading, ...props }) => {
  if (typeof loading === 'boolean')
    return <LoadingButton loading={loading} children={children} {...props} />;
  return <Button children={children} {...props} />;
};

export const SButton: FC<SButtonProps> = ({
  children,
  loading,
  variant = 'contained',
  sx,
  ...props
}) => {
  return (
    <ButtonTag
      sx={{ color: 'white', ...sx }}
      variant={variant}
      loading={loading}
      {...props}
    >
      {children}
    </ButtonTag>
  );
};
