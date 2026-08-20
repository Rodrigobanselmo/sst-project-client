import React, { FC } from 'react';

import { Box, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { STableAddButton as V2STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';

import { STableSmallTitleProps } from './types';

const STableSmallTitle: FC<{ children?: any } & STableSmallTitleProps> = ({
  text,
  onAddClick,
  ...props
}) => (
  <Box {...props}>
    <SFlex gap={10} justify="start" mt={0} align="center">
      <SText fontSize={18}>{text}</SText>
      {onAddClick ? (
        <V2STableAddButton onClick={onAddClick} text="Adicionar" />
      ) : null}
    </SFlex>
    <Divider sx={{ mb: 5, mt: 5 }} />
  </Box>
);

export default STableSmallTitle;
