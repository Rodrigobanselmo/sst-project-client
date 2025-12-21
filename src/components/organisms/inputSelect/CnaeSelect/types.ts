import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { ICnae } from 'core/interfaces/api/ICompany';

export interface ICnaeSelectProps
  extends Omit<Partial<AutocompleteFormProps<ICnae>>, 'onChange' | 'setValue'> {
  control: Control<any, object>;
  name: string;
  label: string;
  data?: ICnae;
  onChange?: (value: ICnae) => void;
  setValue: (name: string, value: string) => void;
}
