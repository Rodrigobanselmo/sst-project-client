import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { IconButton, Paper, TypographyProps } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { ReactNode } from 'react';

export interface STableFilterChipProps {
  onClick?: () => void;
}

export const STableCleanChip = ({ onClick }: STableFilterChipProps) => {
  return (
    <SFlex
      center
      px={5}
      onClick={onClick}
      sx={{
        borderRadius: '20px',
        borderColor: 'grey.400',
        backgroundColor: 'transparent',
        borderWidth: '1px',
        userSelect: 'none',
        borderStyle: 'solid',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'grey.300',
        },
        '&:active': {
          opacity: 0.8,
        },
      }}
    >
      {' '}
      <SText color={'text.label'} fontSize={11}>
        Limpar
      </SText>
    </SFlex>
  );
};
