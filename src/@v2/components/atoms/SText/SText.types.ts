import { TypographyProps } from '@mui/material/Typography';

export interface STextProps extends TypographyProps {
  noBreak?: boolean;
  component?: React.ElementType;
  lineNumber?: number;
  ft?: string | number;
}
