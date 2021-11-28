import { ReactNode } from 'react';

import { BoxProps } from '@mui/material';

export interface INavSectionProps extends BoxProps {
  title: string;
  children: ReactNode;
}
