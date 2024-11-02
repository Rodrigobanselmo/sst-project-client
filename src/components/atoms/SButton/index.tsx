/* eslint-disable react/no-children-prop */
import React, { FC } from 'react';

import { STButton } from './styles';
import { SButtonProps } from './types';

/**
 * @deprecated
 * This method is deprecated and has been replaced by newMethod()
 */
export const SButton: FC<{ children?: any } & SButtonProps> = ({
  children,
  loading,
  variant = 'contained',
  shadow,
  xsmall,
  ...props
}) => {
  return (
    <STButton
      variant={variant}
      _small={xsmall ? 1 : 0}
      _variant={variant}
      _shadow={shadow ? 1 : 0}
      loading={loading}
      {...props}
    >
      {children}
    </STButton>
  );
};
