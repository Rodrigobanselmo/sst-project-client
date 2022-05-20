/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoxProps } from '@mui/material';

export interface ISActionButtonProps extends BoxProps {
  text: string;
  active?: boolean;
  primary?: boolean;
  success?: boolean;
  icon: React.ElementType<any>;
}
