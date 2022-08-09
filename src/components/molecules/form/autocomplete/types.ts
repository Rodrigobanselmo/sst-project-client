import { ChangeEvent, SyntheticEvent } from 'react';
import { Control, FieldValues } from 'react-hook-form';

import { SelectChangeEvent } from '@mui/material';
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
  mask?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
};
