import { Control, FieldValues } from 'react-hook-form';

import { AutocompleteFormProps } from 'components/molecules/form/autocomplete/types';

import { IProtocol } from 'core/interfaces/api/IProtocol';

export interface IProtocolSelectProps
  extends Omit<Partial<AutocompleteFormProps<IProtocol>>, 'onChange'> {
  control: Control<any, object>;
  name: string;
  label: string;
  onChange?: (value: IProtocol) => void;
}
