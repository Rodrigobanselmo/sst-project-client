import { BoxProps } from '@mui/material';

export type DraftEditorProps = {
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  defaultValue?: string;
  isJson?: boolean;
  placeholder?: string;
  label?: string;
  allVisible?: boolean;
  onChange?: (value: any) => void;
  // name: string;
  // label?: ReactNode;
  // onChange?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  // mask?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  // uneditable?: boolean;
} & BoxProps;
