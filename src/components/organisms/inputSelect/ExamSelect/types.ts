import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { IExam } from 'core/interfaces/api/IExam';
import { IQueryExam } from 'core/services/hooks/queries/useQueryExams/useQueryExams';

export interface IExamSelectProps
  extends Omit<Partial<AutocompleteFormProps<IExam>>, 'onChange'> {
  control: Control<any, object>;
  name: string;
  // clearErrors?: (
  //   name?: string | string[] | readonly string[] | undefined,
  // ) => void;
  label: string;
  query?: IQueryExam;
  onChange?: (value: IExam) => void;
}
