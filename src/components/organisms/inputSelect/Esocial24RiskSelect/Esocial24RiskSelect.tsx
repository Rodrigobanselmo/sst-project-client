import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { useDebouncedCallback } from 'use-debounce';

import { useQueryEsocial24Risk } from 'core/services/hooks/queries/useQueryEsocial24Risk/useQueryEsocial24Risk';

import { IEsocialTable24SelectProps } from './types';

export const Esocial24RiskSelect: FC<IEsocialTable24SelectProps> = ({
  onChange,
  inputProps,
  type,
  ...props
}) => {
  const [search, setSearch] = useState('');

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: tables, isLoading: loadTables } = useQueryEsocial24Risk(
    1,
    { type, search },
    20,
  );

  return (
    <AutocompleteForm
      getOptionLabel={(option) =>
        (typeof option != 'string' && `(${option.id}) ${option.name}`) || ''
      }
      options={tables}
      loading={loadTables}
      onInputChange={(e, v) => handleSearchChange(v)}
      // filterOptions={(e) => e}
      inputProps={{
        onFocus: () => setSearch(''),
        onBlur: () => setSearch(''),
        ...inputProps,
      }}
      onChange={(value) => {
        onChange?.(value);
        setSearch('');
      }}
      {...props}
      noOptionsText={<SFlex gap={8}>Nenhuma opção</SFlex>}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {/* {((cids[0] && option.id == cids[0].id) || !cids[0]) && (
            <AddButton onAdd={onAddCid} />
          )} */}
          {`(${option.id}) ${option.name}` || ''}
        </Box>
      )}
    />
  );
};
