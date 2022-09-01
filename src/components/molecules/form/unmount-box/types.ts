import { BoxProps } from '@mui/material';

export type UnmountBoxProps = Partial<Omit<BoxProps, 'defaultValue'>> & {
  defaultValue?: any;
  unmountOnChangeDefault?: boolean;
};
