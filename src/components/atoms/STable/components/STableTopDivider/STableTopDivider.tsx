import React, { FC } from 'react';

import { Divider, Box, Icon } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import { STableTopDividerProps } from './types';

const STableTopDivider: FC<STableTopDividerProps> = ({
  icon,
  content,
  iconProps = {},
  ...props
}) => (
  <Box {...props}>
    <SFlex align="center">
      {icon && (
        <Icon
          component={icon}
          sx={{ color: 'gray.400', fontSize: '30px', mr: 2, ...iconProps.sx }}
          {...iconProps}
        />
      )}
      <SText color="text.label" fontSize={16}>
        {content}
      </SText>
    </SFlex>
    <Divider sx={{ mb: 5, mt: 3 }} />
  </Box>
);

export default STableTopDivider;
