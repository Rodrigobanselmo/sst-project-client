import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { useDebouncedCallback } from 'use-debounce';

import { useQueryEsocial14And15Acid } from 'core/services/hooks/queries/useQueryEsocial14And15Acid/useQueryEsocial14And15Acid';

import { IEsocialTable15SelectProps } from './types';

export const Esocial14And15AcidSelect: FC<
  { children?: any } & IEsocialTable15SelectProps
> = ({ onChange, inputProps, ...props }) => {
  const { data: tables, isLoading: loadTables } = useQueryEsocial14And15Acid(1);

  return (
    <AutocompleteForm
      getOptionLabel={(option) =>
        (typeof option != 'string' && option.desc) || ''
      }
      options={tables}
      loading={loadTables}
      // filterOptions={(e) => e}
      inputProps={{
        ...inputProps,
      }}
      onChange={(value) => {
        onChange?.(value);
      }}
      {...props}
      noOptionsText={<SFlex gap={8}>Nenhuma opção</SFlex>}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {/* {((cids[0] && option.id == cids[0].id) || !cids[0]) && (
            <AddButton onAdd={onAddCid} />
          )} */}
          {`${option.desc}` || ''}
        </Box>
      )}
    />
  );
};
