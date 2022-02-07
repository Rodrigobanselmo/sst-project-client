/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent, ReactNode } from 'react';

import { BoxProps } from '@mui/material';

import { IMenuSearchOption } from '../SMenuSearch/types';

export type IAnchorEvent = (EventTarget & HTMLDivElement) | null;

export interface ISTagSearchSelectProps extends BoxProps {
  text: string;
  large?: boolean;
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  options: IMenuSearchOption[];
  startAdornment?: (option: any) => ReactNode;
  optionsFieldName?: { valueField?: string; contentField?: string };
  icon?: ElementType<any>;
}