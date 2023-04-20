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
import { expiredExamFilterList } from 'components/atoms/STable/components/STableFilter/constants/filter.map';
import { FilterTagList } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTagList';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import { STableFilterIcon } from 'components/atoms/STable/components/STableFilter/STableFilterIcon/STableFilterIcon';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SText from 'components/atoms/SText';
import { SIconDownloadExam } from 'components/molecules/SIconDownloadExam/SIconDownloadExam';
import { initialExamScheduleState } from 'components/organisms/modals/ModalAddExamSchedule/hooks/useEditExamEmployee';
import { ModalEditEmployeeHisExamClinic } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/ModalEditEmployeeHisExamClinic';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import { StatusEnum } from 'project/enum/status.enum';

import SCalendarIcon from 'assets/icons/SCalendarIcon';

import {
  statusOptionsConstantEmployee,
  statusOptionsConstantExam,
} from 'core/constants/maps/status-options.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { useThrottle } from 'core/hooks/useThrottle';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { useQueryEmployees } from 'core/services/hooks/queries/useQueryEmployees';
import { IQueryEmployeeHistHier } from 'core/services/hooks/queries/useQueryHisExamEmployee/useQueryHisExamEmployee';
import { queryClient } from 'core/services/queryClient';
import { dateToString } from 'core/utils/date/date-format';
import { SDropIconEmployee } from '../EmployeesTable/components/SDropIconEmployee/SDropIconEmployee';
import { initialEditEmployeeState } from 'components/organisms/modals/ModalEditEmployee/hooks/useEditEmployee';
import clone from 'clone';

export const getEmployeeRowStatus = (data?: IEmployee) => {
  const exam = data?.examsHistory?.[0];
  // if (exam && status === StatusEnum.DONE) return 'info';
  const diff = -dayjs().diff(data?.expiredDateExam, 'day');
  let status = { color: 'scale.low', status: StatusEnum.DONE };
  if (!data?.expiredDateExam || diff < 0)
    status = { color: 'scale.high', status: StatusEnum.EXPIRED };
  if (diff >= 0 && diff <= 7)
    status = { color: 'scale.mediumHigh', status: StatusEnum.DONE };
  if (diff > 7 && diff <= 30)
    status = { color: 'scale.medium', status: StatusEnum.DONE };
  if (diff >= 30 && diff <= 45)
    status = { color: 'scale.mediumLow', status: StatusEnum.DONE };

  if (
    (exam?.status == StatusEnum.PROCESSING ||
      exam?.status == StatusEnum.PENDING) &&
    (dayjs().isBefore(exam.doneDate) || dayjs().diff(exam.doneDate, 'day') == 0)
  ) {
    status.status = exam?.status;
    status.color = 'info.main';
  }

  // if (exam?.status == StatusEnum.DONE && !dayjs().isAfter(exam.expiredDate)) {
  //   status.status = exam?.status;
  //   status.color = 'scale.low';
  // }

  return status;
};

export const getEmployeeRowExpiredDate = (date: Date) => {
  if (!date) return 'sem exame';
  if (dayjs().diff(date, 'year') > 100) return 'nenhum';
  return dateToString(date, 'DD[-]MM[-]YYYY');
};

