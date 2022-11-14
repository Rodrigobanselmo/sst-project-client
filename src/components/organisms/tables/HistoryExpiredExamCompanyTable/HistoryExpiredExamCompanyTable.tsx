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
import { STag } from 'components/atoms/STag';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { SIconDownloadExam } from 'components/molecules/SIconDownloadExam/SIconDownloadExam';
import { SIconUploadFile } from 'components/molecules/SIconUploadFile/SIconUploadFile';
import { initialExamScheduleState } from 'components/organisms/modals/ModalAddExamSchedule/hooks/useEditExamEmployee';
import { ModalEditEmployeeHisExamClinic } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/ModalEditEmployeeHisExamClinic';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
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
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { useMutUpdateManyScheduleHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUpdateManyScheduleHisExam/useMutUpdateManyScheduleHisExam';
import { useQueryEmployees } from 'core/services/hooks/queries/useQueryEmployees';
import { IQueryEmployeeHistHier } from 'core/services/hooks/queries/useQueryHisExamEmployee/useQueryHisExamEmployee';
import { useFetchQueryHisScheduleExamClinic } from 'core/services/hooks/queries/useQueryHisScheduleExamClinic/useQueryHisScheduleExamClinic';
import { useQueryHisScheduleExamCompany } from 'core/services/hooks/queries/useQueryHisScheduleExamCompany/useQueryHisScheduleExamCompany';
import { dateToString } from 'core/utils/date/date-format';

export const HistoryExpiredExamCompanyTable: FC<
  BoxProps & {
    rowsPerPage?: number;
    onSelectData?: (group: IEmployee) => void;
    hideTitle?: boolean;
    companyId?: string;
    employeeId?: number;
    employee?: IEmployee;
    query?: IQueryEmployeeHistHier;
  }
> = ({ rowsPerPage = 8, hideTitle, companyId, query }) => {
  const { search, page, setPage, handleSearchChange } = useTableSearchAsync();

  const {
    data: historyExam,
    isLoading: loadQuery,
    count,
  } = useQueryEmployees(
    page,
    {
      search,
      companyId,
      expiredExam: true,
      all: true,
      ...query,
    },
    rowsPerPage,
  );

  const { onStackOpenModal } = useModal();

  const onAdd = () => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE);
  };

  const onReSchedule = (data: IEmployee) => {
    const exam = data?.examsHistory?.[0];

    if (exam)
      onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE, {
        examType: exam.examType,
        hierarchyId: exam.hierarchyId,
        subOfficeId: exam.subOfficeId,
        companyId: data?.companyId,
        employeeId: data?.id,
      } as Partial<typeof initialExamScheduleState>);
  };

  const onEdit = async (data?: IEmployee) => {
    if (data) {
      onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE, {
        companyId: data?.companyId,
        employeeId: data?.id,
      } as Partial<typeof initialExamScheduleState>);
    }
  };

  const getRowColor = (status: StatusEnum): ITableRowStatus | undefined => {
    if (status === StatusEnum.DONE) return 'info';
    if (status === StatusEnum.EXPIRED) return 'inactive';
    if (status === StatusEnum.CANCELED) return 'inactive';
    return undefined;
  };

  const getRowExpiredDate = (date: Date) => {
    if (!date) return '-';
    if (dayjs().diff(date, 'year') > 100) return '-';
    return dateToString(date, 'DD[-]MM[-]YYYY');
  };

  const getRowStatus = (data?: IEmployee) => {
    const exam = data?.examsHistory?.[0];
    // if (exam && status === StatusEnum.DONE) return 'info';
    const diff = -dayjs().diff(data?.expiredDateExam, 'day');
    let status = { color: 'scale.low', status: StatusEnum.DONE };

    if (!data?.expiredDateExam || diff < 0)
      status = { color: 'scale.high', status: StatusEnum.EXPIRED };
    if (diff >= 0 && diff <= 7)
      status = { color: 'scale.mediumHigh', status: StatusEnum.DONE };
    if (diff >= 7 && diff <= 30)
      status = { color: 'scale.medium', status: StatusEnum.DONE };
    if (diff >= 30 && diff <= 90)
      status = { color: 'scale.mediumLow', status: StatusEnum.DONE };

    if (
      (exam?.status == StatusEnum.PROCESSING ||
        exam?.status == StatusEnum.PENDING) &&
      dayjs().isBefore(exam.doneDate)
    ) {
      status.status = exam?.status;
      status.color = 'info.main';
    }

    if (exam?.status == StatusEnum.DONE && !dayjs().isAfter(exam.expiredDate)) {
      status.status = exam?.status;
      status.color = 'scale.low';
    }

    return status;
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    // { text: '', column: '15px' },
    { text: 'Funcionário', column: 'minmax(150px, 1fr)' },
    { text: 'Empresa', column: '150px' },
    // { text: 'Exame', column: '120px' },
    { text: 'Ultimo Exame', column: '110px' },
    { text: 'Válidade', column: '180px' },
    { text: '', column: '100px', justifyContent: 'end' },
    // { text: 'Reagendar', column: 'minmax(150px, 1fr)', justifyContent: 'center' },
    // { text: 'Guia', column: '80px', justifyContent: 'center' },
  ];

  return (
    <>
      {!hideTitle && (
        <>
          <STableTitle>Exames Vencidos</STableTitle>
          <STableSearch
            onAddClick={onAdd}
            boxProps={{ sx: { flex: 1, maxWidth: 400 } }}
            addText="Agendar Exame"
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

            const employee = row;
            const company = employee?.company;
            const exam = employee?.examsHistory?.[0];

            const isScheduled = exam?.status == StatusEnum.PROCESSING;
            const isDoneExam =
              exam?.status == StatusEnum.DONE && exam?.expiredDate;

            const status = getRowStatus(row);
            const textNext =
              status.status == StatusEnum.EXPIRED
                ? 'Vencido em: '
                : isScheduled
                ? 'Agendado para: '
                : 'Proximo em: ';

            const validity =
              textNext +
              getRowExpiredDate(
                isScheduled
                  ? exam.doneDate
                  : isDoneExam
                  ? exam?.expiredDate
                  : row?.expiredDateExam,
              );

            const lastExam =
              exam?.doneDate && exam.status == StatusEnum.DONE
                ? dateToString(exam.doneDate || employee.lastExam)
                : '-';

            const disabled = ![
              StatusEnum.PROCESSING,
              StatusEnum.EXPIRED,
            ].includes(row.status);

            return (
              <STableRow
                key={row.id}
                clickable
                onClick={() => onEdit(row)}
                // status={getRowColor(row.status)}
              >
                <TextEmployeeRow employee={employee} />
                <TextCompanyRow company={company} />
                <TextIconRow text={lastExam} />
                {/* <SFlex direction="column">
                  <StatusSelect
                    selected={status.status}
                    large={false}
                    disabled
                    width={'100%'}
                    sx={{ width: '100%' }}
                    options={options}
                    statusOptions={[]}
                  />
                </SFlex> */}
                <SFlex align="center">
                  <Box
                    sx={{
                      minWidth: '7px',
                      minHeight: '7px',
                      maxWidth: '7px',
                      maxHeight: '7px',
                      borderRadius: 1,
                      backgroundColor: status.color,
                    }}
                  />
                  <TextIconRow
                    lineNumber={1}
                    fontSize={11}
                    color="text.light"
                    sx={{ textDecoration: 'underline' }}
                    justifyContent="center"
                    text={validity}
                  />
                </SFlex>
                <SFlex justify="end">
                  <Box>
                    <IconButtonRow
                      disabled={!isScheduled}
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
                      disabled={isScheduled}
                      companyId={employee?.companyId}
                      employeeId={employee?.id}
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
