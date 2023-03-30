import { FC, useMemo, useState } from 'react';

import { Box, BoxProps } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import {
  ITableRowStatus,
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import { TextCompanyRow } from 'components/atoms/STable/components/Rows/TextCompanyRow';
import { TextEmployeeRow } from 'components/atoms/STable/components/Rows/TextEmployeeRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { SIconDownloadExam } from 'components/molecules/SIconDownloadExam/SIconDownloadExam';
import { SIconUploadFile } from 'components/molecules/SIconUploadFile/SIconUploadFile';
import { initialExamScheduleState } from 'components/organisms/modals/ModalAddExamSchedule/hooks/useEditExamEmployee';
import { ModalEditEmployeeHisExamClinic } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/ModalEditEmployeeHisExamClinic';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { useRouter } from 'next/router';
import { employeeExamTypeMap } from 'project/enum/employee-exam-history-type.enum';
import { PermissionEnum } from 'project/enum/permission.enum';
import { StatusEnum } from 'project/enum/status.enum';

import SCalendarIcon from 'assets/icons/SCalendarIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';
import { SEditIcon } from 'assets/icons/SEditIcon';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';
import { useMutUpdateManyScheduleHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUpdateManyScheduleHisExam/useMutUpdateManyScheduleHisExam';
import { IQueryEmployeeHistHier } from 'core/services/hooks/queries/useQueryHisExamEmployee/useQueryHisExamEmployee';
import { useFetchQueryHisScheduleExamClinic } from 'core/services/hooks/queries/useQueryHisScheduleExamClinic/useQueryHisScheduleExamClinic';
import { useQueryHisScheduleExamCompany } from 'core/services/hooks/queries/useQueryHisScheduleExamCompany/useQueryHisScheduleExamCompany';
import { dateToString } from 'core/utils/date/date-format';

import { useScheduleExam } from './hooks/useScheduleExam';

export const HistoryScheduleExamCompanyTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IEmployeeExamsHistory) => void;
    hideTitle?: boolean;
    companyId?: string;
    employeeId?: number;
    employee?: IEmployee;
    query?: IQueryEmployeeHistHier;
  }
