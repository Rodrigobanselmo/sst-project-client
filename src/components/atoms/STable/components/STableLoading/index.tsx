import React, { FC } from 'react';

import { Skeleton } from '@mui/material';
import SFlex from 'components/atoms/SFlex';

import { STable, STableHeader, STableHRow } from '../..';
import { STableLoadingProps } from './types';

const STableLoading: FC<STableLoadingProps> = ({ ...props }) => (
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
      {[0, 1, 2, 3, 4].map((item) => {
        return (
          <Skeleton
            key={item}
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

export default STableLoading;