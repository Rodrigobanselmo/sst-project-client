/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent, ReactNode } from 'react';

import { BoxProps } from '@mui/material';
import { ISTagButtonProps } from 'components/atoms/STagButton/types';
import Fuse from 'fuse.js';

import { IMenuSearchOption } from '../SMenuSearch/types';

export type IAnchorEvent = (EventTarget & HTMLDivElement) | null;

export interface ISTagSearchSelectProps
  extends BoxProps,
    Partial<ISTagButtonProps> {
  text: string;
  tooltipTitle?: ReactNode;
  bg?: string;
  placeholder?: string;
  isLoading?: boolean;
  large?: boolean;
  asyncLoad?: boolean;
  selected?: (string | number)[];
  keys?: Fuse.FuseOptionKey[];
  preventOpen?: boolean;
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  handleMultiSelectMenu?: (
    option: any,
    list: (string | number)[],
    e: MouseEvent<HTMLLIElement>,
  ) => void;
  options: IMenuSearchOption[];
  startAdornment?: (option: any) => ReactNode;
  onClose?: () => void;
  endAdornment?: (option: any) => ReactNode;
  optionsFieldName?: { valueField?: string; contentField?: string };
  icon?: ElementType<any> | null;
  iconItem?: ElementType<any>;
  multiple?: boolean;
  onEnter?: (value: string) => void;
  additionalButton?: (e: MouseEvent<HTMLButtonElement>) => void;
  renderFilter?: () => React.ReactNode;
  error?: boolean;
  onSearch?: (value: string) => void;
}
