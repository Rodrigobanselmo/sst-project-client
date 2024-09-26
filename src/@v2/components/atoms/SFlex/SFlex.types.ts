import { BoxProps } from '@mui/material';

export interface SFlexProps extends BoxProps {
  direction?: BoxProps['flexDirection'];
  center?: boolean;
  align?: BoxProps['alignItems'];
  justify?: BoxProps['justifyContent'];
}
