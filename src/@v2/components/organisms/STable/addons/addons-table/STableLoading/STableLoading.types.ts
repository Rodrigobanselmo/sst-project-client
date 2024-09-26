import { BoxProps } from '@mui/material';
import { STableProps } from '../../../common/STable/STable.types';

export interface STableLoadingProps extends BoxProps {
  limit?: number;
  rowGap?: string;
  table: {
    column: string;
    header: React.ReactNode;
    row: (row: any) => React.ReactNode;
  }[];
}
