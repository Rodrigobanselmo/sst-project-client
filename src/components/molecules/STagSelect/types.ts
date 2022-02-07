/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent, ReactNode } from 'react';

import { BoxProps } from '@mui/material';

import { IMenuSearchOption } from '../SMenuSearch/types';

export type IAnchorEvent = (EventTarget & HTMLDivElement) | null;

export interface ISTagSelectProps extends BoxProps {
  text: string;
  large?: boolean;
  search?: boolean;
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  options?: {
    value: string | number;
    name: string;
    icon?: ElementType<any>;
  }[];
  optionsSearch?: IMenuSearchOption[];
  startAdornment?: (option: any) => ReactNode;
  icon?: ElementType<any>;
}
