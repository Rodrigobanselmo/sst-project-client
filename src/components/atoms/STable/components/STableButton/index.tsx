/* eslint-disable react/display-name */
import React, { FC } from 'react';

import { Box, Icon } from '@mui/material';
import { SButton } from 'components/atoms/SButton';
import STooltip from 'components/atoms/STooltip';

import AddIcon from 'assets/icons/SAddIcon';

import { STableButtonProps } from './types';

export const STableButton = React.forwardRef<any, STableButtonProps>(
  (
    { text, sm, icon = AddIcon, color = 'success.main', tooltip, ...props },
    ref,
  ) => {
    return (
      <Box ref={ref}>
        <STooltip title={tooltip || text}>
          <SButton
            {...props}
            sx={{
              height: sm ? 30 : [30, 30, 38],
              minWidth: sm ? 30 : [30, 30, 38],
              borderRadius: 1,
              m: 0,
              ml: 2,
              px: 4,
              backgroundColor: color,
              '&:hover': {
                backgroundColor: color,
                filter: 'brightness(0.8)',
              },
              ...props?.sx,
            }}
          >
            <Icon
              component={icon}
              sx={{
                fontSize: sm
                  ? ['0.9rem', '0.9rem', '1rem']
                  : ['1.1rem', '1.1rem', '1.4rem'],
                color: 'common.white',
              }}
            />
            {text && (
              <Box mr={3} ml={2}>
                {text}
              </Box>
            )}
          </SButton>
        </STooltip>
      </Box>
    );
  },
);