> = ({ rowsPerPage = 12, onSelectData, hideTitle, companyId, query }) => {
  const { search, page, setPage, handleSearchChange } = useTableSearchAsync();
  const { isAuthSuccess } = useAuthShow();

  const {
    data: historyExam,
    isLoading: loadQuery,
    count,
  } = useQueryHisScheduleExamCompany(
    page,
    {
      search,
      companyId,
      ...query,
    },
    rowsPerPage,
    companyId,
  );

  const updateMutation = useMutUpdateManyScheduleHisExam();
  const { fetchHisScheduleExam } = useFetchQueryHisScheduleExamClinic();

  const { onAdd, onReSchedule, onStackOpenModal } = useScheduleExam();

  // const onDownloadGuide = (companyId: string, employeeId: number) => {
  //   const path = RoutesEnum.PDF_GUIDE.replace(
  //     ':employeeId',
  //     String(employeeId),
  //   ).replace(':companyId', companyId);

  //   window.open(path, '_blank');
  // };

  const onEdit = async (data?: IEmployeeExamsHistory) => {
    if (
      !isAuthSuccess({
        permissions: [PermissionEnum.CLINIC_SCHEDULE, PermissionEnum.MASTER],
      })
    )
      return;

    if (data) {
      const employee = await fetchHisScheduleExam(
        {
          employeeId: data.employee?.id,
          examIsAvaliation: data.exam?.isAvaliation,
          notAfterDate: data.doneDate,
        },
        data.clinicId,
      );

      if (employee && employee.data && employee.data[0]) {
        onStackOpenModal(ModalEnum.EMPLOYEE_HISTORY_EXAM_EDIT_CLINIC, {
          ...employee.data[0],
          clinicId: data.clinicId,
        });
      }
    }
  };

  const onChangeStatus = (data?: Partial<IEmployeeExamsHistory>) => {
    if (data && data.id && data.employeeId) {
      updateMutation.mutateAsync({
        isClinic: true,
        data: [{ employeeId: data.employeeId, id: data.id, ...data }],
      });
    }
  };

  const getRowColor = (status: StatusEnum): ITableRowStatus | undefined => {
    if (status === StatusEnum.DONE) return 'info';
    if (status === StatusEnum.EXPIRED) return 'inactive';
    if (status === StatusEnum.CANCELED) return 'inactive';
    return undefined;
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Data', column: '80px' },
    { text: 'Funcionário', column: 'minmax(150px, 1fr)' },
    { text: 'Empresa', column: '150px' },
    { text: 'Tipo', column: 'minmax(80px, 140px)' },
    { text: 'Exame', column: '120px' },
    { text: 'Status', column: '110px', justifyContent: 'center' },
    { text: '', column: '100px', justifyContent: 'end' },
    // { text: 'Reagendar', column: 'minmax(150px, 1fr)', justifyContent: 'center' },
    // { text: 'Guia', column: '80px', justifyContent: 'center' },
  ];

  return (
    <>
      {!hideTitle && (
        <>
          <STableTitle>Exames Agendados</STableTitle>
          <STableSearch
            onAddClick={onAdd}
            boxProps={{ sx: { flex: 1, maxWidth: 400 } }}
            addText="Agendar"
            placeholder="Pesquisar por nome, cpf, email, matrícula..."
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </>
      )}
      <STable
        loading={loadQuery}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ column, text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<typeof historyExam[0]>
          rowsData={historyExam}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            const options = statusOptionsConstantExam;
            options[StatusEnum.PROCESSING].color = 'info.main';

            const employee = row?.employee;
            const company = employee?.company;

            const disabled = ![
              StatusEnum.PROCESSING,
              StatusEnum.EXPIRED,
            ].includes(row.status);

            const isClinicExam = row.exam?.isAttendance;

            return (
              <STableRow
                key={row.id}
                clickable
                onClick={() => onEdit(row)}
                // status={getRowColor(row.status)}
              >
                <TextIconRow text={dateToString(row?.doneDate)} />
                <TextEmployeeRow employee={employee} />
                <TextCompanyRow company={company} />
                <TextIconRow
                  text={
                    row.examType
                      ? employeeExamTypeMap[row.examType]?.content
                      : '-'
                  }
                />
                <TextIconRow
                  text={
                    row.exam?.isAttendance
                      ? 'Clínico'
                      : row.exam?.isAvaliation
                      ? 'Consulta Méd.'
                      : 'Complementar'
                  }
                />

                <SFlex direction="column">
                  <StatusSelect
                    selected={row.status}
                    large={false}
                    disabled
                    width={'100%'}
                    sx={{ width: '100%' }}
                    options={options}
                    statusOptions={[]}
                    handleSelectMenu={(option) =>
                      onChangeStatus({
                        id: row.id,
                        employeeId: row.id,
                        status: option.value,
                      })
                    }
                  />
                </SFlex>
                <SFlex justify="end">
                  <Box>
                    <IconButtonRow
                      disabled={disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        onReSchedule(row);
                      }}
                      tooltip="Reagendar"
                      icon={
                        <SCalendarIcon
                          sx={{ color: disabled ? undefined : 'info.dark' }}
                        />
                      }
                    />
                  </Box>
                  <Box>
                    <SIconDownloadExam
                      companyId={employee?.companyId}
                      employeeId={employee?.id}
                      asoId={isClinicExam ? row.id : undefined}
                    />
                    {/* <IconButtonRow
                      disabled={disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (employee?.companyId)
                          onDownloadGuide(employee.companyId, employee.id);
                      }}
                      tooltip="Baixar Guia de emcaminhamento"
                      icon={
                        <SDocumentIcon
                          sx={{ color: disabled ? undefined : 'primary.light' }}
                        />
                      }
                    /> */}
                  </Box>
                </SFlex>
              </STableRow>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadQuery ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
      <ModalEditEmployeeHisExamClinic />
    </>
  );
};
