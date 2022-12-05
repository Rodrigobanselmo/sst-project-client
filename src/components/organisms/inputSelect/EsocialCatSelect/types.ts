import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { ICat } from 'core/interfaces/api/ICat';
import { IQueryCat } from 'core/services/hooks/queries/useQueryCat/useQueryCat';

export interface ICatSelectProps
  extends Omit<Partial<AutocompleteFormProps<ICat>>, 'onChange'> {
  control: Control<FieldValues, object>;
  name: string;
  label: string;
  query?: IQueryCat;
  onChange?: (value: ICat) => void;
}
