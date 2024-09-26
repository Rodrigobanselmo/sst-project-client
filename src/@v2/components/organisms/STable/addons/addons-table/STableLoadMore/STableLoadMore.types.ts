import { BoxProps } from '@mui/material';

export interface STableLoadMoreProps extends BoxProps {
  actualRows: number;
  totalRows: number;
}
