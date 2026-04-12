import { BoxProps } from '@mui/material';

export type STablePaginationProps = BoxProps & {
  totalCountOfRegisters?: number;
  registersPerPage?: number;
  currentPage?: number;
  onPageChange: (page: number) => void;
  /** When set with onRegistersPerPageChange, shows "Mostrar: [n]" beside the pager. */
  pageSizeOptions?: readonly number[];
  onRegistersPerPageChange?: (size: number) => void;
};
