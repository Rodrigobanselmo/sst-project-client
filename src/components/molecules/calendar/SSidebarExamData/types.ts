import { BoxProps } from '@mui/material';

// interface

//* continue
export interface SCalendarProps extends BoxProps {
  setData?: (data: any) => void;
  data?: any;
}
