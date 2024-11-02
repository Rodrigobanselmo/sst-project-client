import React, { FC } from 'react';

import { Skeleton } from '@mui/material';

import { STableHeader } from '../../../common/STableHeader/STableHeader';
import { STableLoadingProps } from './STableLoading.types';
import { STable } from '../../../common/STable/STable';
import { STableHRow } from '../../../common/STableHRow/STableHRow';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';

export function STableLoading({ limit, table, onlyRows }: STableLoadingProps) {
  return (
    <STable
      data={[1, 2, 3, 4, 5, 6, 7, 8]}
      table={table}
      limit={limit}
      renderHeader={
        !onlyRows
          ? (header) => (
              <STableHeader>
                {header.map((item, index) => {
                  return (
                    <STableHRow boxProps={{ display: 'flex' }} key={index}>
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
            )
          : () => null
      }
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
