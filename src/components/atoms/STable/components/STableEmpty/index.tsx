import React, { FC } from 'react';

import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';

import { STableEmptyProps } from './types';

const STableEmpty: FC<STableEmptyProps> = ({
  content = (
    <>
      Nenhum dado <br /> encontrado
    </>
  ),
  ...props
}) => (
  <SFlex
    sx={{
      borderRadius: 2,
      p: 5,
      py: 3,
      opacity: 0.8,
      border: '1px solid',
      borderColor: 'grey.200',
      boxShadow: '0px 0px 4px rgba(0, 0, 0, 0.15)',
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
