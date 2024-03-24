import React, { FC, useCallback, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { initialClinicState } from 'components/organisms/modals/company/ModalEditClinic/hooks/useEditClinic';
import { useDebouncedCallback } from 'use-debounce';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IAddress } from 'core/interfaces/api/ICompany';
import {
  queryCompanies,
  useFetchQueryCompanies,
  useQueryCompanies,
} from 'core/services/hooks/queries/useQueryCompanies';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { cepMask } from 'core/utils/masks/cep.mask';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import { AddButton } from '../components/AddButton';
import { ICompanyInputSelect } from './types';

export const CompanyInputSelect: FC<
  { children?: any } & ICompanyInputSelect
> = ({
  onChange,
  inputProps,
  query,
  addMore = false,
  withDefaultCompany,
  defaultValue,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const { onStackOpenModal } = useModal();
  const { fetchCompanies, companyId } = useFetchQueryCompanies();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { companies, isLoading } = useQueryCompanies(
    1,
    { search, ...query },
    12,
  );

  const onAddClinic = () => {
    onStackOpenModal(ModalEnum.CLINIC_EDIT, {} as typeof initialClinicState);
  };

  const handleCompanyAsync = useCallback(async () => {
    if (defaultValue && (defaultValue as any)?.id) return;
    if (!withDefaultCompany) return;
    const id =
      typeof withDefaultCompany === 'string' ? withDefaultCompany : companyId;
    if (!id) return;

    const companyData = await fetchCompanies(1, { companiesIds: [id] }, 1);

    if (companyData && companyData.data && companyData.data[0]) {
      if (!companyData.data[0]?.isConsulting) onChange?.(companyData.data[0]);
    }
  }, [companyId, defaultValue, fetchCompanies, onChange, withDefaultCompany]);

  useEffect(() => {
    handleCompanyAsync();
  }, [handleCompanyAsync]);

  return (
    <AutocompleteForm
      getOptionLabel={(option) =>
        (typeof option != 'string' && (option.fantasy || option.name)) || ''
      }
      options={companies}
      loading={isLoading}
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
      defaultValue={defaultValue}
      noOptionsText={
        <SFlex gap={8}>
          {addMore && (
            <STagButton
              text="Adicionar"
              active
              bg="success.main"
              onClick={onAddClinic}
            />
          )}
          Nenhuma opção
        </SFlex>
      }
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {addMore &&
            ((companies[0] && option.id == companies[0].id) ||
              !companies[0]) && <AddButton onAdd={onAddClinic} />}
          <Box>
            <SText fontSize={13} fontWeight="500">
              {getCompanyName(option)}
            </SText>
            <SText fontSize={10}>{option.name}</SText>
            <SText fontSize={10}>{cnpjMask.mask(option.cnpj)} </SText>
          </Box>
        </Box>
      )}
    />
  );
};
