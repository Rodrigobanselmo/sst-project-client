import { BoxProps } from '@mui/material';
import { SInputProps } from 'components/atoms/SInput/types';

export type STableExportButtonProps = {
  onClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
  text?: string;
  disabled?: boolean;
};
