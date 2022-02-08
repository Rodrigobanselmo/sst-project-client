import { MouseEvent } from 'react';

import { BoxProps } from '@mui/material';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IMenuFilterOptions {
  filter: string;
  label: string;
  activeColor: string;
}

export interface SMenuSimpleFilterSearchProps extends BoxProps {
  options: IMenuFilterOptions[];
  activeFilters: string[];
  onClickFilter: (filter: string, e: MouseEvent<HTMLDivElement>) => void;
}
