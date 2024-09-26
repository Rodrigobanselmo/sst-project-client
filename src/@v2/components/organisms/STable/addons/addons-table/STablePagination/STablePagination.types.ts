import { BoxProps, PaginationProps } from '@mui/material';

export interface STableLoadMoreProps {
  total: number;
  limit: number;
  page: number;
  setPage: (page: number) => void;
}
