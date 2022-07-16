import { BoxProps } from '@mui/material';

/* eslint-disable @typescript-eslint/ban-types */
export type PaginationItemProps = BoxProps & {
  pageNumber: number;
  isCurrent?: boolean;
  onPageChange: (page: number) => void;
};
