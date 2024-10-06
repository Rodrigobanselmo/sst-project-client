import { MutableRefObject } from 'react';

import { BoxProps, PopperPlacementType, PopperProps } from '@mui/material';

export interface SMenuProps extends BoxProps {
  isOpen: boolean;
  close: () => void;
  anchorEl: MutableRefObject<HTMLDivElement | HTMLButtonElement | null>;
  color?: 'dark' | 'paper' | 'darkPaper' | 'default';
  disabledArrow?: boolean;
  placement?: PopperPlacementType;
  popperProps?: Partial<PopperProps>;
}
