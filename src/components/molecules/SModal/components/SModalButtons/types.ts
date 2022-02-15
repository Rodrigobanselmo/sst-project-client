import { BoxProps } from '@mui/material';

import { SButtonProps } from '../../../../atoms/SButton/types';

export interface IModalButton extends Omit<SButtonProps, 'variant'> {
  text?: string;
  variant?: 'contained' | 'outlined' | 'text';
}

export interface SModalHeaderProps extends BoxProps {
  modalName?: string;
  loading?: boolean;
  buttons?: IModalButton[];
  onClose?: () => void;
}
