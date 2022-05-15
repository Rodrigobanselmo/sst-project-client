import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import { SPageTitleProps } from './types';

const SPageTitle: FC<SPageTitleProps> = ({
  children,
  icon,
  mb = 12,
  ...props
}) => (
  <SFlex mb={mb} align="center">
    {icon && (
      <Icon
        component={icon}
        sx={{ fontSize: '22px', mr: 4, color: 'text.main' }}
      />
    )}
    <SText variant={'h4'} {...props}>
      {children}
    </SText>
  </SFlex>
);

export default SPageTitle;
