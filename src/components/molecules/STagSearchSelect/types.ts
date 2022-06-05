/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent, ReactNode } from 'react';

import { BoxProps } from '@mui/material';
import { ISTagButtonProps } from 'components/atoms/STagButton/types';
import Fuse from 'fuse.js';

import { IGenerateSource } from 'core/interfaces/api/IRiskFactors';

import { IMenuSearchOption } from '../SMenuSearch/types';

export type IAnchorEvent = (EventTarget & HTMLDivElement) | null;

export interface ISTagSearchSelectProps
  extends BoxProps,
    Partial<ISTagButtonProps> {
  text: string;
  tooltipTitle?: string;
  bg?: string;
  placeholder?: string;
  large?: boolean;
  asyncLoad?: boolean;
  selected?: (string | number)[];
  keys?: Fuse.FuseOptionKey[];
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  options: IMenuSearchOption[];
  startAdornment?: (option: any) => ReactNode;
  onClose?: () => void;
  endAdornment?: (option: any) => ReactNode;
  optionsFieldName?: { valueField?: string; contentField?: string };
  icon?: ElementType<any>;
  iconItem?: ElementType<any>;
  multiple?: boolean;
  onEnter?: (value: string) => void;
  additionalButton?: (e: MouseEvent<HTMLButtonElement>) => void;
  renderFilter?: () => React.ReactNode;
  error?: boolean;
  onSearch?: (value: string) => void;
}
