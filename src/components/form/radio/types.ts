import { ChangeEvent } from 'react';
import { Control, FieldValues } from 'react-hook-form';

import { SRadioCheckboxProps } from 'components/atoms/SRadioCheckbox/types';

export type InputFormProps = SRadioCheckboxProps & {
  name: string;
  control: Control<FieldValues, object>;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};
