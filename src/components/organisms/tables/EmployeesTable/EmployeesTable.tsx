import { FC } from 'react';

import BadgeIcon from '@mui/icons-material/Badge';
import { Box, BoxProps } from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import {
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
import { employeeFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/employeeFilterList';
import { FilterTagList } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTagList';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import { STableFilterIcon } from 'components/atoms/STable/components/STableFilter/STableFilterIcon/STableFilterIcon';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ModalAddExcelEmployees } from 'components/organisms/modals/ModalAddExcelEmployees';
import { initialEditEmployeeState } from 'components/organisms/modals/ModalEditEmployee/hooks/useEditEmployee';
import { StackModalEditEmployee } from 'components/organisms/modals/ModalEditEmployee/ModalEditEmployee';
import { ModalSelectHierarchy } from 'components/organisms/modals/ModalSelectHierarchy';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';

import { statusOptionsConstantEmployee } from 'core/constants/maps/status-options.constant';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useImportExport } from 'core/hooks/useImportExport';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { useThrottle } from 'core/hooks/useThrottle';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { useMutDownloadFile } from 'core/services/hooks/mutations/general/useMutDownloadFile';
import { GetCompanyStructureResponse } from 'core/services/hooks/mutations/general/useMutUploadFile/types';
import { ReportTypeEnum } from 'core/services/hooks/mutations/reports/useMutReport/types';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import {
  IQueryEmployee,
  useQueryEmployees,
} from 'core/services/hooks/queries/useQueryEmployees';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { queryClient } from 'core/services/queryClient';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { getEmployeeRowExamData } from '../HistoryExpiredExamCompanyTable/HistoryExpiredExamCompanyTable';
import { SDropIconEmployee } from './components/SDropIconEmployee/SDropIconEmployee';

export const EmployeesTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      hideModal?: boolean;
      query?: IQueryEmployee;
    }
