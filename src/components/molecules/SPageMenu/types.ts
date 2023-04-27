import { BoxProps } from '@mui/material';

export interface SPageMenuProps extends Omit<BoxProps, 'onChange'> {
  options: { value: string; label: string }[];
  active?: string;
  large?: boolean;
  onChange: (value: string, e: React.MouseEvent<HTMLDivElement>) => void;
}
