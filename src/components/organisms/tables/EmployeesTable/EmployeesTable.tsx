import { FC, useCallback, useMemo, useState } from 'react';

import BadgeIcon from '@mui/icons-material/Badge';
import { Box, BoxProps } from '@mui/material';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import SFlex from 'components/atoms/SFlex';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import { TextCompanyRow } from 'components/atoms/STable/components/Rows/TextCompanyRow';
import { TextEmployeeRow } from 'components/atoms/STable/components/Rows/TextEmployeeRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import { employeeFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/employeeFilterList';
import { FilterTagList } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTagList';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
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
import { queryClient } from 'core/services/queryClient';
import { cpfMask } from 'core/utils/masks/cpf.mask';

import { getEmployeeRowExamData } from '../HistoryExpiredExamCompanyTable/HistoryExpiredExamCompanyTable';
import { EmployeesTableSortHeader } from './components/EmployeesTableSortHeader';
import {
  DEFAULT_EMPLOYEES_PAGE_SIZE,
  EMPLOYEES_TABLE_PAGE_SIZES,
  isAllowedEmployeesPageSize,
  loadEmployeesPageSize,
  loadEmployeesSort,
  loadHiddenEmployeeColumns,
  saveEmployeesPageSize,
  saveEmployeesSort,
  saveHiddenEmployeeColumns,
  StoredEmployeeSort,
} from './employeeTable.storage';
import {
  EmployeeListSortBy,
  EmployeeTableColumnId,
} from './employeeTable.types';
import { SDropIconEmployee } from './components/SDropIconEmployee/SDropIconEmployee';
import { PermissionCompanyEnum } from 'project/enum/permissionsCompany';

type ColumnDef = {
  id: EmployeeTableColumnId;
  column: string;
  label: string;
  sortField?: EmployeeListSortBy;
  justifyContent?: BoxProps['justifyContent'];
};

export const EmployeesTable: FC<
  { children?: any } & BoxProps & {
      /** When set, locks page size (no selector). When omitted, uses persisted 15/25/50/100. */
      rowsPerPage?: number;
      hideModal?: boolean;
      query?: IQueryEmployee;
    }
