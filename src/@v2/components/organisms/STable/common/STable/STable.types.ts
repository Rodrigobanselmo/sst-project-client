import { BoxProps } from '@mui/material';
import { ReactNode } from 'react';

export interface STableProps<T> {
  limit?: number;
  isLoading?: boolean;
  rowGap?: string;
  data: T[];
  renderHeader: (header: ReactNode[]) => ReactNode;
  renderBody: (props: {
    data: T[];
    rows: ((row: T) => ReactNode)[];
  }) => ReactNode;
  table: {
    column: string;
    header: React.ReactNode;
    row: (row: any) => React.ReactNode;
  }[];
}
