import { BoxProps, PaginationProps } from '@mui/material';

export interface STableLoadMoreProps {
  total?: number;
  limit?: number;
  page?: number;
  isLoading?: boolean;
  setPage: (page: number) => void;
  mt?: number | number[];
}
