import { MutableRefObject } from 'react';

import { BoxProps } from '@mui/material';

export interface IPopperProps extends BoxProps {
  isOpen: boolean;
  close: () => void;
  anchorEl: MutableRefObject<HTMLDivElement | null>;
  color?: 'dark' | 'paper' | 'darkPaper' | 'default';
}
