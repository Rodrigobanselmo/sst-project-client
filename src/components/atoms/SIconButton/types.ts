import { CircularProgressProps } from '@mui/material/CircularProgress';
import { IconButtonProps } from '@mui/material/IconButton';

export type SIconButtonProps = IconButtonProps & {
  loading?: boolean;
  tooltip?: string;
  circularProps?: CircularProgressProps;
  bg?: string;
};
