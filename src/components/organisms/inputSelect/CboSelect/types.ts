import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { ICbo } from 'core/interfaces/api/ICbo';

export interface ICboSelectProps
  extends Omit<Partial<AutocompleteFormProps<ICbo>>, 'onChange'> {
  control: Control<any, object>;
  name: string;
  label: string;
  onChange?: (value: ICbo) => void;
}
