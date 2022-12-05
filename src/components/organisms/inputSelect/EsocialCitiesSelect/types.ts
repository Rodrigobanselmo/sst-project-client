import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { ICities } from 'core/interfaces/api/IUFCities';

export interface ICitiesSelectProps
  extends Omit<Partial<AutocompleteFormProps<ICities>>, 'onChange'> {
  control: Control<FieldValues, object>;
  name: string;
  label: string;
  onChange?: (value: ICities) => void;
}
