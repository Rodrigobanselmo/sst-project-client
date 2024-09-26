import { BoxProps } from '@mui/material';

export interface STableProps extends BoxProps {
  columns: string[];
  rowGap?: string;
  rowsNumber?: number;
  loading?: boolean;
}
