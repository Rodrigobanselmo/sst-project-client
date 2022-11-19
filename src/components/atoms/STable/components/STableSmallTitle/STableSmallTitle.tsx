import React, { FC } from 'react';

import { Box, Divider } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';

import SAddIcon from 'assets/icons/SAddIcon';

import { STableSmallTitleProps } from './types';

const STableSmallTitle: FC<STableSmallTitleProps> = ({
  text,
  onAddClick,
  ...props
}) => (
  <Box {...props}>
    <SFlex gap={10} justify="start" mt={0} align="center">
      <SText fontSize={18}>{text}</SText>
      <STagButton
        onClick={onAddClick}
        maxWidth={120}
        icon={SAddIcon}
        text={'adcionar'}
        active
        bg={'success.dark'}
      />
    </SFlex>
    <Divider sx={{ mb: 5, mt: 5 }} />
  </Box>
);

export default STableSmallTitle;
