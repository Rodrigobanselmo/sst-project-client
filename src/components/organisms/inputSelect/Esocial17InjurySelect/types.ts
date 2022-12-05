import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { IEsocialTable17Injury } from 'core/interfaces/api/IEsocial';

export interface IEsocialTable17SelectProps
  extends Omit<
    Partial<AutocompleteFormProps<IEsocialTable17Injury>>,
    'onChange'
  > {
  control: Control<FieldValues, object>;
  name: string;
  label: string;
  onChange?: (value: IEsocialTable17Injury) => void;
}
