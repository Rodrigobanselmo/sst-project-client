import { SInputProps } from '../SInput/SInput.types';

export type SInputFileProps = Omit<SInputProps, 'onChange' | 'value'> & {
  accept?: string;
  value: File | null;
  onChange: (file: File | null) => void;
};
