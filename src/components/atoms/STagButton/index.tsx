import React, { FC } from 'react';

import { Icon } from '@mui/material';

import SText from '../SText';
import { STSBoxButton } from './styles';
import { ISTagButtonProps } from './types';

export const STagButton: FC<ISTagButtonProps> = ({
  text,
  large,
  icon,
  sx,
  ...props
}) => {
  return (
    <STSBoxButton
      sx={{ height: large ? 30 : 22, pl: 5, pr: 4, ...sx }}
      {...props}
    >
      {icon && <Icon sx={{ fontSize: 14 }} component={icon} />}
      {text && (
        <SText fontSize="13px" color="text.primary" ml={1}>
          {text}
        </SText>
      )}
    </STSBoxButton>
  );
};
