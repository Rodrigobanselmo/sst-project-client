import React, { FC } from 'react';

import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import { STableEmptyProps } from './types';

const STableEmpty: FC<STableEmptyProps> = ({ ...props }) => (
  <SFlex
    sx={{
      borderRadius: 2,
      p: 8,
      py: 5,
      opacity: 0.8,
      border: '1px solid',
      borderColor: 'grey.200',
      boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.15)',
    }}
    align="center"
    {...props}
  >
    <TravelExploreOutlinedIcon
      sx={{ color: 'gray.400', fontSize: '50px', mr: 6 }}
    />
    <SText sx={{}}>
      Nenhum dado <br /> encontrado
    </SText>
  </SFlex>
);

export default STableEmpty;
