/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React from 'react';

import { Icon } from '@mui/material';

import SText from '../SText';
import { STSBoxButton } from './styles';
import { ISTagButtonProps } from './types';

export const STagButton = React.forwardRef<any, ISTagButtonProps>(
  ({ text, large, icon, sx, ...props }, ref) => {
    return (
      <STSBoxButton
        ref={ref}
        sx={{ height: large ? 30 : 22, pl: 3, pr: 5, ...sx }}
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
  },
);
