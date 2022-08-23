import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { initialClinicState } from 'components/organisms/modals/company/ModalEditClinic/hooks/useEditCompany';
import { useDebouncedCallback } from 'use-debounce';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryCompanies } from 'core/services/hooks/queries/useQueryCompanies';

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

  const { companies, count, isLoading } = useQueryCompanies(
    1,
    { search, isClinic: true, ...query },
    20,
  );

  const onAddClinic = () => {
    onStackOpenModal(ModalEnum.CLINIC_EDIT, {} as typeof initialClinicState);
  };

  return (
    <AutocompleteForm
      getOptionLabel={(option) => option.name || ''}
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
          {option.name}
        </Box>
      )}
    />
  );
};
