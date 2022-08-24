import React, { FC, useState } from 'react';

import { Box } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { AutocompleteForm } from 'components/molecules/form/autocomplete';
import { initialExamState } from 'components/organisms/modals/ModalAddExam/hooks/useEditExams';
import { StatusEnum } from 'project/enum/status.enum';
import { useDebouncedCallback } from 'use-debounce';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useQueryExams } from 'core/services/hooks/queries/useQueryExams/useQueryExams';

import { AddButton } from '../components/AddButton';
import { IExamSelectProps } from './types';

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
    { search, status: StatusEnum.ACTIVE },
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
            <AddButton onAdd={onAddExam} />
          )}
          {option.name}
        </Box>
      )}
    />
  );
};

{
  /* <ExamSelect
          color="success"
          sx={{ maxWidth: 0, opacity: 0, transform: 'translate(-40px, 10px)' }}
          id={IdsEnum.EXAMS_SELECT}
          onlyExam
          asyncLoad
          text={'adicionar'}
          tooltipTitle=""
          multiple={false}
          handleSelect={(options: IExam) => {
            if (options?.id) console.log(options);
          }}
        /> */
}
