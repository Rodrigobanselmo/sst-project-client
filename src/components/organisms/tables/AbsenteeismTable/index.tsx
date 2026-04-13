import { FC, Fragment, useCallback, useMemo, useState } from 'react';

import { BoxProps } from '@mui/material';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
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
import { absenteeismFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/absenteeismFilterList';
import { FilterTagList } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTagList';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import { STableFilterIcon } from 'components/atoms/STable/components/STableFilter/STableFilterIcon/STableFilterIcon';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import { initialAbsenteeismState } from 'components/organisms/modals/ModalAddAbsenteeism/hooks/useAddAbsenteeism';
import { TableSortColumnHeader } from 'components/organisms/tables/common/TableSortColumnHeader';
import dayjs from 'dayjs';
import { DateUnitEnum } from 'project/enum/DataUnit.enum';

import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IAbsenteeism } from 'core/interfaces/api/IAbsenteeism';
import { useQueryAbsenteeisms } from 'core/services/hooks/queries/useQueryAbsenteeisms/useQueryAbsenteeisms';
import { dateToString, dateToTimeString } from 'core/utils/date/date-format';

import {
  ABSENTEEISM_TABLE_PAGE_SIZES,
  DEFAULT_ABSENTEEISM_PAGE_SIZE,
  isAllowedAbsenteeismPageSize,
  loadAbsenteeismHiddenColumns,
  loadAbsenteeismPageSize,
  loadAbsenteeismSort,
  saveAbsenteeismHiddenColumns,
  saveAbsenteeismPageSize,
  saveAbsenteeismSort,
  StoredAbsenteeismSort,
} from './absenteeismTable.storage';
import { AbsenteeismListSortBy, AbsenteeismTableColumnId } from './absenteeismTable.types';

type ColumnDef = {
  id: AbsenteeismTableColumnId;
  column: string;
  label: string;
  sortField?: AbsenteeismListSortBy;
  justifyContent?: BoxProps['justifyContent'];
};

export const AbsenteeismsTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (group: IAbsenteeism) => void;
      hideTitle?: boolean;
      companyId?: string;
    }