> = ({ rowsPerPage = 8, hideModal, query, ...props }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const { data: company, isLoading: loadCompany } = useQueryCompany();
  const filterProps = useFilterTable(undefined, {
    setPage,
  });
  const downloadMutation = useMutDownloadFile();

  const {
    data: employees,
    isLoading: loadEmployees,
    count,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryEmployees(
    page,
    { search, expiredExam: true, ...query, ...filterProps.filtersQuery },
    rowsPerPage,
  );

  const { onStackOpenModal } = useModal();
  const { push } = useRouter();
  const { handleUploadTable } = useImportExport();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const handleGoToEmployee = (companyId: string, employeeId: number) => {
    //push(`${RoutesEnum.COMPANIES}/${companyId}/${employeeId}`);
  };

  const handleGoToHierarchy = (companyId: string) => {
    push(RoutesEnum.HIERARCHY.replace(/:companyId/g, companyId));
  };

  const onAddEmployee = () => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD, {});
  };

  const onExportClick = () => {
    handleUploadTable({
      companyId: company.id,
      pathApi: ApiRoutesEnum.UPLOAD_COMPANY_STRUCTURE.replace(
        ':companyId',
        company.id,
      ),
      type: ReportTypeEnum.MODEL_EMPLOYEE,
      payload: {
        createEmployee: true,
        createHierarchy: true,
        createHomo: true,
        createHierOnHomo: true,
      } as GetCompanyStructureResponse,
    });
  };

  const onImportClick = () => {
    downloadMutation.mutate(
      ApiRoutesEnum.DOWNLOAD_EMPLOYEES + `/${company.id}`,
    );
  };

  const onEditEmployee = (employee: IEmployee) => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD, {
      id: employee.id,
      companyId: employee.companyId,
      cpf: cpfMask.mask(employee.cpf),
      name: employee.name.split(' - ')[0],
      status: employee.status,
      birthday: employee.birthday,
      isComorbidity: employee.isComorbidity,
      phone: employee.phone,
      email: employee.email,
      sex: employee.sex,
      socialName: employee.socialName,
      shiftId: employee.shiftId,
      esocialCode: employee.esocialCode,
      nickname: employee.nickname,
      hierarchyId: employee.hierarchyId,
      hierarchy: {
        id: employee.hierarchyId,
        name: employee?.hierarchy?.name,
      } as any,
    } as typeof initialEditEmployeeState);
  };

  const header: (BoxProps & { text: string; column: string })[] = [
    { text: 'Funcionário', column: 'minmax(200px, 5fr)' },
    ...(query?.all ? [{ text: 'Empresa', column: '150px' }] : []),
    { text: 'Cargo', column: 'minmax(190px, 1fr)' },
    ...(company.schedule
      ? [
          { text: 'Válidade', column: '180px' },
          { text: 'Ultimo Exame', column: '110px' },
        ]
      : []),
    { text: 'Status', column: '100px', justifyContent: 'center' },
    { text: 'Editar', column: '80px', justifyContent: 'center' },
  ];

  const onRefetchThrottle = useThrottle(() => {
    refetch();
    // invalidate next or previous pages
    queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
  }, 1000);

  return (
    <>
      <STableTitle icon={BadgeIcon}>Funcionários</STableTitle>
      <STableSearch
        onAddClick={onAddEmployee}
        onExportClick={onExportClick}
        onImportClick={onImportClick}
        onChange={(e) => handleSearchChange(e.target.value)}
        loadingReload={loadEmployees || isFetching || isRefetching}
        onReloadClick={onRefetchThrottle}
        filterProps={{ filters: employeeFilterList, ...filterProps }}
      />
      <FilterTagList filterProps={filterProps} />
      <STable
        loading={loadEmployees || loadCompany}
        rowsNumber={rowsPerPage}
        columns={header.map(({ column }) => column).join(' ')}
      >
        <STableHeader>
          {header.map(({ text, ...props }) => (
            <STableHRow key={text} {...props}>
              {text}
            </STableHRow>
          ))}
        </STableHeader>
        <STableBody<(typeof employees)[0]>
          rowsData={employees}
          hideLoadMore
          rowsInitialNumber={rowsPerPage}
          renderRow={(row) => {
            const {
              status,
              validity,
              lastExam,
              employee,
              isScheduled,
              isExpired,
              canScheduleWith45Days,
              exam,
            } = getEmployeeRowExamData(row);

            return (
              <STableRow
                onClick={() => onEditEmployee(row)}
                clickable
                key={row.id}
              >
                <TextEmployeeRow employee={employee} />
                {query?.all && <TextCompanyRow company={employee.company} />}
                <TextIconRow
                  text={employee.hierarchy?.name}
                  fontSize={12}
                  mr={3}
                />

                {company.schedule && (
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
                )}
                {company.schedule && <TextIconRow text={lastExam} />}

                <StatusSelect
                  large={false}
                  sx={{ maxWidth: '130px' }}
                  iconProps={{ sx: { fontSize: 10 } }}
                  textProps={{ fontSize: 10 }}
                  selected={row.statusStep || row.status}
                  options={statusOptionsConstantEmployee}
                  statusOptions={[]}
                  handleSelectMenu={(option) => handleEditStatus(option.value)}
                />
                <SFlex center>
                  <SDropIconEmployee
                    employee={row}
                    company={company}
                    loading={loadEmployees || loadCompany}
                    isScheduled={isScheduled}
                    isExpired={isExpired}
                    onEditEmployee={onEditEmployee}
                    canSchedule={canScheduleWith45Days}
                    exam={exam}
                  />
                </SFlex>
                {/* <IconButtonRow icon={<EditIcon />} /> */}
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      <STablePagination
        mt={2}
        registersPerPage={rowsPerPage}
        totalCountOfRegisters={loadEmployees ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
      />
      {!hideModal && (
        <>
          <StackModalEditEmployee />
          <ModalAddExcelEmployees />
          <ModalSelectHierarchy />
        </>
      )}
    </>
  );
};
