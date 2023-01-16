import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { useDebouncedCallback } from 'use-debounce';

import { useQueryCities } from 'core/services/hooks/queries/useQueryCities/useQueryCities';

import { ICitiesSelectProps } from './types';

export const EsocialCitiesSelect: FC<ICitiesSelectProps> = ({
  onChange,
  inputProps,
  addressCompany,
  ...props
}) => {
  const [search, setSearch] = useState('');

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: tables, isLoading: loadTables } = useQueryCities(
    1,
    { search, addressCompany },
    20,
  );

  return (
    <AutocompleteForm
      getOptionLabel={(option) =>
        option?.name
          ? `${option.name} - ${option?.ufCode || option?.uf?.uf || ''}`
          : ''
      }
      options={tables}
      loading={loadTables}
      onInputChange={(e, v) => handleSearchChange(v)}
      filterOptions={(e) => e}
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
          {option?.name
            ? `${option.name} - ${option?.ufCode || option?.uf?.uf || ''}`
            : ''}
        </Box>
      )}
    />
  );
};
