import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

import { DocModelPageOrientation, IDocumentModelFull } from 'core/interfaces/api/IDocumentModel';

export type IElementTypeModelOption = IDocumentModelFull['elements'][0] & {
  optionValue?: string;
  orientation?: DocModelPageOrientation;
};

export interface IElementTypeModelSelectProps extends BoxProps {
  selected: IDocumentModelFull['elements'][0]['type'];
  selectedOptionValue?: string;
  elements: IDocumentModelFull['elements'];
  large?: boolean;
  multiple?: boolean;
  text?: string;
  handleSelect?: (selectedId: IElementTypeModelOption) => void;
  active?: boolean;
  disabled?: boolean;
  error?: boolean;
  bg?: string;
  borderActive?: 'error' | 'info' | 'warning' | 'success' | 'primary';
  tooltipTitle?: ReactNode;
  representAll?: boolean;
}
