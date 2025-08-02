import { BoxProps } from '@mui/material';

export type PaginationItemProps = BoxProps & {
  pageNumber: number;
  isCurrent?: boolean;
  onPageChange: (page: number) => void;
};
