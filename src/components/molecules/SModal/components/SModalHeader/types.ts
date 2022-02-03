import { BoxProps } from '@mui/material';

export interface SModalHeaderProps extends BoxProps {
  title: string;
  modalName: string;
  subtitle?: string;
  onClose?: () => null;
}
