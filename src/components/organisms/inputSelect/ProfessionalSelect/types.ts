import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';
import { initialProfessionalState } from 'components/organisms/modals/ModalAddProfessional/hooks/useEditProfessionals';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

import { IProfessional } from 'core/interfaces/api/IProfessional';

export interface IProfessionalSelectProps
  extends Omit<Partial<AutocompleteFormProps<IProfessional>>, 'onChange'> {
  control: Control<FieldValues, object>;
  name: string;
  label: string;
  type?: ProfessionalTypeEnum[];
  addProfessionalInitProps?: Partial<typeof initialProfessionalState>;
  onChange?: (value: IProfessional) => void;
}
