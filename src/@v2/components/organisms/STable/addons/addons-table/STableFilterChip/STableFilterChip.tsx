import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { IconButton, Paper, TypographyProps } from '@mui/material';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';

export interface STableFilterChipProps {
  label: string;
  leftLabel?: string;
  onDelete: () => void;
}

export const STableFilterChip = ({
  onDelete,
  label,
  leftLabel,
}: STableFilterChipProps) => {
  return (
    <SFlex
      center
      pl={5}
      pr={2}
      sx={{
        borderRadius: '20px',
        borderColor: 'gray.400',
        backgroundColor: 'grey.200',
        borderWidth: '1px',
        userSelect: 'none',
        borderStyle: 'solid',
      }}
    >
      {leftLabel && (
        <SText color={'text.label'} fontSize={13}>
          {leftLabel}
        </SText>
      )}
      <SText color={'text.medium'} fontSize={14}>
        {label}
      </SText>
      <IconButton size="small" onClick={onDelete}>
        <CancelOutlinedIcon sx={{ fontSize: 15, color: 'text.medium' }} />
      </IconButton>
    </SFlex>
  );
};
