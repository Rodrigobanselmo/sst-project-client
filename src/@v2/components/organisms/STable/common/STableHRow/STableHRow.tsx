import { FC } from 'react';

import { BoxProps } from '@mui/material';
import { STSTableHRow } from './STableHRow.styles';

export const STableHRow: FC<BoxProps> = ({ ...props }) => (
  <STSTableHRow fontSize={13} {...props} />
);
