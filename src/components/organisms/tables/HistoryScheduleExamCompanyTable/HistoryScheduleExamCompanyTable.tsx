import { FC } from 'react';

import { Box, BoxProps } from '@mui/material';
import clone from 'clone';
import SFlex from 'components/atoms/SFlex';
import {
  STable,
  STableBody,
  STableHRow,
  STableHeader,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import { TextClinicRow } from 'components/atoms/STable/components/Rows/TextClinicRow';
import { TextCompanyRow } from 'components/atoms/STable/components/Rows/TextCompanyRow';
import { TextEmployeeRow } from 'components/atoms/STable/components/Rows/TextEmployeeRow';
import { TextExamResult } from 'components/atoms/STable/components/Rows/TextExamResult';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import { FilterFieldEnum } from 'components/atoms/STable/components/STableFilter/constants/filter.map';
import { doneExamsFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/doneExamsFilterList';
import { FilterTagList } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTagList';
import {
  IFilterTableData,
  useFilterTable,
} from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { initialEditEmployeeHistoryExamState } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/hooks/useEditExamData';
import { ModalEditEmployeeHisExamClinic } from 'components/organisms/modals/ModalEditEmployeeHisExamClinic/ModalEditEmployeeHisExamClinic';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import {
  ExamHistoryTypeEnum,
  employeeExamTypeMap,
} from 'project/enum/employee-exam-history-type.enum';
import { PermissionEnum } from 'project/enum/permission.enum';
import { StatusEnum } from 'project/enum/status.enum';

import SCalendarIcon from 'assets/icons/SCalendarIcon';
import { SUploadFileIcon } from 'assets/icons/SUploadFileIcon';

import { statusOptionsConstantExam } from 'core/constants/maps/status-options.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { useThrottle } from 'core/hooks/useThrottle';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';
import { useMutUpdateManyScheduleHisExam } from 'core/services/hooks/mutations/manager/employee-history-exam/useMutUpdateManyScheduleHisExam/useMutUpdateManyScheduleHisExam';
import { IQueryEmployeeHistHier } from 'core/services/hooks/queries/useQueryHisExamEmployee/useQueryHisExamEmployee';
import { useFetchQueryHisScheduleExamClinic } from 'core/services/hooks/queries/useQueryHisScheduleExamClinic/useQueryHisScheduleExamClinic';
import { useQueryHisScheduleExamCompany } from 'core/services/hooks/queries/useQueryHisScheduleExamCompany/useQueryHisScheduleExamCompany';
import { queryClient } from 'core/services/queryClient';
import { dateToString } from 'core/utils/date/date-format';

import { useScheduleExam } from './hooks/useScheduleExam';
import { SDropIconEmployee } from './SDropIconEmployee/SDropIconEmployee';

export const HistoryScheduleExamCompanyTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (group: IEmployeeExamsHistory) => void;
      hideTitle?: boolean;
      companyId?: string;
      employeeId?: number;
      employee?: IEmployee;
      query?: IQueryEmployeeHistHier;
      filter?: IFilterTableData;
      setFilter?: (filter: IFilterTableData) => void;
    }
> = ({ rowsPerPage = 12, setFilter, filter, hideTitle, companyId, query }) => {
  const { search, page, setPage, handleSearchChange } = useTableSearchAsync();
  const filterProps = useFilterTable(
    filter || {
      notInStatus: {
        data: [StatusEnum.CANCELED],
        filters: [
          {
            filterValue: StatusEnum.CANCELED,
            name: 'Cancelado',
          },
        ],
        field: FilterFieldEnum.STATUS,
      },
    },
    {
      // key: 'historyScheduleExamCompanyTable',
      // timeout: 60 * 60 * 1000,
      setPage,
      setFilter,
    },
  );

  const { isAuthSuccess } = useAuthShow();

  const {
    data: historyExam,
    isLoading: loadQuery,
    count,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryHisScheduleExamCompany(
    page,
    {
      search,
      companyId,
      ...query,
      ...filterProps.filtersQuery,
    },
    rowsPerPage,
    companyId,
  );

  const updateMutation = useMutUpdateManyScheduleHisExam();
  const { fetchHisScheduleExam } = useFetchQueryHisScheduleExamClinic();

  const { onAdd, onReSchedule, onStackOpenModal, onEditEmployee } =
    useScheduleExam();

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
          getClinic: true,
          getUser: true,
          getHierarchy: true,
          id: data.id,
          examType: data.examType,
          status: data.status,
          hierarchyId: data.hierarchyId,
          employeeCompanyId:
            data.employee?.companyId || data.employee?.company?.id,
        },
        data.clinicId,
      );

      if (employee && employee.data && employee.data[0]) {
        if (employee.data[0].examsHistory)
          employee.data[0].examsHistory =
            employee.data[0]?.examsHistory?.filter(
              (exam) =>
                !(exam.exam?.isAttendance && exam.doneDate < data.doneDate),
            );

        onStackOpenModal(ModalEnum.EMPLOYEE_HISTORY_EXAM_EDIT_CLINIC, {
          ...employee.data[0],
          clinicId: data.clinicId,
          reScheduleExamData: data,
        } as typeof initialEditEmployeeHistoryExamState);
      }
    }
  };

  const onChangeStatus = (
    data: Partial<IEmployeeExamsHistory>,
    employee?: IEmployee,
  ) => {
    if (data && data.id && data.employeeId && employee) {
      updateMutation.mutateAsync({
        isClinic: true,
        companyId: employee?.companyId,
        data: [{ employeeId: data.employeeId, id: data.id, ...data }],
      });
    }
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Data', column: '80px' },
    { text: 'Hora', column: '50px' },
    { text: 'Funcionário', column: 'minmax(150px, 1fr)' },
    { text: 'Empresa', column: 'minmax(150px, 180px)' },
    { text: 'Status', column: '110px' },
    { text: 'Clínica', column: 'minmax(150px, 180px)' },
    { text: 'Tipo', column: 'minmax(80px, 140px)' },
    { text: 'Exame', column: '80px' },
    { text: 'ASO', column: '50px', justifyContent: 'start' },
    { text: 'Resultado', column: '110px', justifyContent: 'center' },
    { text: '', column: '90px', justifyContent: 'end' },
    // { text: 'Reagendar', column: 'minmax(150px, 1fr)', justifyContent: 'center' },
    // { text: 'Guia', column: '80px', justifyContent: 'center' },
  ];

  const onRefetchThrottle = useThrottle(() => {
    refetch();
    // invalidate next or previous pages
    queryClient.invalidateQueries([QueryEnum.EMPLOYEE_HISTORY_EXAM]);
  }, 1000);

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
            loadingReload={loadQuery || isFetching || isRefetching}
            onReloadClick={onRefetchThrottle}
            filterProps={{ filters: doneExamsFilterList, ...filterProps }}
          />
        </>
      )}
      <FilterTagList filterProps={filterProps} />
      <STable
        loading={loadQuery}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
        minHeight={720}
      >
        <STableHeader>
          {header.map(({ column, text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<(typeof historyExam)[0]>
          rowsData={historyExam}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            const options = clone(statusOptionsConstantExam);
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
                <TextIconRow text={row.time} />
                <TextEmployeeRow employee={employee} />
                <TextCompanyRow fontSize={10} mr={10} company={company} />
                <SFlex direction="column" mr={10}>
                  <StatusSelect
                    selected={row.status}
                    large={false}
                    disabled
                    width={'100%'}
                    sx={{ width: '100%' }}
                    options={options}
                    statusOptions={[]}
                    handleSelectMenu={(option) =>
                      employee?.id &&
                      onChangeStatus(
                        {
                          id: row.id,
                          employeeId: employee?.id,
                          status: option.value,
                        },
                        employee,
                      )
                    }
                  />
                </SFlex>
                <TextClinicRow fontSize={11} clinic={row.clinic} mr={10} />
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
                      ? 'Cons. Méd.'
                      : 'Compl.'
                  }
                />

                <SFlex ml={-10} justify="start">
                  {row.exam?.isAttendance && (
                    <IconButtonRow
                      disabled={!row.fileUrl}
                      tooltip="ASO"
                      icon={
                        <SUploadFileIcon
                          sx={{ color: !row.fileUrl ? undefined : 'info.dark' }}
                        />
                      }
                    />
                  )}
                </SFlex>

                <TextExamResult
                  onChangeEvaluation={(d) => onChangeStatus(d, employee)}
                  employeeId={employee?.id}
                  historyExam={row}
                />

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
                  {/* <SIconDownloadExam
                      companyId={employee?.companyId}
                      employeeId={employee?.id}
                      asoId={isClinicExam ? row.id : undefined}
                    /> */}
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
                  <SFlex center>
                    <SDropIconEmployee
                      employee={row.employee}
                      loading={loadQuery}
                      isScheduled={!disabled}
                      asoId={isClinicExam ? row.id : undefined}
                      isAvaliation={row.examType == ExamHistoryTypeEnum.EVAL}
                      onEditEmployee={onEditEmployee}
                      onReSchedule={() => onReSchedule(row)}
                    />
                  </SFlex>
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
    </>
  );
};
