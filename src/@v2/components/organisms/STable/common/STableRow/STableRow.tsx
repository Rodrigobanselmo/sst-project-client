/* eslint-disable react/no-children-prop */
import { FC } from 'react';

import { BoxProps } from '@mui/material';

import { STSTableRow } from './STableRow.styles';
import { ITableRowStatus } from './STableRow.types';

export const STableRow: FC<
  { children?: any } & BoxProps & {
      clickable?: boolean;
      status?: ITableRowStatus;
      schema?: 'normal' | 'grey';
    }
> = ({ className, clickable, ...props }) => (
  <STSTableRow
    clickable={clickable ? 1 : 0}
    px={6}
    py={2}
    display="grid"
    className={'table_grid ' + className}
    {...props}
  />
);
