import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { IEsocialTable20Lograd } from 'core/interfaces/api/IEsocial';

export interface IEsocialTable20SelectProps
  extends Omit<
    Partial<AutocompleteFormProps<IEsocialTable20Lograd>>,
    'onChange'
  > {
  control: Control<any, object>;
  name: string;
  label: string;
  onChange?: (value: IEsocialTable20Lograd) => void;
}
