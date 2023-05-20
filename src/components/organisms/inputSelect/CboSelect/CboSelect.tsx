import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { useDebouncedCallback } from 'use-debounce';

import { useQueryCbo } from 'core/services/hooks/queries/useQueryCbo/useQueryCbo';

import { ICboSelectProps } from './types';

export const CboSelect: FC<{ children?: any } & ICboSelectProps> = ({
  onChange,
  inputProps,
  ...props
}) => {
  const [search, setSearch] = useState('');

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: tables, isLoading: loadTables } = useQueryCbo(
    1,
    { search },
    20,
  );

  return (
    <AutocompleteForm
      getOptionLabel={(option) =>
        typeof option != 'string' && option.code
          ? `${option.code.substring(0, 4)}-${option.code.substring(4, 6)}`
          : ''
      }
      options={tables}
      loading={loadTables}
      onInputChange={(e, v) => handleSearchChange(v)}
      filterOptions={(e) => e}
      inputProps={{
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
        <Box fontFamily={'sans-serif'} component="li" {...props}>
          {`${option.code.substring(0, 4)}-${option.code.substring(4, 6)} - ${
            option.desc
          }` || ''}
        </Box>
      )}
    />
  );
};
