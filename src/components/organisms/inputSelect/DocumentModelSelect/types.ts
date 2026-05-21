import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { IDocumentModel } from 'core/interfaces/api/IDocumentModel';
import { IQueryDocumentModels } from 'core/services/hooks/queries/useQueryDocumentModels/useQueryDocumentModels';

export interface IDocumentModelSelectProps
  extends Omit<Partial<AutocompleteFormProps<IDocumentModel>>, 'onChange'> {
  control: Control<any, object>;
  name: string;
  label: string;
  query?: IQueryDocumentModels;
  onChange?: (value: IDocumentModel) => void;
}
