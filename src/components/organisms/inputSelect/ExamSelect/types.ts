import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { IExam } from 'core/interfaces/api/IExam';
import { IQueryExam } from 'core/services/hooks/queries/useQueryExams/useQueryExams';

export interface IExamSelectProps
  extends Omit<Partial<AutocompleteFormProps<IExam>>, 'onChange'> {
  control: Control<FieldValues, object>;
  name: string;
  label: string;
  query?: IQueryExam;
  onChange?: (value: IExam) => void;
}
