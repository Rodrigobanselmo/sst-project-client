import React, { FC } from 'react';

import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import { STableEmptyProps } from './types';

const STableEmpty: FC<{ children?: any } & STableEmptyProps> = ({
  content = <>Nenhum dado encontrado</>,
  ...props
}) => (
  <SFlex
    sx={{
      borderRadius: '999px',
      minHeight: 48,
      p: 5,
      py: 3,
      opacity: 0.8,
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      boxShadow: 'none',
    }}
    align="center"
    {...props}
  >
    <TravelExploreOutlinedIcon
      sx={{ color: 'gray.400', fontSize: '30px', mr: 6 }}
    />
    <SText fontSize={13}>{content}</SText>
  </SFlex>
);

export default STableEmpty;
