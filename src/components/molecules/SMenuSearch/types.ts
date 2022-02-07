import { ReactNode } from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent } from 'react';

import { MenuProps } from '@mui/material';

export interface IMenuSearchOption extends Record<string, any> {
  value?: string | number;
  name?: string;
  icon?: ElementType<any>;
}

export interface SMenuSearchProps extends Omit<MenuProps, 'open' | 'onClose'> {
  isOpen: boolean;
  width?: (string | number)[] | string | number;
  keys?: string[];
  close: () => void;
  handleSelect: (
    option: IMenuSearchOption,
    event: MouseEvent<HTMLLIElement>,
  ) => void;
  icon?: ElementType<any>;
  startAdornment?: (option: IMenuSearchOption) => ReactNode;
  placeholder?: string;
  options: IMenuSearchOption[];
  optionsFieldName?: { valueField?: string; contentField?: string };
}
