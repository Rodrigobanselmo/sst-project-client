import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { initialExamState } from 'components/organisms/modals/ModalAddExam/hooks/useEditExams';
import { useDebouncedCallback } from 'use-debounce';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryExams } from 'core/services/hooks/queries/useQueryExams/useQueryExams';

import { IExamSelectProps } from './types';

const AddButton = (props: any) => {
  return (
    <SText
      fontSize="14px"
      color={'common.white'}
      onClick={(e) => {
        e.stopPropagation();
        props?.onAddExam();
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

export const ExamInputSelect: FC<IExamSelectProps> = ({
  onChange,
  inputProps,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const { onStackOpenModal } = useModal();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const { data: exams, isLoading: loadExams } = useQueryExams(
    1,
    { search },
    20,
  );

  const onAddExam = () => {
    onStackOpenModal(ModalEnum.EXAMS_ADD, {} as typeof initialExamState);
  };

  return (
    <AutocompleteForm
      getOptionLabel={(option) => option.name || ''}
      options={exams}
      loading={loadExams}
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
            onClick={onAddExam}
          />
          Nenhuma opção
        </SFlex>
      }
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {((exams[0] && option.id == exams[0].id) || !exams[0]) && (
            <AddButton onAddExam={onAddExam} />
          )}
          {option.name}
        </Box>
      )}
    />
  );
};
