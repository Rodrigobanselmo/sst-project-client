import React, { FC, MouseEvent, useMemo, useState } from 'react';

import { Icon } from '@mui/material';
import SIconButton from 'components/atoms/SIconButton';
import STooltip from 'components/atoms/STooltip';
import { initialExamState } from 'components/organisms/modals/ModalAddExam/hooks/useEditExams';
import { initialExamDataState } from 'components/organisms/modals/ModalEditExamRiskData/hooks/useEditExams';
import { StatusEnum } from 'project/enum/status.enum';
import { useDebouncedCallback } from 'use-debounce';

import EditIcon from 'assets/icons/SEditIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';

import { IdsEnum } from 'core/enums/ids.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { IExam } from 'core/interfaces/api/IExam';
import { useQueryExams } from 'core/services/hooks/queries/useQueryExams/useQueryExams';

import { STagSearchSelect } from '../../../molecules/STagSearchSelect';
import { IExamSelectProps } from './types';

export const ExamSelect: FC<IExamSelectProps> = ({
  large,
  handleSelect,
  text,
  multiple = true,
  selected,
  onlyExam = false,
  query,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQueryExams(
    1,
    { search, status: StatusEnum.ACTIVE, ...query },
    15,
  );
  const { onStackOpenModal } = useModal();

  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 300);

  const handleSelectExam = (options: IExam) => {
    if (onlyExam) {
      if (handleSelect) handleSelect(options);
      return;
    }

    if (options.id)
      onStackOpenModal(ModalEnum.EXAM_RISK_DATA, {
        onSubmit: handleSelect,
        ...options,
      } as Partial<typeof initialExamDataState>);
  };

  const handleEditExam = (e: MouseEvent<HTMLButtonElement>, option?: IExam) => {
    e.stopPropagation();

    if (option?.id)
      onStackOpenModal<Partial<typeof initialExamState>>(ModalEnum.EXAMS_ADD, {
        ...option,
      });
  };

  const handleAddExam = () => {
    const inputSelect = document.getElementById(
      IdsEnum.INPUT_MENU_SEARCH,
    ) as HTMLInputElement;

    const name = inputSelect?.value || '';

    onStackOpenModal<Partial<typeof initialExamState>>(ModalEnum.EXAMS_ADD, {
      name,
    });
  };

  const onCloseMenu = () => {
    setSearch('');
  };

  const options = useMemo(() => {
    return data.map((exam) => ({
      ...exam,
      name: exam.name,
      value: exam.id,
    }));
  }, [data]);

  const examLength = String(selected ? selected.length : 0);

  return (
    <STagSearchSelect
      options={options}
      icon={SExamIcon}
      onSearch={(value) => handleSearchChange(value)}
      multiple={multiple}
      additionalButton={handleAddExam}
      tooltipTitle={`${examLength} exames selecionados`}
      text={text ? text : examLength === '0' ? '' : examLength}
      keys={['name']}
      onClose={onCloseMenu}
      placeholder="pesquisar..."
      large={large}
      handleSelectMenu={handleSelectExam}
      selected={selected || []}
      loading={isLoading}
      endAdornment={(options: IExam | undefined) => {
        return (
          <STooltip enterDelay={1200} withWrapper title={'editar'}>
            <SIconButton
              onClick={(e) => handleEditExam(e, options)}
              sx={{ width: '2rem', height: '2rem' }}
            >
              <Icon
                sx={{ color: 'text.light', fontSize: '18px' }}
                component={EditIcon}
              />
            </SIconButton>
          </STooltip>
        );
      }}
      optionsFieldName={{ valueField: 'id', contentField: 'name' }}
      {...props}
    />
  );
};
