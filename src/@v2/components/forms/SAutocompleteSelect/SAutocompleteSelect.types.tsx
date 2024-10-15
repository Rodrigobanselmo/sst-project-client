import {
  AutocompleteProps,
  AutocompleteInputChangeReason,
} from '@mui/material';
import { SInputProps } from '../SInput/SInput.types';

export interface SAutocompleteSelectProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
> extends Pick<
    AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo>,
    'onBlur' | 'onFocus'
  > {
  options: Value[];
  value: Value | null;
  inputProps?: Partial<SInputProps>;
  errorMessage?: string;
  label?: string;
  loading?: boolean;
  placeholder?: string;
  getOptionLabel: (option: Value) => string;
  onChange: (event: React.SyntheticEvent, value: Value | null) => void;
  onInputChange?: (
    event: React.SyntheticEvent,
    value: string,
    reason: AutocompleteInputChangeReason,
  ) => void;
}
