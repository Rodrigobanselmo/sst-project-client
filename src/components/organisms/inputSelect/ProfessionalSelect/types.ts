import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';
import { initialProfessionalState } from 'components/organisms/modals/ModalAddProfessional/hooks/useEditProfessionals';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

import { IProfessional } from 'core/interfaces/api/IProfessional';
import { IQueryProfessionals } from 'core/services/hooks/queries/useQueryProfessionals';

export interface IProfessionalSelectProps
  extends Omit<Partial<AutocompleteFormProps<IProfessional>>, 'onChange'> {
  control: Control<FieldValues, object>;
  name: string;
  label: string;
  query?: IQueryProfessionals;
  simpleAdd?: boolean;
  docOnly?: boolean;
  type?: ProfessionalTypeEnum[];
  addProfessionalInitProps?: Partial<typeof initialProfessionalState>;
  onChange?: (value: IProfessional) => void;
}
