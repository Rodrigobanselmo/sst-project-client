import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import React from 'react';
import { STableEmptyProps } from './STableEmpty.types';
import { SText } from '@v2/components/atoms/SText/SText';

export const STableEmpty: React.FC<STableEmptyProps> = ({
  children = (
    <SText fontSize={13}>
      Nenhum dado <br /> encontrado
    </SText>
  ),
  ...props
}) => (
  <SFlex
    sx={{
      borderRadius: 1,
      p: 5,
      py: 3,
      opacity: 0.8,
      border: '1px solid',
      borderColor: 'grey.200',
      backgroundColor: 'background.paper',
      boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.15)',
    }}
    align="center"
    {...props}
  >
    <TravelExploreOutlinedIcon
      sx={{ color: 'gray.400', fontSize: '30px', mr: 6 }}
    />
    {children}
  </SFlex>
);

export default STableEmpty;
