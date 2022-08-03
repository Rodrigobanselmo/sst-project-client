import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

import { IProfessional } from 'core/interfaces/api/IProfessional';

export interface IProfessionalSelectProps
  extends Omit<Partial<AutocompleteFormProps<IProfessional>>, 'onChange'> {
  control: Control<FieldValues, object>;
  name: string;
  label: string;
  type?: ProfessionalTypeEnum[];
  onChange?: (value: IProfessional) => void;
}