export const getEmployeeRowExamData = (row: IEmployee) => {
  const aso = row.examsHistory?.[0];
  const options = clone(statusOptionsConstantExam);
  options[StatusEnum.PROCESSING].color = 'info.main';

  const employee = row;
  const company = employee?.company;
  const exam = employee?.examsHistory?.[0];
  const lastDoneExam = employee?.examsHistory?.find(
    (ex) => ex.status === 'DONE',
  );

  const isScheduled = exam?.status == StatusEnum.PROCESSING;
  const isDoneExam = exam?.status == StatusEnum.DONE && exam?.expiredDate;

  const status = getEmployeeRowStatus(row);

  const isExpired = status.status == StatusEnum.EXPIRED;

  const textNext = isExpired
    ? 'Vencido em: '
    : isScheduled
    ? 'Agendado para: '
    : 'Proximo em: ';

  const validity =
    textNext +
    getEmployeeRowExpiredDate(
      isScheduled
        ? exam.doneDate
        : isDoneExam
        ? exam?.expiredDate
        : row?.expiredDateExam,
    );

  const lastExam =
    lastDoneExam?.doneDate || employee.lastExam
      ? dateToString(lastDoneExam?.doneDate || employee.lastExam)
      : '-';

  const disabled = ![StatusEnum.PROCESSING, StatusEnum.EXPIRED].includes(
    row.status,
  );

  const canScheduleWith45Days =
    !employee?.expiredDateExam ||
    -dayjs().diff(employee.expiredDateExam, 'day') < 45;

  return {
    disabled,
    status,
    isScheduled,
    isDoneExam,
    validity,
    lastExam,
    exam,
    company,
    employee,
    aso,
    isExpired,
    canScheduleWith45Days,
  };
};

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
  const filterProps = useFilterTable(undefined, {
    key: 'historyExpiredExamCompanyTable',
    timeout: 60 * 60 * 1000,
    setPage,
  });

  const {
    data: historyExam,
    isLoading: loadQuery,
    count,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryEmployees(
    page,
    {
      search,
      companyId,
      expiredExam: true,
      all: true,
      ...query,
      ...filterProps.filtersQuery,
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

  const onEditEmployee = (employee: IEmployee) => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD, {
      id: employee.id,
      companyId: employee.companyId,
    } as typeof initialEditEmployeeState);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    // { text: '', column: '15px' },
    { text: 'Funcionário', column: 'minmax(200px, 5fr)' },
    { text: 'Empresa', column: '150px' },
    { text: 'Cargo', column: 'minmax(190px, 1fr)' },
    { text: 'Válidade', column: '180px' },
    { text: 'Ultimo Exame', column: '110px' },
    { text: 'Status', column: '90px' },
    { text: '', column: '100px', justifyContent: 'end' },
    // { text: 'Reagendar', column: 'minmax(150px, 1fr)', justifyContent: 'center' },
    // { text: 'Guia', column: '80px', justifyContent: 'center' },
    { text: 'Editar', column: '40px', justifyContent: 'center' },
  ];

  const onRefetchThrottle = useThrottle(() => {
    refetch();
    // invalidate next or previous pages
    queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
  }, 1000);

  return (
    <>
      {!hideTitle && (
        <>
          <STableTitle>
            Funcionários{' '}
            <SText component="span" fontSize={14}>
              (Exames Vencidos)
            </SText>
          </STableTitle>
          <STableSearch
            onAddClick={onAdd}
            boxProps={{ sx: { flex: 1, maxWidth: 400 } }}
            addText="Agendar"
            placeholder="Pesquisar por nome, cpf, email, matrícula..."
            onChange={(e) => handleSearchChange(e.target.value)}
            loadingReload={loadQuery || isFetching || isRefetching}
            onReloadClick={onRefetchThrottle}
            filterProps={{ filters: expiredExamFilterList, ...filterProps }}
          />
        </>
      )}
      <FilterTagList filterProps={filterProps} />
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
            const {
              disabled,
              status,
              validity,
              lastExam,
              company,
              employee,
              isScheduled,
              aso,
              canScheduleWith45Days,
              exam,
              isExpired,
            } = getEmployeeRowExamData(row);

            return (
              <STableRow
                key={row.id}
                clickable
                onClick={() => onEdit(row)}
                // status={getRowColor(row.status)}
              >
                <TextEmployeeRow employee={employee} />
                <TextCompanyRow fontSize={10} company={company} />
                <TextIconRow
                  text={employee.hierarchy?.name}
                  fontSize={12}
                  mr={3}
                />
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
                <TextIconRow text={lastExam} />
                <SFlex direction="column">
                  <StatusSelect
                    selected={employee.statusStep || employee.status}
                    large={false}
                    disabled
                    iconProps={{ sx: { fontSize: 10 } }}
                    textProps={{ sx: { fontSize: 10 } }}
                    width={'100%'}
                    sx={{ width: '100%' }}
                    options={statusOptionsConstantEmployee}
                    statusOptions={[]}
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
                      disabled={!isScheduled}
                      companyId={employee?.companyId}
                      employeeId={employee?.id}
                      asoId={aso?.id}
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
                <SFlex center>
                  <SDropIconEmployee
                    employee={employee}
                    company={{ ...employee.company, id: employee.companyId }}
                    loading={loadQuery || isFetching || isRefetching}
                    isScheduled={isScheduled}
                    isExpired={isExpired}
                    onEditEmployee={onEditEmployee}
                    canSchedule={canScheduleWith45Days}
                    exam={exam}
                    skipOS
                    skipGuia
                  />
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