> = ({ rowsPerPage: rowsPerPageProp, hideModal, query, ...props }) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const { data: company, isLoading: loadCompany } = useQueryCompany();
  const filterProps = useFilterTable(undefined, {
    setPage,
  });
  const downloadMutation = useMutDownloadFile();

  const [sort, setSort] = useState<StoredEmployeeSort | null>(() =>
    loadEmployeesSort(),
  );
  const [hiddenColumns, setHiddenColumns] = useState<
    Partial<Record<EmployeeTableColumnId, boolean>>
  >(() => loadHiddenEmployeeColumns() as Partial<Record<EmployeeTableColumnId, boolean>>);

  const [pageSize, setPageSize] = useState(() =>
    typeof rowsPerPageProp === 'number'
      ? rowsPerPageProp
      : loadEmployeesPageSize(),
  );

  const queryWithSort = useMemo(
    () => ({
      search,
      expiredExam: true,
      ...query,
      ...filterProps.filtersQuery,
      ...(sort && {
        listSortBy: sort.field,
        listSortOrder: sort.order,
      }),
    }),
    [search, query, filterProps.filtersQuery, sort],
  );

  const {
    data: employees,
    isLoading: loadEmployees,
    count,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryEmployees(page, queryWithSort, pageSize);

  const { onStackOpenModal } = useModal();
  const { push } = useRouter();
  const { handleUploadTable } = useImportExport();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const handleGoToHierarchy = (companyId: string) => {
    push(RoutesEnum.HIERARCHY.replace(/:companyId/g, companyId));
  };

  const onAddEmployee = () => {
    onStackOpenModal(ModalEnum.EMPLOYEES_ADD, {
      companeId: company.id,
      company,
    });
  };

  const onExportClick = () => {
    handleUploadTable({
      companyId: company.id,
      pathApi: ApiRoutesEnum.UPLOAD_COMPANY_STRUCTURE.replace(
        ':companyId',
        company.id,
      ),
      onUpload: () => {
        queryClient.invalidateQueries([QueryEnum.COMPANY, company.id]);
        queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
      },
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

  const isSchedule = company.permissions?.includes(
    PermissionCompanyEnum.schedule,
  );

  const allColumnDefs: ColumnDef[] = useMemo(() => {
    const list: ColumnDef[] = [
      {
        id: 'employee',
        column: 'minmax(200px, 5fr)',
        label: 'Funcionário',
        sortField: 'NAME',
      },
    ];
    if (query?.all) {
      list.push({
        id: 'company',
        column: '150px',
        label: 'Empresa',
      });
    }
    list.push({
      id: 'cargo',
      column: 'minmax(190px, 1fr)',
      label: 'Cargo',
      sortField: 'HIERARCHY',
    });
    if (isSchedule) {
      list.push(
        {
          id: 'validity',
          column: '180px',
          label: 'Válidade',
          sortField: 'EXPIRED_DATE_EXAM',
        },
        {
          id: 'lastExam',
          column: '110px',
          label: 'Ultimo Exame',
          sortField: 'LAST_EXAM',
        },
      );
    }
    list.push(
      {
        id: 'status',
        column: '100px',
        label: 'Status',
        sortField: 'STATUS',
        justifyContent: 'center',
      },
      {
        id: 'edit',
        column: '80px',
        label: 'Editar',
        justifyContent: 'center',
      },
    );
    return list;
  }, [query?.all, isSchedule]);

  const columnPickerItems = useMemo(
    () =>
      allColumnDefs
        .filter((c) => c.id !== 'edit')
        .map((c) => ({ label: c.label, value: c.id })),
    [allColumnDefs],
  );

  const setHiddenColumnsFromPicker = useCallback(
    (next: Record<EmployeeTableColumnId, boolean>) => {
      setHiddenColumns(next);
      saveHiddenEmployeeColumns(next);
    },
    [],
  );

  const visibleColumns = useMemo(
    () => allColumnDefs.filter((c) => !hiddenColumns[c.id]),
    [allColumnDefs, hiddenColumns],
  );

  const gridTemplate = useMemo(
    () => visibleColumns.map((c) => c.column).join(' '),
    [visibleColumns],
  );

  const onSort = useCallback(
    (field: EmployeeListSortBy, order: 'asc' | 'desc') => {
      const next = { field, order };
      setSort(next);
      saveEmployeesSort(next);
      setPage(1);
    },
    [setPage],
  );

  const onClearTablePreferences = useCallback(() => {
    setSort(null);
    saveEmployeesSort(null);
    setHiddenColumns({});
    saveHiddenEmployeeColumns({});
    filterProps.clearFilter();
    setPage(1);
    if (typeof rowsPerPageProp !== 'number') {
      setPageSize(DEFAULT_EMPLOYEES_PAGE_SIZE);
      saveEmployeesPageSize(DEFAULT_EMPLOYEES_PAGE_SIZE);
    }
  }, [filterProps, setPage, rowsPerPageProp]);

  const onHideColumn = useCallback((id: EmployeeTableColumnId) => {
    setHiddenColumns((prev) => {
      const next = { ...prev, [id]: true };
      saveHiddenEmployeeColumns(next);
      return next;
    });
  }, []);

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (!isAllowedEmployeesPageSize(size)) return;
      setPageSize(size);
      saveEmployeesPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const onRefetchThrottle = useThrottle(() => {
    refetch();
    queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
  }, 1000);

  const renderCell = (
    col: ColumnDef,
    row: IEmployee,
    examRow: ReturnType<typeof getEmployeeRowExamData>,
  ) => {
    const {
      status,
      validity,
      lastExam,
      employee,
      isScheduled,
      isExpired,
      canScheduleWith45Days,
      exam,
    } = examRow;

    switch (col.id) {
      case 'employee':
        return <TextEmployeeRow key="employee" employee={employee} />;
      case 'company':
        return (
          <TextCompanyRow key="company" company={employee.company} />
        );
      case 'cargo':
        return (
          <TextIconRow
            key="cargo"
            text={employee.hierarchy?.name}
            fontSize={12}
            mr={3}
          />
        );
      case 'validity':
        return isSchedule ? (
          <SFlex key="validity" align="center">
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
        ) : null;
      case 'lastExam':
        return isSchedule ? (
          <TextIconRow key="lastExam" text={lastExam} />
        ) : null;
      case 'status':
        return (
          <StatusSelect
            key="status"
            large={false}
            sx={{ maxWidth: '130px' }}
            iconProps={{ sx: { fontSize: 10 } }}
            textProps={{ fontSize: 10 }}
            selected={row.statusStep || row.status}
            options={statusOptionsConstantEmployee}
            statusOptions={[]}
            handleSelectMenu={(option) => handleEditStatus(option.value)}
          />
        );
      case 'edit':
        return (
          <SFlex key="edit" center>
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
        );
      default:
        return null;
    }
  };

  return (
    <Box {...props}>
      <STableTitle icon={BadgeIcon}>Funcionários</STableTitle>
      <STableSearch
        onAddClick={onAddEmployee}
        onExportClick={onExportClick}
        onImportClick={onImportClick}
        onChange={(e) => handleSearchChange(e.target.value)}
        loadingReload={loadEmployees || isFetching || isRefetching}
        onReloadClick={onRefetchThrottle}
        toolbarBeforeFilter={
          <STableColumnsButton<EmployeeTableColumnId>
            showLabel
            columns={columnPickerItems}
            hiddenColumns={
              hiddenColumns as Record<EmployeeTableColumnId, boolean>
            }
            setHiddenColumns={setHiddenColumnsFromPicker}
          />
        }
        filterProps={{ filters: employeeFilterList, ...filterProps }}
      />
      <FilterTagList filterProps={filterProps} />
      <STable
        loading={loadEmployees || loadCompany}
        rowsNumber={pageSize}
        columns={gridTemplate}
      >
        <STableHeader>
          {visibleColumns.map((col) =>
            col.id === 'edit' ? (
              <STableHRow key={col.id} justifyContent={col.justifyContent}>
                {col.label}
              </STableHRow>
            ) : (
              <EmployeesTableSortHeader
                key={col.id}
                label={col.label}
                sortField={col.sortField}
                activeSort={sort}
                justifyContent={col.justifyContent}
                onSort={onSort}
                onHideColumn={() => onHideColumn(col.id)}
                onClearTable={onClearTablePreferences}
              />
            ),
          )}
        </STableHeader>
        <STableBody<(typeof employees)[0]>
          key={pageSize}
          rowsData={employees}
          hideLoadMore
          rowsInitialNumber={pageSize}
          renderRow={(row) => {
            const examRow = getEmployeeRowExamData(row);
            return (
              <STableRow
                onClick={() => onEditEmployee(row)}
                clickable
                key={row.id}
              >
                {visibleColumns.map((col) => renderCell(col, row, examRow))}
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      <STablePagination
        mt={2}
        registersPerPage={pageSize}
        totalCountOfRegisters={loadEmployees ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
        {...(typeof rowsPerPageProp !== 'number' && {
          pageSizeOptions: EMPLOYEES_TABLE_PAGE_SIZES,
          onRegistersPerPageChange,
        })}
      />
      {!hideModal && (
        <>
          <StackModalEditEmployee />
          <ModalAddExcelEmployees />
          <ModalSelectHierarchy />
        </>
      )}
    </Box>
  );
};
