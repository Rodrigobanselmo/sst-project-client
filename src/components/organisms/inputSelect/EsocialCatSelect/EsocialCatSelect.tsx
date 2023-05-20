import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { useDebouncedCallback } from 'use-debounce';

import { useQueryCats } from 'core/services/hooks/queries/useQueryCats/useQueryCats';
import { useQueryEsocial15Acid } from 'core/services/hooks/queries/useQueryEsocial15Acid/useQueryEsocial15Acid';
import { dateToString } from 'core/utils/date/date-format';

import { ICatSelectProps } from './types';

export const EsocialCatSelect: FC<{ children?: any } & ICatSelectProps> = ({
  onChange,
  inputProps,
  query,
  ...props
}) => {
  const [search, setSearch] = useState('');

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: tables, isLoading: loadTables } = useQueryCats(
    1,
    { ...query }, // { search },
    20,
  );

  return (
    <AutocompleteForm
      getOptionLabel={(option) =>
        typeof option != 'string' && option?.esocialSitGeradora?.desc
          ? `${dateToString(option.dtAcid)} ${
              option?.esocialSitGeradora?.desc || '-'
            }`
          : ''
      }
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
          {`${dateToString(option.dtAcid)} ${
            option?.esocialSitGeradora?.desc || '-'
          }` || ''}
        </Box>
      )}
    />
  );
};
