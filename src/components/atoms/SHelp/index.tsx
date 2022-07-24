/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/display-name */
import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';

import SHelpIcon from 'assets/icons/SHelpIcon';

import STooltip from '../STooltip';
import { SHelpProps } from './types';

export const SHelp: FC<SHelpProps> = ({
  fontSize = 15,
  tooltip,
  color = 'grey.700',
  ...props
}) => {
  return (
    <STooltip title={tooltip}>
      <Box sx={{ cursor: 'pointer' }} {...props}>
        <Icon sx={{ fontSize, color }} component={SHelpIcon} />
      </Box>
    </STooltip>
  );
};
