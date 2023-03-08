import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

import { IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

export interface IElementTypeModelSelectProps extends BoxProps {
  selected: IDocumentModelFull['elements'][0]['type'];
  elements: IDocumentModelFull['elements'];
  large?: boolean;
  multiple?: boolean;
  text?: string;
  handleSelect?: (selectedId: IDocumentModelFull['elements'][0]) => void;
  active?: boolean;
  disabled?: boolean;
  error?: boolean;
  bg?: string;
  borderActive?: 'error' | 'info' | 'warning' | 'success' | 'primary';
  tooltipTitle?: ReactNode;
  representAll?: boolean;
}
