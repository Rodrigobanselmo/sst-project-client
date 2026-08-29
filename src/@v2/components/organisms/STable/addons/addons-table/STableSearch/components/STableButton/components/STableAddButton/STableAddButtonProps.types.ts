import { BoxProps } from '@mui/material';
import { SInputProps } from 'components/atoms/SInput/types';

export type STableAddButtonProps = {
  onClick: () => void;
  text?: string;
  /** Identidade só em hover/focus/pressed (repouso neutro). Default: outlined primary. */
  identityFill?: boolean;
};
