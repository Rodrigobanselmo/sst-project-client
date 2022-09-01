import { ChangeEvent, SyntheticEvent } from 'react';
import { Control, FieldValues } from 'react-hook-form';

import { BoxProps, SelectChangeEvent } from '@mui/material';
import { AutocompleteSelectProps } from 'components/atoms/SAutocompleteSelect/SAutocompleteSelect.types';

export type AutocompleteFormProps<T> = Omit<
  AutocompleteSelectProps<T>,
  'onChange'
> & {
  name: string;
  control: Control<FieldValues, object>;
  label?: string;
  defaultValue?: T | string;
  onChange?: (value: T) => void;
  onGetValue?: (value: T) => string;
  setValue?: (value: T | string) => void;
  mask?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  boxProps?: Partial<Omit<BoxProps, 'defaultValue'>>;
  unmountOnChangeDefault?: boolean;
};
