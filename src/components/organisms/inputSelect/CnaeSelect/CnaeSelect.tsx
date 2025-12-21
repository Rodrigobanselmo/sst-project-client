import React, { FC, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { InputForm } from 'components/molecules/form/input';
import { useDebouncedCallback } from 'use-debounce';

import {
  useQueryCnaes,
  queryCnaes,
} from 'core/services/hooks/queries/useQueryCnaes/useQueryCnaes';
import { cnaeMask } from 'core/utils/masks/cnae.mask';

import { ICnaeSelectProps } from './types';

export const CnaeInputSelect: FC<{ children?: any } & ICnaeSelectProps> = ({
  onChange,
  control,
  data,
  setValue,
  ...props
}) => {
  const [search, setSearch] = useState('');

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: cnaes_, isLoading: loadCnaes } = useQueryCnaes(
    1,
    { search },
    20,
  );

  const cnaes = cnaes_ || [];

  if (data?.code) {
    const foundCnae = cnaes.find((cnae) => cnae.code === data.code);
    if (!foundCnae) {
      cnaes.push(data);
    }
  }

  // Query for CNAE data when riskDegree is missing
  useEffect(() => {
    const shouldQueryCnae = !!(
      data?.code &&
      (!data?.riskDegree || data?.riskDegree === '')
    );

    if (shouldQueryCnae) {
      const codeForQuery = data.code.replace(/\D/g, '');

      const fetchCnaeData = async () => {
        try {
          const result = await queryCnaes(
            { skip: 0, take: 1 },
            { code: codeForQuery },
          );

          if (result?.data && result.data.length > 0) {
            const foundCnae = result.data.find(
              (cnae) => cnae.code === data.code,
            );
            if (foundCnae && foundCnae.riskDegree) {
              const updatedCnae = {
                ...data,
                riskDegree: foundCnae.riskDegree,
              };
              // Update the form value to show the enhanced data
              onChange?.(updatedCnae);
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching CNAE data:', error);
        }
      };

      fetchCnaeData();
    }
  }, [data, onChange, setValue, props.name]);

  return (
    <SFlex flexWrap="wrap" gap={5}>
      <Box height={100} flex={8}>
        <AutocompleteForm
          unmountOnChangeDefault
          getOptionLabel={(option) =>
            (typeof option != 'string' && option.name) || ''
          }
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
          setValue={setValue}
          name="cnae_code"
          size="small"
          value={cnaeMask.mask(data?.code || '') || ''}
          uneditable
        />
      </Box>
      <Box flex={1}>
        <InputForm
          label="Grau de risco"
          setValue={setValue}
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
