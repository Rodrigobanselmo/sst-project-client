import { Box } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

export interface SSearchSelectRenderOptionStatusRenderOptionStatusProps {
  option: {
    id: number;
    name: string;
    color?: string;
  };
  label: string;
  isSelected: boolean;
  handleSelect: (e: any) => void;
}

export function SSearchSelectRenderOptionStatusRenderOptionStatus({
  handleSelect,
  isSelected,
  option,
  label,
}: SSearchSelectRenderOptionStatusRenderOptionStatusProps) {
  return (
    <SFlex
      gap={5}
      mb={2}
      align="center"
      onClick={handleSelect}
      sx={{
        cursor: 'pointer',
        mx: 3,
        borderRadius: 1,
        py: 2,
        px: 5,
        '&:hover': {
          backgroundColor: 'grey.100',
        },
        '&:active': {
          backgroundColor: 'grey.200',
        },
        backgroundColor: isSelected ? 'grey.200' : 'transparent',
      }}
    >
      <Box
        borderRadius={'4px'}
        width={11}
        height={11}
        bgcolor={option.color || 'grey.400'}
      />
      <SText color="text.secondary" fontSize={14}>
        {label}
      </SText>
    </SFlex>
  );
}
