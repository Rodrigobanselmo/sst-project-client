import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { IEsocialTable6Country } from 'core/interfaces/api/IEsocial';

export interface IEsocialTable6SelectProps
  extends Omit<
    Partial<AutocompleteFormProps<IEsocialTable6Country>>,
    'onChange'
  > {
  control: Control<any, object>;
  name: string;
  label: string;
  onChange?: (value: IEsocialTable6Country) => void;
}
