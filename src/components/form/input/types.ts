import { ChangeEvent } from 'react';
import { Control, FieldValues } from 'react-hook-form';

import { ISInputProps } from '../../atoms/SInput/types';

export type InputFormProps = ISInputProps & {
  name: string;
  control: Control<FieldValues, object>;
  label?: string;
  defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  mask?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
};
