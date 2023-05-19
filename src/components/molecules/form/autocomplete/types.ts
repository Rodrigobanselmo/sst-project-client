import { ChangeEvent, SyntheticEvent } from 'react';
import { Control, FieldValues } from 'react-hook-form';

import { BoxProps, SelectChangeEvent } from '@mui/material';
import { AutocompleteSelectProps } from 'components/atoms/SAutocompleteSelect/SAutocompleteSelect.types';

export type AutocompleteFormProps<T> = Omit<
  AutocompleteSelectProps<T>,
  'onChange'
> & {
  name: string;
  control: Control<any, object>;
  label?: string;
  defaultValue?: T | string | number;
  onChange?: (value: T) => void;
  onGetValue?: (value: T) => string | number;
  setValue?: (value: T | string) => void;
  mask?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  boxProps?: Partial<Omit<BoxProps, 'defaultValue'>>;
  unmountOnChangeDefault?: boolean;
};
