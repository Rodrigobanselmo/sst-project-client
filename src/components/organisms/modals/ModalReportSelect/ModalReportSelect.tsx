/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useEffect, useState } from 'react';

import { Box } from '@mui/material';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { ReportAccordion } from 'components/organisms/accordions/ReportAccordion/ReportAccordion';
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { ModalAddUsers } from 'components/organisms/modals/ModalAddUsers';
import { ModalSelectAccessGroups } from 'components/organisms/modals/ModalSelectAccessGroup';
import { UsersTable } from 'components/organisms/tables/UsersTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';

export const initialReportSelectState = {
  title: 'Relatórios',
  onSelect: (d: any) => {},
  onCloseWithoutSelect: () => {},
};

export const ModalReportSelect: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [data, setData] = useState(initialReportSelectState);

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.REPORT_SELECT,
    ) as typeof initialReportSelectState;

    // eslint-disable-next-line prettier/prettier
    if (
      initialData &&
      Object.keys(initialData)?.length &&
      !(initialData as any).passBack
    ) {
      setData((oldData) => {
        const newData = {
          ...oldData,
          ...initialData,
        };

        return newData;
      });
    }
  }, [getModalData]);

  const onClose = () => {
    onCloseModal(ModalEnum.REPORT_SELECT);
    setData(initialReportSelectState);
  };

  const onCloseNoSelect = () => {
    data.onCloseWithoutSelect?.();
    onClose();
  };

  const onSubmit = () => {
    data.onSelect?.(data);
    onClose();
  };

  const buttons = [
    {
      variant: 'outlined',
      text: 'Calcelar',
      onClick: () => onCloseNoSelect(),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.REPORT_SELECT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper
        sx={{
          backgroundColor: 'grey.200',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: ['100%', '100%', 600],
        }}
        center
        p={8}
      >
        <SModalHeader onClose={onCloseNoSelect} title={data.title || ' '} />

        <ReportAccordion />

        <SModalButtons onClose={onCloseNoSelect} buttons={buttons} />
      </SModalPaper>
    </SModal>
  );
};
