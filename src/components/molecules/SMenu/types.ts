/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent } from 'react';

import { MenuProps } from '@mui/material';

export interface IMenuOptionResponse {
  value: string | number;
  name: string;
}

export interface SMenuProps extends Omit<MenuProps, 'open' | 'onClose'> {
  isOpen: boolean;
  close: () => void;
  handleSelect: (
    option: IMenuOptionResponse,
    event: MouseEvent<HTMLLIElement>,
  ) => void;
  icon?: ElementType<any>;
  options: {
    value: string | number;
    name: string;
    icon?: ElementType<any>;
  }[];
}
