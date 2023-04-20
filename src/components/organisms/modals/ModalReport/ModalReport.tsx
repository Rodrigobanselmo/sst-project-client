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
import dayjs from 'dayjs';

import { clinicExamCloseToExpire } from 'core/constants/brand.constant copy';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useRegisterModal } from 'core/hooks/useRegisterModal';
import {
  IReportBase,
  ReportTypeEnum,
} from 'core/services/hooks/mutations/reports/useMutReport/types';
import { useMutReport } from 'core/services/hooks/mutations/reports/useMutReport/useMutReport';
import { dateToString } from 'core/utils/date/date-format';
import clone from 'clone';

export const initialReportState = {
  title: 'Gerar Relatório',
  subtitle: '',
  isDefault: false,
  report: undefined as undefined | IReportJson['reports'][0],
  onCloseWithoutSelect: () => {},
};

export const ModalReport: FC = () => {
  const { registerModal, getModalData } = useRegisterModal();
  const { onCloseModal } = useModal();
  const [data, setData] = useState(initialReportState);
  const { addFilter, ...filterProps } = useFilterTable();
  const reportMutation = useMutReport();

  const report = data.report;

  useEffect(() => {
    const initialData = getModalData(
      ModalEnum.MODAL_REPORT,
    ) as typeof initialReportState;

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

  useEffect(() => {
    if (data.report && !data.isDefault) {
      if (data.report?.type === ReportTypeEnum.CLOSE_EXPIRED_EXAM)
        addFilter(FilterFieldEnum.LTE_EXPIRED_EXAM, {
          data: dayjs().add(clinicExamCloseToExpire, 'day').toDate(),
          getId: (v) => v.toISOString(),
          getName: (v) => dateToString(v),
        });

      if (data.report?.type === ReportTypeEnum.DONE_EXAM) {
        addFilter(FilterFieldEnum.START_DATE, {
          data: dayjs().set('date', 1).toDate(),
          getId: (v) => v.toISOString(),
          getName: (v) => dateToString(v),
        });
        addFilter(FilterFieldEnum.END_DATE, {
          data: dayjs().toDate(),
          getId: (v) => v.toISOString(),
          getName: (v) => dateToString(v),
        });
      }

      setData((dta) => ({ ...dta, isDefault: true }));
    }
  }, [addFilter, data]);

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
    const submitData: any = filterProps.filtersQuery;
    submitData.type = data.report?.type || ReportTypeEnum.CLINICS;

    const uniqueField = [
      FilterFieldEnum.DOWNLOAD_TYPE,
      FilterFieldEnum.START_DATE,
      FilterFieldEnum.END_DATE,
      FilterFieldEnum.LTE_EXPIRED_EXAM,
    ];

    uniqueField.forEach((field) => {
      if (filterProps.filtersQuery[field])
        submitData[field] = filterProps.filtersQuery[field]?.[0];
    });

    reportMutation
      .mutateAsync(submitData)
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

  const filters = report?.ask ? clone(report?.ask || []) : [];
  if (Array.isArray(filters)) {
    filters.push(FilterFieldEnum.DOWNLOAD_TYPE);
  } else {
    filters.fields.push(FilterFieldEnum.DOWNLOAD_TYPE);
  }

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
              filters,
              ...filterProps,
              addFilter,
            }}
          />
        </Box>
        <FilterTagList mt={10} filterProps={{ ...filterProps, addFilter }} />

        <SModalButtons
          loading={reportMutation?.isLoading}
          onClose={onCloseNoSelect}
          buttons={buttons}
        />
      </SModalPaper>
    </SModal>
  );
};
