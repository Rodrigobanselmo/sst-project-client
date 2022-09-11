import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { initialProfessionalState } from 'components/organisms/modals/ModalAddProfessional/hooks/useEditProfessionals';
import {
  getCouncil,
  getCredential,
} from 'components/organisms/tables/ProfessonalsTable/ProfessonalsTable';
import { useSnackbar } from 'notistack';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { useDebouncedCallback } from 'use-debounce';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryProfessionals } from 'core/services/hooks/queries/useQueryProfessionals';

import { IProfessionalSelectProps } from './types';

const AddButton = (props: any) => {
  return (
    <SText
      fontSize="14px"
      color={'common.white'}
      onClick={(e) => {
        e.stopPropagation();
        props?.onAddProfessional();
      }}
      sx={{
        position: 'absolute',
        textAlign: 'center',
        verticalAlign: 'middle',
        borderRadius: '50%',
        cursor: 'pointer',
        bottom: 10,
        right: 10,
        height: 20,
        width: 20,
        backgroundColor: 'success.main',
        '&:hover': {
          backgroundColor: 'success.dark',
        },
      }}
    >
      +
    </SText>
  );
};

export const ProfessionalInputSelect: FC<IProfessionalSelectProps> = ({
  onChange,
  type = [ProfessionalTypeEnum.DOCTOR],
  inputProps,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const { onStackOpenModal } = useModal();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: professionals, isLoading: loadProfessionals } =
    useQueryProfessionals(1, { search, type }, 20);

  const onAddProfessional = () => {
    onStackOpenModal(
      ModalEnum.PROFESSIONALS_ADD,
      {} as typeof initialProfessionalState,
    );
  };

  return (
    <AutocompleteForm
      getOptionLabel={(option) => option.name || ''}
      options={professionals}
      loading={loadProfessionals}
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
      noOptionsText={
        <SFlex gap={8}>
          <STagButton
            text="Adicionar"
            active
            bg="success.main"
            onClick={onAddProfessional}
          />
          Nenhuma opção
        </SFlex>
      }
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {((professionals[0] && option.id == professionals[0].id) ||
            !professionals[0]) && (
            <AddButton onAddProfessional={onAddProfessional} />
          )}
          {option.name} - {getCouncil(option)}/{getCredential(option)}
        </Box>
      )}
    />
  );
};
