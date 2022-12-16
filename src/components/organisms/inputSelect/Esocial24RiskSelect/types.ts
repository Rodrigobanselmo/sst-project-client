import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';
import { RiskRecTypeEnum } from 'project/enum/RiskRecType.enum';

import { IEsocialTable24 } from 'core/interfaces/api/IEsocial';

export interface IEsocialTable24SelectProps
  extends Omit<Partial<AutocompleteFormProps<IEsocialTable24>>, 'onChange'> {
  control: Control<FieldValues, object>;
  name: string;
  type?: RiskRecTypeEnum;
  label: string;
  onChange?: (value: IEsocialTable24) => void;
}
