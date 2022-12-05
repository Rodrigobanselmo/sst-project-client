import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { IEsocialTable13Body } from 'core/interfaces/api/IEsocial';

export interface IEsocialTable13SelectProps
  extends Omit<
    Partial<AutocompleteFormProps<IEsocialTable13Body>>,
    'onChange'
  > {
  control: Control<FieldValues, object>;
  name: string;
  label: string;
  onChange?: (value: IEsocialTable13Body) => void;
}
