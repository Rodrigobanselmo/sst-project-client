import { BoxProps } from '@mui/material';
import { SInputProps } from 'components/atoms/SInput/types';

export type STableFilterButtonProps = {
  onClick?: () => void;
  text?: string;
  popperTile?: string;
  children: React.ReactNode;
};