> = ({ rowsPerPage: rowsPerPageProp, onSelectData, hideTitle, companyId }) => {
  const { handleSearchChange, search, setSearch, page, setPage } =
    useTableSearchAsync();
  const [searchInputKey, setSearchInputKey] = useState(0);
  const filterProps = useFilterTable(undefined, { setPage });
  const isSelect = !!onSelectData;

  const [sort, setSort] = useState<StoredAbsenteeismSort | null>(() =>
    loadAbsenteeismSort(),
  );
  const [hiddenColumns, setHiddenColumns] = useState<
    Partial<Record<AbsenteeismTableColumnId, boolean>>
  >(() => loadAbsenteeismHiddenColumns());

  const [pageSize, setPageSize] = useState(() =>
    typeof rowsPerPageProp === 'number'
      ? rowsPerPageProp
      : loadAbsenteeismPageSize(),
  );

  const queryWithSort = useMemo(
    () => ({
      search,
      ...(search ? { companiesIds: undefined } : {}),
      ...filterProps.filtersQuery,
      ...(sort && {
        listSortBy: sort.field,
        listSortOrder: sort.order,
      }),
    }),
    [search, filterProps.filtersQuery, sort],
  );

  const {
    data: group,
    isLoading: loadGroup,
    count,
  } = useQueryAbsenteeisms(page, queryWithSort, pageSize, companyId);

  const { onStackOpenModal } = useModal();

  const onAddAbsenteeism = () => {
    onStackOpenModal(ModalEnum.ABSENTEEISM_ADD, { companyId } as Partial<
      typeof initialAbsenteeismState
    >);
  };

  const onSelectRow = (row: IAbsenteeism) => {
    if (isSelect) {
      onSelectData(row);
    } else onEditAbsenteeism(row);
  };

  const onEditAbsenteeism = (row: IAbsenteeism) => {
    onStackOpenModal(ModalEnum.ABSENTEEISM_ADD, {
      id: row.id,
      employeeId: row.employee?.id,
      companyId: row.employee?.companyId,
    } as Partial<typeof initialAbsenteeismState>);
  };

  const allColumnDefs: ColumnDef[] = useMemo(
    () => [
      {
        id: 'employee',
        column: 'minmax(150px, 200px)',
        label: 'Funcionário',
        sortField: 'EMPLOYEE_NAME',
      },
      {
        id: 'company',
        column: 'minmax(150px, 150px)',
        label: 'Empresa',
        sortField: 'COMPANY_NAME',
      },
      {
        id: 'motive',
        column: 'minmax(150px, 1fr)',
        label: 'Motivo',
        sortField: 'MOTIVE_DESC',
      },
      {
        id: 'date',
        column: '150px',
        label: 'Data',
        sortField: 'START_DATE',
      },
      {
        id: 'timeAway',
        column: '140px',
        label: 'Tempo afastado',
        sortField: 'TIME_SPENT',
        justifyContent: 'center',
      },
      {
        id: 'edit',
        column: '50px',
        label: 'Editar',
        justifyContent: 'center',
      },
    ],
    [],
  );

  const visibleColumns = useMemo(
    () => allColumnDefs.filter((c) => !hiddenColumns[c.id]),
    [allColumnDefs, hiddenColumns],
  );

  const columnPickerItems = useMemo(
    () =>
      allColumnDefs
        .filter((c) => c.id !== 'edit')
        .map((c) => ({ label: c.label, value: c.id })),
    [allColumnDefs],
  );

  const gridTemplate = useMemo(
    () => visibleColumns.map((c) => c.column).join(' '),
    [visibleColumns],
  );

  const onSort = useCallback(
    (field: AbsenteeismListSortBy, order: 'asc' | 'desc') => {
      const next = { field, order };
      setSort(next);
      saveAbsenteeismSort(next);
      setPage(1);
    },
    [setPage],
  );

  const onClearTablePreferences = useCallback(() => {
    setSort(null);
    saveAbsenteeismSort(null);
    setHiddenColumns({});
    saveAbsenteeismHiddenColumns({});
    setSearch('');
    setSearchInputKey((k) => k + 1);
    setPage(1);
    if (typeof rowsPerPageProp !== 'number') {
      setPageSize(DEFAULT_ABSENTEEISM_PAGE_SIZE);
      saveAbsenteeismPageSize(DEFAULT_ABSENTEEISM_PAGE_SIZE);
    }
  }, [rowsPerPageProp, setPage, setSearch]);

  const onHideColumn = useCallback((id: AbsenteeismTableColumnId) => {
    setHiddenColumns((prev) => {
      const next = { ...prev, [id]: true };
      saveAbsenteeismHiddenColumns(next);
      return next;
    });
  }, []);

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (!isAllowedAbsenteeismPageSize(size)) return;
      setPageSize(size);
      saveAbsenteeismPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const setHiddenColumnsFromPicker = useCallback(
    (next: Record<AbsenteeismTableColumnId, boolean>) => {
      setHiddenColumns(next);
      saveAbsenteeismHiddenColumns(next);
    },
    [],
  );

  const renderCell = (col: ColumnDef, row: IAbsenteeism) => {
    const employee = row?.employee;
    const company = employee?.company;
    const isDay = row.timeUnit == DateUnitEnum.DAY;
    const startTime = dateToTimeString(row.startDate);
    const endTime = dateToTimeString(row.endDate);
    const formatStartDate =
      startTime != '00:00' ? ` - ${startTime} até ` : ' até \n';
    const formatEndDate = endTime != '00:00' ? ` - ${endTime}` : '';

    switch (col.id) {
      case 'employee':
        return <TextEmployeeRow employee={employee} />;
      case 'company':
        return <TextCompanyRow company={company} />;
      case 'motive':
        return (
          <TextIconRow
            clickable
            text={row.motive?.desc || row.esocial18?.description || '-'}
          />
        );
      case 'date':
        return (
          <TextIconRow
            fontFamily={'monospace'}
            text={`${dateToString(row.startDate)} ${formatStartDate}${dateToString(
              row.endDate,
            )}${formatEndDate}`}
          />
        );
      case 'timeAway':
        return (
          <TextIconRow
            justifyContent={'center'}
            text={`${-dayjs(row.startDate).diff(
              row.endDate,
              isDay ? 'd' : 'hour',
            )} ${isDay ? 'dias' : 'horas'}`}
          />
        );
      case 'edit':
        return (
          <IconButtonRow
            onClick={(e) => {
              e.stopPropagation();
              onEditAbsenteeism(row);
            }}
            icon={<EditIcon />}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <STableSearch
        key={searchInputKey}
        autoFocus={false}
        onAddClick={onAddAbsenteeism}
        toolbarBeforeFilter={
          <STableColumnsButton<AbsenteeismTableColumnId>
            showLabel
            columns={columnPickerItems}
            hiddenColumns={
              hiddenColumns as Record<AbsenteeismTableColumnId, boolean>
            }
            setHiddenColumns={setHiddenColumnsFromPicker}
          />
        }
        onChange={(e) => handleSearchChange(e.target.value)}
      >
        <STableFilterIcon filters={absenteeismFilterList} {...filterProps} />
      </STableSearch>
      <FilterTagList filterProps={filterProps} />
      <STable
        loading={loadGroup}
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
              <TableSortColumnHeader<AbsenteeismListSortBy>
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
        <STableBody<(typeof group)[0]>
          key={pageSize}
          rowsData={group}
          hideLoadMore
          rowsInitialNumber={pageSize}
          renderRow={(row) => (
            <STableRow
              onClick={() => onSelectRow(row)}
              clickable
              key={row.id}
            >
              {visibleColumns.map((col) => (
                <Fragment key={col.id}>{renderCell(col, row)}</Fragment>
              ))}
            </STableRow>
          )}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={pageSize}
        totalCountOfRegisters={loadGroup ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
        {...(typeof rowsPerPageProp !== 'number' && {
          pageSizeOptions: [...ABSENTEEISM_TABLE_PAGE_SIZES],
          onRegistersPerPageChange,
        })}
      />
    </>
  );
};
