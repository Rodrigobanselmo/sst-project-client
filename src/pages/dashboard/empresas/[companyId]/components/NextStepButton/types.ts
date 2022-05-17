/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoxProps } from '@mui/material';

export interface INextStepButtonProps extends BoxProps {
  text: string;
  active?: boolean;
  icon: React.ElementType<any>;
}
