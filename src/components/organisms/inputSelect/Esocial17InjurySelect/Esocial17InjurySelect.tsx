import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { useDebouncedCallback } from 'use-debounce';

import { useQueryEsocial17Injury } from 'core/services/hooks/queries/useQueryEsocial17Injury/useQueryEsocial17Injury';

import { IEsocialTable17SelectProps } from './types';

export const Esocial17InjurySelect: FC<
  { children?: any } & IEsocialTable17SelectProps
> = ({ onChange, inputProps, ...props }) => {
  const { data: tables, isLoading: loadTables } = useQueryEsocial17Injury(1);

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
          {`${option.desc}` || ''}
        </Box>
      )}
    />
  );
};
