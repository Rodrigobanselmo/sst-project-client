import { BoxProps } from '@mui/material';

import { SButtonProps } from '../../../../atoms/SButton/types';

export interface IModalButton extends SButtonProps {
  text?: string;
}

export interface SModalHeaderProps extends BoxProps {
  modalName: string;
  buttons?: IModalButton[];
}
