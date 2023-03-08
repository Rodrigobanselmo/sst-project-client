import { SyntheticKeyboardEvent } from 'react-draft-wysiwyg';

import { BoxProps } from '@mui/material';
import { STextProps } from 'components/atoms/SText/types';
import { EditorProps, EditorState } from 'draft-js';

export type DraftEditorProps = {
  size?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'model';
  defaultValue?: any;
  isJson?: boolean;
  placeholder?: string;
  label?: string;
  allVisible?: boolean;
  toolbarProps?: object;
  document1?: boolean;
  mention: {
    separator: string;
    trigger: string;
    suggestions: { text: string; value: string; url: string }[];
  };
  handleReturn: (
    e: SyntheticKeyboardEvent,
    editorState: EditorState,
  ) => boolean;
  document_model?: boolean;
  textProps?: STextProps;
  onChange?: (value: any) => void;
  editorProps?: EditorProps;
  toolbarOpen?: boolean;
  // name: string;
  // label?: ReactNode;
  // onChange?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  // mask?: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  // uneditable?: boolean;
} & BoxProps;
