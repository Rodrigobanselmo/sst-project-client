/* eslint-disable react/no-children-prop */
import React, { FC } from 'react';

import { STButton } from './styles';
import { SButtonProps } from './types';

export const SButton: FC<SButtonProps> = ({
  children,
  loading,
  variant = 'contained',
  ...props
}) => {
  return (
    <STButton variant={variant} loading={loading} {...props}>
      {children}
    </STButton>
  );
};
