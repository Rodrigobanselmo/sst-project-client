import { MutableRefObject } from 'react';

import { BoxProps, PopperPlacementType } from '@mui/material';

export interface IPopperProps extends BoxProps {
  isOpen: boolean;
  close: () => void;
  anchorEl: MutableRefObject<HTMLDivElement | null>;
  color?: 'dark' | 'paper' | 'darkPaper' | 'default';
  disabledArrow?: boolean;
  placement?: PopperPlacementType;
}
