import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { useDebouncedCallback } from 'use-debounce';

import { useQueryEsocial13Body } from 'core/services/hooks/queries/useQueryEsocial13Body/useQueryEsocial13Body';

import { IEsocialTable13SelectProps } from './types';

export const Esocial13BodySelect: FC<
  { children?: any } & IEsocialTable13SelectProps
> = ({ onChange, inputProps, ...props }) => {
  const { data: tables, isLoading: loadTables } = useQueryEsocial13Body(1);

  return (
    <AutocompleteForm
      getOptionLabel={(option) =>
        (typeof option != 'string' && option.desc) || ''
      }
      options={tables}
      loading={loadTables}
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
