import { ButtonProps } from '@mui/material/Button';
import { CircularProgressProps } from '@mui/material/CircularProgress';

export interface SButtonProps extends ButtonProps {
  loading?: boolean;
  circularProps?: CircularProgressProps;
}
