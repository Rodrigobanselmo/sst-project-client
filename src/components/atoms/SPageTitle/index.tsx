import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import { SPageTitleProps } from './types';

const SPageTitle: FC<{ children?: any } & SPageTitleProps> = ({
  children,
  icon,
  iconSx = {},
  mb = 12,
  mt = 0,
  subtitle,
  ...props
}) => (
  <Box mb={mb} mt={mt}>
    <SFlex align="center">
      {icon && (
        <Icon
          component={icon}
          sx={{ fontSize: '22px', mr: 4, color: 'text.main', ...iconSx }}
        />
      )}
      <SText
        fontSize={['1.3rem', '1.3rem', '1.563rem']}
        variant={'h4'}
        {...props}
      >
        {children}
      </SText>
    </SFlex>
    {subtitle && typeof subtitle === 'string' && (
      <SText mt={2}>{subtitle}</SText>
    )}

    {subtitle && !(typeof subtitle === 'string') && subtitle}
  </Box>
);

export default SPageTitle;
