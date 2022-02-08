import { ReactNode, MutableRefObject } from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent } from 'react';

import { MenuItemProps } from '@mui/material';

import { IMenuSearchOption } from '../types';

export interface SMenuItemsSearchProps extends Omit<MenuItemProps, 'selected'> {
  options: IMenuSearchOption[];
  localSelected: MutableRefObject<string[]>;
  handleMenuSelect: (
    option: IMenuSearchOption | string[],
    event: MouseEvent<HTMLLIElement>,
  ) => void;
  icon?: ElementType<any>;
  selected?: string[];
  startAdornment?: (option: IMenuSearchOption) => ReactNode;
  optionsFieldName?: { valueField?: string; contentField?: string };
  multiple?: boolean;
}
