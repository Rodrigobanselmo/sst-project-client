/* eslint-disable react/no-children-prop */
import React, { FC } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';

import { SButtonProps } from '../../types';

export const ButtonLoad: FC<{ children?: any } & SButtonProps> = ({
  children,
  loading,
  ...props
}) => {
  if (typeof loading === 'boolean')
    return <LoadingButton loading={loading} children={children} {...props} />;
  return <Button children={children} {...props} />;
};
