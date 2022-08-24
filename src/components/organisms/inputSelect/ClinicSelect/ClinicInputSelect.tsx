import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { initialClinicState } from 'components/organisms/modals/company/ModalEditClinic/hooks/useEditCompany';
import { useDebouncedCallback } from 'use-debounce';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IAddress } from 'core/interfaces/api/ICompany';
import { useQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';
import { cepMask } from 'core/utils/masks/cep.mask';

import { AddButton } from '../components/AddButton';
import { IClinicSelectProps } from './types';

export const ClinicInputSelect: FC<IClinicSelectProps> = ({
  onChange,
  inputProps,
  query,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const { onStackOpenModal } = useModal();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  // const { data: exams, isLoading: loadExams } = useQueryExams(
  //   1,
  //   { search },
  //   20,
  // );

  const { companies, isLoading } = useQueryCompanies(
    1,
    { search, isClinic: true, ...query },
    50,
  );

  const onAddClinic = () => {
    onStackOpenModal(ModalEnum.CLINIC_EDIT, {} as typeof initialClinicState);
  };

  const getAddress = (address?: IAddress) => {
    if (!address) return '';
    return `${address.street}, ${address.number} - ${address.neighborhood} ${address.complement}`;
  };
  const getAddressCity = (address?: IAddress) => {
    if (!address) return '';
    return `${address.city} - ${address.state}, ${cepMask.mask(address.cep)}`;
  };

  return (
    <AutocompleteForm
      getOptionLabel={(option) => option.fantasy || ''}
      options={companies}
      loading={isLoading}
      inputProps={{
        onChange: (e) => handleSearchChange(e.target.value),
        onBlur: () => setSearch(''),
        ...inputProps,
      }}
      onChange={(value) => {
        onChange?.(value);
        setSearch('');
      }}
      {...props}
      noOptionsText={
        <SFlex gap={8}>
          <STagButton
            text="Adicionar"
            active
            bg="success.main"
            onClick={onAddClinic}
          />
          Nenhuma opção
        </SFlex>
      }
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {((companies[0] && option.id == companies[0].id) ||
            !companies[0]) && <AddButton onAdd={onAddClinic} />}
          <Box>
            <SText fontSize={13} fontWeight="500">
              {option.fantasy}
            </SText>
            <SText fontSize={10}>{getAddressCity(option?.address)}</SText>
            <SText fontSize={10}>{getAddress(option?.address)} </SText>
          </Box>
        </Box>
      )}
    />
  );
};
