/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent, ReactNode } from 'react';

import { MenuProps } from '@mui/material';
import { STooltipProps } from 'components/atoms/STooltip/types';

export interface IMenuOptionResponse {
  value: string | number;
  name: string;
}

export interface IMenuOption {
  value: string | number;
  name: string;
  disabled?: boolean;
  iconColor?: string;
  icon?: ElementType<any>;
}

export interface SMenuProps extends Omit<MenuProps, 'open' | 'onClose'> {
  isOpen: boolean;
  close: () => void;
  handleSelect: (
    option: IMenuOptionResponse,
    event: MouseEvent<HTMLLIElement>,
  ) => void;
  icon?: ElementType<any> | null;
  options: IMenuOption[];
  startAdornment?: (option: any) => ReactNode;
  tooltipProps?: (option?: any) => Partial<STooltipProps>;
}
