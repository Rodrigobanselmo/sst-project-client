import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { ICid } from 'core/interfaces/api/ICid';

export interface ICidSelectProps
  extends Omit<Partial<AutocompleteFormProps<ICid>>, 'onChange'> {
  control: Control<FieldValues, object>;
  name: string;
  label: string;
  onChange?: (value: ICid) => void;
}
