import { FC, useMemo, useState } from 'react';

import { Box, BoxProps } from '@mui/material';
import clone from 'clone';
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
import SText from 'components/atoms/SText';
import { initialExamScheduleState } from 'components/organisms/modals/ModalAddExamSchedule/hooks/useEditExamEmployee';
import { ModalEditEmployeeHisExamClinic } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/ModalEditEmployeeHisExamClinic';
import { EvaluationSelect } from 'components/organisms/tagSelects/EvaluationSelect';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import dayjs from 'dayjs';
import {
  employeeExamTypeMap,
  ExamHistoryTypeEnum,
} from 'project/enum/employee-exam-history-type.enum';
import { StatusEnum } from 'project/enum/status.enum';

import SCalendarIcon from 'assets/icons/SCalendarIcon';
import SDocumentIcon from 'assets/icons/SDocumentIcon';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';
import { useMutUpdateManyScheduleHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUpdateManyScheduleHisExam/useMutUpdateManyScheduleHisExam';
import { IQueryEmployeeHistHier } from 'core/services/hooks/queries/useQueryHisExamEmployee/useQueryHisExamEmployee';
import { useQueryHisScheduleExamCompany } from 'core/services/hooks/queries/useQueryHisScheduleExamCompany/useQueryHisScheduleExamCompany';
import { dateToString } from 'core/utils/date/date-format';
import { sortData } from 'core/utils/sorts/data.sort';
import { sortNumber } from 'core/utils/sorts/number.sort';

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

  const {
    data: historyExam,
    isLoading: loadQuery,
    count,
  } = useQueryHisScheduleExamCompany(
    page,
    {
      search,
      companyId,
      allCompanies: true,
      ...query,
    },
    rowsPerPage,
    companyId,
  );

  const updateMutation = useMutUpdateManyScheduleHisExam();
  const { onStackOpenModal } = useModal();

  const onSelectRow = (data: IEmployeeExamsHistory) => {
    // if (isSelect) {
    //   // onSelectData(data);
    // } else onEdit(historyExam.find((e) => e.id === data.id));
  };

  const onAdd = () => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE);
  };

  const onReSchedule = (data: IEmployeeExamsHistory) => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE, {
      examType: data.examType,
      hierarchyId: data.hierarchyId,
      companyId: data?.employee?.companyId,
      employeeId: data?.employee?.id,
    } as Partial<typeof initialExamScheduleState>);
  };

  const onDownloadGuia = (data: IEmployeeExamsHistory) => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD_EXAM_SCHEDULE, {
      examType: data.examType,
      hierarchyId: data.hierarchyId,
      companyId: data?.employee?.companyId,
      employeeId: data?.employee?.id,
    } as Partial<typeof initialExamScheduleState>);
  };

  const onEdit = (data?: IEmployeeExamsHistory) => {
    if (data)
      onStackOpenModal(ModalEnum.EMPLOYEE_HISTORY_EXAM_EDIT_CLINIC, data);
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

            const employee = row?.employee;
            const company = employee?.company;
            const disabled = row.status !== StatusEnum.PROCESSING;
            return (
              <STableRow
                key={row.id}
                clickable
                onClick={() => onSelectRow(row)}
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
                  text={row.exam?.isAttendance ? 'Clínico' : 'Complementar'}
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
                    <IconButtonRow
                      disabled={disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadGuia(row);
                      }}
                      tooltip="Baixar Guia de emcaminhamento"
                      icon={
                        <SDocumentIcon
                          sx={{ color: disabled ? undefined : 'primary.light' }}
                        />
                      }
                    />
                  </Box>
                </SFlex>
                {/* <IconButtonRow
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row);
                  }}
                  icon={<SCalendarIcon sx={{ color: 'info.dark' }} />}
                /> */}
                {/* <IconButtonRow
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row);
          }}
          icon={<SCancelIcon sx={{ color: 'error.dark' }} />}
        /> */}
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
