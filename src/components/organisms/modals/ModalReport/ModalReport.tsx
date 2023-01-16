/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { FC, useEffect, useState } from 'react';
import { UseMutationResult } from 'react-query';

import { Box } from '@mui/material';
import { FilterFieldEnum } from 'components/atoms/STable/components/STableFilter/constants/filter.map';
import { FilterTagList } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTagList';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import { STableFilterBox } from 'components/atoms/STable/components/STableFilter/STableFilterBox/STableFilterBox';
import SText from 'components/atoms/SText';
import SModal, {
  SModalButtons,
  SModalHeader,
  SModalPaper,
} from 'components/molecules/SModal';
import { IModalButton } from 'components/molecules/SModal/components/SModalButtons/types';
import { IReportJson } from 'components/organisms/accordions/ReportAccordion/report.constants';
import { ModalAddAccessGroup } from 'components/organisms/modals/ModalAddAccessGroup';
import { ModalAddUsers } from 'components/organisms/modals/ModalAddUsers';
import { ModalSelectAccessGroups } from 'components/organisms/modals/ModalSelectAccessGroup';
import { UsersTable } from 'components/organisms/tables/UsersTable';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  IReportClinic,
  useMutReportClinic,
} from 'core/services/hooks/mutations/reports/useMutReportClinic/useMutReportClinic';

export const initialReportState = {
  title: 'Gerar Relatório',
  subtitle: '',
  report: undefined as undefined | IReportJson['reports'][0],
  onCloseWithoutSelect: () => {},
};

export const ModalReport: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [data, setData] = useState(initialReportState);
  const filterProps = useFilterTable();
  const clinicMutation = useMutReportClinic();

  const report = data.report;

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.MODAL_REPORT,
    ) as typeof initialReportState;

    if (initialData && !(initialData as any).passBack) {
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
    onCloseModal(ModalEnum.MODAL_REPORT);
    setData(initialReportState);
    filterProps.clearFilter();
  };

  const onCloseNoSelect = () => {
    data.onCloseWithoutSelect?.();
    onClose();
  };

  const onSubmit = async () => {
    const submitData = filterProps.filtersQuery;
    submitData[FilterFieldEnum.DOWLOAD_TYPE] =
      filterProps.filtersQuery[FilterFieldEnum.DOWLOAD_TYPE]?.[0];

    clinicMutation
      .mutateAsync(submitData as IReportClinic)
      .then(() => {
        onClose();
      })
      .catch(() => null);
  };

  const buttons = [
    {
      variant: 'outlined',
      text: 'Calcelar',
      onClick: () => onCloseNoSelect(),
    },
    {
      text: 'Confirmar',
      variant: 'contained',
      onClick: () => onSubmit(),
    },
  ] as IModalButton[];

  return (
    <SModal
      {...registerModal(ModalEnum.MODAL_REPORT)}
      keepMounted={false}
      onClose={onCloseNoSelect}
    >
      <SModalPaper
        sx={{
          backgroundColor: 'grey.200',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        minWidth={['100%', '100%', '500px']}
        width={['100%', '100%', '500px']}
        // semiFullScreen
        center
        p={8}
      >
        <SModalHeader
          subtitle={data.subtitle}
          onClose={onCloseNoSelect}
          title={data.title || ' '}
        />

        <Box maxHeight={500} minHeight={200}>
          <STableFilterBox
            mt={8}
            filterProps={{
              filters: [
                ...(report ? report.ask : ([] as any)),
                FilterFieldEnum.DOWLOAD_TYPE,
              ],
              ...filterProps,
            }}
          />
        </Box>
        <FilterTagList mt={10} filterProps={filterProps} />

        <SModalButtons
          loading={clinicMutation?.isLoading}
          onClose={onCloseNoSelect}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
