import { BoxProps } from '@mui/material';

export interface SModalDocumentProps extends Omit<BoxProps, 'title'> {}
export interface SModalInitDocumentProps {
  id: number;
  name: string;
  description: string;
}
