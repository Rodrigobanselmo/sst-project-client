import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { ICompany } from 'core/interfaces/api/ICompany';
import { IQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';

export interface IClinicSelectProps
  extends Omit<Partial<AutocompleteFormProps<ICompany>>, 'onChange'> {
  control: Control<any, object>;
  name: string;
  query?: IQueryCompanies;
  label: string;
  addMore?: boolean;
  onChange?: (value: ICompany) => void;
}
