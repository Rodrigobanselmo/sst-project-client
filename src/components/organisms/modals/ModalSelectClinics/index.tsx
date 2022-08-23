import React, { FC, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ClinicsTable } from 'components/organisms/tables/ClinicsTable/ClinicsTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import { ICompany as IClinic } from 'core/interfaces/api/ICompany';
import {
  IQueryCompanies,
  IQueryCompaniesTypes,
} from 'core/services/hooks/queries/useQueryCompanies';

const modalName = ModalEnum.CLINIC_SELECT;

export const initialClinicSelectState = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect: (clinic: IClinic | IClinic[]) => {},
  title: 'Selecione a empresa',
  multiple: false,
  selected: [] as IClinic[],
  query: {} as IQueryCompanies,
  onCloseWithoutSelect: () => {},
  type: '' as IQueryCompaniesTypes,
};

export const ModalSelectClinic: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [selectData, setSelectData] = useState(initialClinicSelectState);

  useEffect(() => {
    const initialData = getModalData(
      modalName,
    ) as typeof initialClinicSelectState;

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
    setSelectData(initialClinicSelectState);
    selectData.onCloseWithoutSelect?.();
    onCloseModal(modalName);
  };

  const handleSelect = (clinic?: IClinic) => {
    if (selectData.multiple && clinic) {
      setSelectData((oldData) => {
        const filtered = oldData.selected.filter((w) => w.id != clinic.id);

        if (filtered.length !== oldData.selected.length)
          return { ...oldData, selected: filtered };

        return { ...oldData, selected: [clinic, ...oldData.selected] };
      });
      return;
    }
    onCloseModal(modalName);
    setSelectData(initialClinicSelectState);
    selectData.onSelect(clinic || selectData.selected);
  };

  const buttons = [{}] as IModalButton[];

  if (selectData.multiple) {
    buttons.push({
      onClick: () => {
        setSelectData(initialClinicSelectState);
        onCloseModal(modalName);
        selectData.onSelect(selectData.selected);
      },
    });
  }

  return (
    <SModal
      {...registerModal(modalName)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper semiFullScreen center p={8}>
        <SModalHeader tag={'select'} onClose={onCloseNoSelect} title=" " />

        <SText>{selectData.title}</SText>
        <Box minWidth={['100%', 600, 800]} mt={8}>
          <ClinicsTable
            {...(selectData.multiple
              ? { selectedData: selectData.selected.map((s) => s.id) }
              : {})}
            query={selectData.query}
            onSelectData={handleSelect}
            rowsPerPage={6}
            type={selectData.type}
          />
        </Box>
        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
