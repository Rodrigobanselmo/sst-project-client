import { InputProps, TextareaAutosizeProps } from '@mui/material';

export interface STextareaProps
  extends TextareaAutosizeProps,
    Pick<InputProps, 'sx'> {
  resize: boolean;
}
