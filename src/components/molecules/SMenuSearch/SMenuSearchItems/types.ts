import {
  ReactNode,
  MutableRefObject,
  SetStateAction,
  Dispatch,
  RefObject,
} from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent } from 'react';

import { MenuItemProps } from '@mui/material';

import { IMenuSearchOption } from '../types';

export interface SMenuItemsSearchProps extends Omit<MenuItemProps, 'selected'> {
  handleMultiSelectMenu?: (
    option: any,
    list: (string | number)[],
    e: any,
  ) => void;
  options: IMenuSearchOption[];
  localSelected: MutableRefObject<(string | number)[]>;
  handleMenuSelect: (
    option: IMenuSearchOption | string[],
    event: MouseEvent<HTMLLIElement>,
  ) => void;
  icon?: ElementType<any>;
  selected?: (string | number)[];
  startAdornment?: (option: IMenuSearchOption) => ReactNode;
  endAdornment?: (option: IMenuSearchOption) => ReactNode;
  optionsFieldName?: { valueField?: string; contentField?: string };
  multiple?: boolean;
  setScroll: Dispatch<SetStateAction<number>>;
  listRef?: RefObject<HTMLDivElement>;
  renderContent?: (option: IMenuSearchOption) => ReactNode;
}
