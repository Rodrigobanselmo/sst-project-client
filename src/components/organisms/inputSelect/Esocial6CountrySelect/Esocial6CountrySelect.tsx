import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { useDebouncedCallback } from 'use-debounce';

import { useQueryEsocial6Country } from 'core/services/hooks/queries/useQueryEsocial6Country/useQueryEsocial6Country';

import { IEsocialTable6SelectProps } from './types';

export const Esocial6CountrySelect: FC<IEsocialTable6SelectProps> = ({
  onChange,
  inputProps,
  ...props
}) => {
  const [search, setSearch] = useState('');

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: tables, isLoading: loadTables } = useQueryEsocial6Country(
    1,
    { search },
    20,
  );

  return (
    <AutocompleteForm
      getOptionLabel={(option) => option.name || ''}
      options={tables}
      loading={loadTables}
      onInputChange={(e, v) => handleSearchChange(v)}
      // filterOptions={(e) => e}
      inputProps={{
        onBlur: () => setSearch(''),
        onFocus: () => setSearch(''),
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
          {`${option.name}` || ''}
        </Box>
      )}
    />
  );
};
