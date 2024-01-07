import React, { FC, useState } from 'react';

import { Box, CircularProgress } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { useDebouncedCallback } from 'use-debounce';

import { useQueryCities } from 'core/services/hooks/queries/useQueryCities/useQueryCities';
import { useQueryDocumentModels } from 'core/services/hooks/queries/useQueryDocumentModels/useQueryDocumentModels';

import { IDocumentModelSelectProps } from './types';
import SText from 'components/atoms/SText';

export const DocumentModelSelect: FC<
  { children?: any } & IDocumentModelSelectProps
> = ({ onChange, inputProps, query, ...props }) => {
  const [search, setSearch] = useState('');

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: docModels, isLoading: loadTables } = useQueryDocumentModels(
    1,
    { search, ...query },
    20,
  );

  if (!docModels?.length)
    return (
      <>
        <SText fontSize={14} mb={5}>
          Selecionar Modelo dodocumento
        </SText>
        <CircularProgress color="primary" size={18} />
      </>
    );

  return (
    <AutocompleteForm
      getOptionLabel={(option) =>
        typeof option != 'string' && option?.name ? `${option.name}` : ''
      }
      options={docModels}
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
          {`${option.name} - ${option.type}`}
        </Box>
      )}
    />
  );
};
