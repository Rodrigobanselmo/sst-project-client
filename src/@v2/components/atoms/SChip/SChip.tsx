import { ChipProps, Typography, TypographyProps } from '@mui/material';
export type CChipVariant = 'outlined' | 'filled';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import { StyledChip } from './SChip.styles';

export interface CChipProps extends ChipProps {
  variant: CChipVariant;
  size: 'small' | 'medium';
  label: string;
  deletable?: boolean;
  typographyProps?: TypographyProps;
}

export const CChip = ({
  deleteIcon = <CancelOutlinedIcon />,
  deletable,
  onDelete,
  typographyProps,
  ...props
}: CChipProps) => {
  return (
    <StyledChip
      color="primary"
      {...props}
      onDelete={deletable ? onDelete : undefined}
      label={
        <Typography
          variant="body2"
          color={
            props.variant === 'filled'
              ? 'var(--mui-palette-primary-contrastText)'
              : 'primary'
          }
          {...typographyProps}
        >
          {props.label}
        </Typography>
      }
      deleteIcon={deleteIcon}
    />
  );
};

export default CChip;
