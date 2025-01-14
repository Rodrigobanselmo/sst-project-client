import { Box } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { StatusBrowseResultModel } from '@v2/models/security/models/status/status-browse-result.model';

export interface SSearchSelectRenderOptionStatusRenderOptionStatusProps {
  option: StatusBrowseResultModel;
  label: string;
  isSelected: boolean;
}

export function SSearchSelectRenderOptionStatusRenderOptionStatus({
  isSelected,
  option,
  label,
}: SSearchSelectRenderOptionStatusRenderOptionStatusProps) {
  return (
    <SFlex
      gap={5}
      align="center"
      sx={{
        cursor: 'pointer',
        mx: 3,
        borderRadius: 1,
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
