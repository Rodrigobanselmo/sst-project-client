import { ReactNode } from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent } from 'react';

import { MenuProps } from '@mui/material';
import Fuse from 'fuse.js';

export interface IMenuSearchOption extends Record<string, any> {
  value?: string | number;
  name?: string;
  checked?: boolean;
  hideWithoutSearch?: boolean;
  icon?: ElementType<any>;
}

export interface SMenuSearchProps extends Omit<MenuProps, 'open' | 'onClose'> {
  isOpen: boolean;
  width?: (string | number)[] | string | number;
  keys?: Fuse.FuseOptionKey[];
  close: () => void;
  handleSelect: (
    option: IMenuSearchOption | string[],
    event: MouseEvent<HTMLLIElement>,
  ) => void;
  onEnter?: (value: string) => void;
  icon?: ElementType<any>;
  endAdornment?: (option: any) => ReactNode;
  startAdornment?: (option: IMenuSearchOption) => ReactNode;
  placeholder?: string;
  options: IMenuSearchOption[];
  selected?: (string | number)[];
  optionsFieldName?: { valueField?: string; contentField?: string };
  multiple?: boolean;
  additionalButton?: (e: MouseEvent<HTMLButtonElement>) => void;
  renderFilter?: () => React.ReactNode;
}
