import React, { FC } from 'react';

import { Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import { SPageSubtitleProps } from './types';

const SPageSubtitle: FC<SPageSubtitleProps> = ({
  children,
  mb = 12,
  mt = 0,
  ...props
}) => (
  <SFlex mb={mb} mt={mt} align="center">
    <SText variant={'h6'} {...props}>
      {children}
    </SText>
  </SFlex>
);

export default SPageSubtitle;
