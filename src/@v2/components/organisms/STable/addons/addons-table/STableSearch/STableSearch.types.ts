import { BoxProps } from '@mui/material';
import { SInputProps } from 'components/atoms/SInput/types';

export type STableSearchProps = {
  inputProps?: SInputProps;
  onSearch: (value: string) => void;
  search?: string;
  autoFocus?: boolean;
  mb?: BoxProps['mb'];
};
