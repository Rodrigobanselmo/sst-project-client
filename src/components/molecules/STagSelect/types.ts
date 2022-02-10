/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent, ReactNode, RefObject } from 'react';

import { BoxProps } from '@mui/material';

export type IAnchorEvent = (EventTarget & HTMLDivElement) | null;

export interface ISTagSelectProps extends BoxProps {
  text: string;
  large?: boolean;
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  options: {
    value: string | number;
    name: string;
    icon?: ElementType<any>;
  }[];
  startAdornment?: (option: any) => ReactNode;
  icon?: ElementType<any>;
  menuRef: RefObject<HTMLDivElement>;
}
