/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElementType, MouseEvent } from 'react';

import { BoxProps } from '@mui/material';

import { IMenuOptionResponse } from '../SMenu/types';

export type IAnchorEvent = (EventTarget & HTMLDivElement) | null;

export interface ISTagSelectProps extends BoxProps {
  text: string;
  large?: boolean;
  handleSelectMenu?: (
    option: IMenuOptionResponse,
    e: MouseEvent<HTMLLIElement>,
  ) => void;
  options?: {
    value: string | number;
    name: string;
    icon?: ElementType<any>;
  }[];
  icon?: ElementType<any>;
}
