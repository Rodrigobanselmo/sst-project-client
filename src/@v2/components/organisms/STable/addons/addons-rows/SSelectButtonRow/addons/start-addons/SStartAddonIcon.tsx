import { Box } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { ReactNode } from 'react';

export interface SStartAddonCircleProps {
  item: ReactNode;
}

export const SStartAddonIcon = ({ item }: SStartAddonCircleProps) => {
  return (
    <SFlex
      center
      sx={{
        width: '25px',
        mr: -5,
        height: '100%',
      }}
    >
      {item}
    </SFlex>
  );
};
