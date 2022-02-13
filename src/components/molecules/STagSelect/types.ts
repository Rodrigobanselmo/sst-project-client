/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent, ReactNode, RefObject } from 'react';

import { ISTagButtonProps } from 'components/atoms/STagButton/types';

export type IAnchorEvent = (EventTarget & HTMLDivElement) | null;

export interface ISTagSelectProps extends ISTagButtonProps {
  text: string;
  tooltipTitle?: string;
  large?: boolean;
  handleSelectMenu?: (option: any, e: MouseEvent<HTMLLIElement>) => void;
  options: {
    value: string | number;
    name: string;
    icon?: ElementType<any>;
    iconColor?: string;
  }[];
  startAdornment?: (option: any) => ReactNode;
  icon?: ElementType<any>;
  menuRef?: RefObject<HTMLDivElement>;
}
