import { BoxProps } from '@mui/material';

export interface SModalPaperProps extends BoxProps {
  center?: boolean;
  fullScreen?: boolean;
  semiFullScreen?: boolean;
  loading?: boolean;
  minWidthDesk?: string | number;
}
