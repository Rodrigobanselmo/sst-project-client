import React, { FC, useEffect, useState } from 'react';

import { Box, Checkbox } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import { STableRow } from 'components/atoms/STable';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ProfessionalsTable } from 'components/organisms/tables/ProfessonalsTable/ProfessonalsTable';

import { ProfessionalFilterTypeEnum } from 'core/constants/maps/professionals-filter.map';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { IProfessional } from 'core/interfaces/api/IProfessional';
import {
  IQueryProfessionals,
  useQueryProfessionals,
} from 'core/services/hooks/queries/useQueryProfessionals';

export const initialProfessionalSelectState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (professional: IProfessional | IProfessional[]) => {},
  title: 'Selecione o Profissional',
  multiple: false,
  query: {} as IQueryProfessionals,
  selected: [] as IProfessional[],
  filter: ProfessionalFilterTypeEnum.ALL,
  onCloseWithoutSelect: () => {},
};

export const ModalSelectProfessional: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal, onOpenModal } = useModal();
  const { data: professional } = useQueryProfessionals();
  const [selectData, setSelectData] = useState(initialProfessionalSelectState);

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.PROFESSIONAL_SELECT,
    ) as typeof initialProfessionalSelectState;

    if (initialData) {
      setSelectData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        return newData;
      });
    }
  }, [getModalData]);

  const onCloseNoSelect = () => {
    selectData.onCloseWithoutSelect?.();
    onCloseModal(ModalEnum.PROFESSIONAL_SELECT);
  };

  const handleSelect = (professional?: IProfessional) => {
    if (selectData.multiple && professional) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter(
          (w) => w.id != professional.id,
        );

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [professional, ...oldData.selected] };
      });
      return;
    }
    onCloseModal(ModalEnum.PROFESSIONAL_SELECT);
    setSelectData(initialProfessionalSelectState);
    selectData.onSelect(professional || selectData.selected);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
        onCloseModal(ModalEnum.PROFESSIONAL_SELECT);
        selectData.onSelect(selectData.selected);
      },
    });
  }

  return (
    <SModal
      {...registerModal(ModalEnum.PROFESSIONAL_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper semiFullScreen center p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <SText mt={-4} mr={40}>
          {selectData.title}
        </SText>
        <Box mt={8}>
          <ProfessionalsTable
            {...(selectData.multiple
              ? { selectedData: selectData.selected }
              : {})}
            filterInitial={selectData.filter}
            query={selectData.query}
            onSelectData={handleSelect}
            rowsPerPage={6}
          />
        </Box>

        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
