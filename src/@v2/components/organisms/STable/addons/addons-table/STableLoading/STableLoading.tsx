import React, { FC } from 'react';

import { Skeleton } from '@mui/material';
import SFlex from 'components/atoms/SFlex';

import { STableHeader } from '../../../common/STableHeader/STableHeader';
import { STableLoadingProps } from './STableLoading.types';
import { STable } from '../../../common/STable/STable';
import { STableHRow } from '../../../common/STableHRow/STableHRow';

export function STableLoading({ limit, table }: STableLoadingProps) {
  return (
    <STable
      data={[1, 2, 3, 4, 5, 6, 7, 8]}
      table={table}
      limit={limit}
      renderHeader={(header) => (
        <STableHeader>
          {header.map((item, index) => {
            return (
              <STableHRow display="flex" key={index}>
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
      )}
      renderBody={({ data }) => (
        <SFlex gap={5} direction="column">
          {data.map((_, index) => {
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
      )}
    ></STable>
  );
}
