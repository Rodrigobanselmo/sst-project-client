import { BoxProps } from '@mui/material';
import { STextProps } from 'components/atoms/SText/types';

import { IDraftTypes } from 'core/interfaces/IDraftBlocks';

export type DraftEditorProps = {
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  defaultValue?: any;
  isJson?: boolean;
  placeholder?: string;
  label?: string;
  allVisible?: boolean;
  document1?: boolean;
  textProps?: STextProps;
  onChange?: (value: any) => void;
  // name: string;
  // label?: ReactNode;
  // onChange?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  // mask?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  // uneditable?: boolean;
} & BoxProps;
