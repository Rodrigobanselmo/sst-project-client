import React, { FC } from 'react';

import { Box } from '@mui/material';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

import { STableLoadMoreProps } from './STableLoadMore.types';

export const STableLoadMore: FC<STableLoadMoreProps> = ({
  actualRows,
  totalRows,
  onClick,
  ...props
}) => (
  <SFlex position="absolute" bottom={-25} right={0} mt={10} {...props}>
    <SText fontSize="14px" fontWeight="300" color="text.light" ml="auto">
      Total: {actualRows} / {totalRows}
    </SText>
    <Box
      onClick={onClick}
      sx={{
        pl: 10,
        fontSize: '14px',
        color: 'text.medium',
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.7,
        },
      }}
    >
      Visualizar mais
    </Box>
  </SFlex>
);
