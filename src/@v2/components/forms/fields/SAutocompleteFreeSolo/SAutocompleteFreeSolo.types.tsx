import {
  AutocompleteProps,
  AutocompleteInputChangeReason,
  BoxProps,
} from '@mui/material';
import { SInputProps } from '../SInput/SInput.types';
import { IStringTransformationsType } from '@v2/utils/string-transformation';

export interface SAutocompleteFreeSoloProps<
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
  boxProps?: BoxProps;
  onChange: (value: string | Value | null, event: React.SyntheticEvent) => void;
  transformation?: IStringTransformationsType;
  // onInputChange?: (
  //   event: React.SyntheticEvent,
  //   value: string,
  //   reason: AutocompleteInputChangeReason,
  // ) => void;
}
