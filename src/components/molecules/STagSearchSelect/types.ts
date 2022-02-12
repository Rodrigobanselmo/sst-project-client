/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent, ReactNode } from 'react';

import { BoxProps } from '@mui/material';
import Fuse from 'fuse.js';

import { IMenuSearchOption } from '../SMenuSearch/types';

export type IAnchorEvent = (EventTarget & HTMLDivElement) | null;

export interface ISTagSearchSelectProps extends BoxProps {
  text: string;
  tooltipTitle?: string;
  placeholder?: string;
  large?: boolean;
  selected?: (string | number)[];
  keys?: Fuse.FuseOptionKey[];
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  options: IMenuSearchOption[];
  startAdornment?: (option: any) => ReactNode;
  optionsFieldName?: { valueField?: string; contentField?: string };
  icon?: ElementType<any>;
  iconItem?: ElementType<any>;
  multiple?: boolean;
  additionalButton?: (e: MouseEvent<HTMLButtonElement>) => void;
  renderFilter?: () => React.ReactNode;
}
