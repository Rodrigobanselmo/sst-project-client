import { BoxProps } from '@mui/material';

export interface SPageMenuProps extends Omit<BoxProps, 'onChange'> {
  options: { value: string; label: string }[];
  active?: string;
  onChange: (value: string, e: React.MouseEvent<HTMLDivElement>) => void;
}
