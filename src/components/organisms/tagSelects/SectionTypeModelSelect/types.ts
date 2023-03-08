import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

export interface ISectionTypeModelSelectProps extends BoxProps {
  selected: IDocumentModelFull['sections'][0]['type'];
  sections: IDocumentModelFull['sections'];
  large?: boolean;
  multiple?: boolean;
  text?: string;
  handleSelect?: (selectedId: IDocumentModelFull['sections'][0]) => void;
  active?: boolean;
  disabled?: boolean;
  error?: boolean;
  bg?: string;
  borderActive?: 'error' | 'info' | 'warning' | 'success' | 'primary';
  tooltipTitle?: ReactNode;
  representAll?: boolean;
}
