import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import { SPageTitleSectionProps } from './types';

const SPageTitleSection: FC<{ children?: any } & SPageTitleSectionProps> = ({
  icon,
  iconSx = {},
  title,
  mb = 0,
  mt = 20,
  subtitle,
  ...props
}) => (
  <Box mb={mb} mt={mt}>
    <SFlex align="center">
      {title && typeof title === 'string' && <SText {...props}>{title}</SText>}
      {title && !(typeof title === 'string') && title}
      {icon && (
        <Icon
          component={icon}
          sx={{ fontSize: '18px', mr: 4, color: 'grey.600', ...iconSx }}
        />
      )}
    </SFlex>
    {subtitle && typeof subtitle === 'string' && (
      <SText mt={5}>{subtitle}</SText>
    )}
    {subtitle && !(typeof subtitle === 'string') && subtitle}
  </Box>
);

export default SPageTitleSection;
