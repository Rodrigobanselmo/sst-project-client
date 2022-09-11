import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { useDebouncedCallback } from 'use-debounce';

import { useQueryCnaes } from 'core/services/hooks/queries/useQueryCnaes/useQueryCnaes';
import { cnaeMask } from 'core/utils/masks/cnae.mask';

import { ICnaeSelectProps } from './types';

export const CnaeInputSelect: FC<ICnaeSelectProps> = ({
  onChange,
  control,
  data,
  ...props
}) => {
  const [search, setSearch] = useState('');

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: cnaes, isLoading: loadCnaes } = useQueryCnaes(
    1,
    { search },
    20,
  );

  return (
    <SFlex flexWrap="wrap" gap={5}>
      <Box height={100} flex={8}>
        <AutocompleteForm
          getOptionLabel={(option) => option.name}
          options={cnaes}
          loading={loadCnaes}
          filterOptions={(e) => e}
          inputProps={{
            onBlur: () => setSearch(''),
            labelPosition: 'top',
            placeholder: 'Pesquisar por CNAE ou Atividade',
          }}
          control={control}
          onChange={(value) => {
            onChange?.(value);
            setSearch('');
          }}
          onInputChange={(e, v) => handleSearchChange(v)}
          {...props}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <span style={{ minWidth: 90 }}>{cnaeMask.mask(option.code)}</span>
              {option.name}
            </Box>
          )}
        />{' '}
      </Box>
      <Box flex={1}>
        <InputForm
          label="Código"
          control={control}
          sx={{ minWidth: 120 }}
          name="cnae_code"
          size="small"
          value={cnaeMask.mask(data?.code || '') || ''}
          uneditable
        />
      </Box>
      <Box flex={1}>
        <InputForm
          label="Grau de risco"
          control={control}
          sx={{ minWidth: 100 }}
          name="cnae_code"
          size="small"
          value={data?.riskDegree || '-'}
          uneditable
        />
      </Box>
    </SFlex>
  );
};
