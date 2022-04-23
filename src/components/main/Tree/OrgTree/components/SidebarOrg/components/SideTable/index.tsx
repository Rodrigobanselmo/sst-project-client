import React, { FC } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';

import { STGridItem } from './styles';
import { SideTableProps } from './types';

export const SideTable: FC<SideTableProps> = ({ gho, isSelected }) => {
  // const data = useAppSelector(selectGhoRiskData(gho.id));

  return (
    <STGridItem key={gho.id} selected={isSelected ? 1 : 0}>
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
      <Box>
        <SText lineNumber={2}>{gho.name}</SText>
      </Box>
    </STGridItem>
  );
};
