import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { IEsocialTable14And15Acid } from 'core/interfaces/api/IEsocial';

export interface IEsocialTable15SelectProps
  extends Omit<
    Partial<AutocompleteFormProps<IEsocialTable14And15Acid>>,
    'onChange'
  > {
  control: Control<FieldValues, object>;
  name: string;
  label: string;
  onChange?: (value: IEsocialTable14And15Acid) => void;
}
