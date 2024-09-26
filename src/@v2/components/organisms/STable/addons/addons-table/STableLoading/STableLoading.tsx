import React, { FC } from 'react';

import { Skeleton } from '@mui/material';
import SFlex from 'components/atoms/SFlex';

import { STableHeader } from '../../../common/STableHeader/STableHeader';
import { STableLoadingProps } from './STableLoading.types';
import { STable } from '../../../common/STable/STable';
import { STableHRow } from '../../../common/STableHRow/STableHRow';

export const STableLoading: FC<STableLoadingProps> = ({
  rowsNumber = 5,
  ...props
}) => (
  <STable loading={false} columns="1fr 1fr 1fr 1fr 1fr" {...props}>
    <STableHeader>
      {[0, 1, 2, 3, 4].map((item) => {
        return (
          <STableHRow display="flex" justifyContent="center" key={item}>
            <Skeleton
              variant="rectangular"
              width={'60%'}
              height={25}
              sx={{ borderRadius: 5 }}
            />
          </STableHRow>
        );
      })}
    </STableHeader>
    <SFlex gap={5} direction="column">
      {Array.from({ length: rowsNumber }).map((item, index) => {
        return (
          <Skeleton
            key={index}
            variant="rectangular"
            width={'100%'}
            height={50}
            sx={{ borderRadius: 1 }}
          />
        );
      })}
    </SFlex>
  </STable>
);
