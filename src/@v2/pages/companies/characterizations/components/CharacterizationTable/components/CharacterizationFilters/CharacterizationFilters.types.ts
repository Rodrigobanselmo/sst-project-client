import { BoxProps } from '@mui/material';
import { SInputProps } from 'components/atoms/SInput/types';

export type CharacterizationFiltersProps = {
  onClick: () => void;
  text?: string;
  children: React.ReactNode;
};
