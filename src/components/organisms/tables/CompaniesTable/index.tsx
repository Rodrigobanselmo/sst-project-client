import { FC, Fragment, useCallback, useMemo, useState } from 'react';

import BusinessTwoToneIcon from '@mui/icons-material/BusinessTwoTone';
import { BoxProps } from '@mui/material';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import SCheckBox from 'components/atoms/SCheckBox';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import { companyFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/companyFilterList';
import { FilterTagList } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTagList';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import { STableFilterIcon } from 'components/atoms/STable/components/STableFilter/STableFilterIcon/STableFilterIcon';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ModalUploadFile } from 'components/organisms/modals/ModalUploadFile';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { TableSortColumnHeader } from 'components/organisms/tables/common/TableSortColumnHeader';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { ICompany } from 'core/interfaces/api/ICompany';
import { useMutUploadFile } from 'core/services/hooks/mutations/general/useMutUploadFile';
import {
  IQueryCompanies,
  IQueryCompaniesTypes,
  useQueryCompanies,
} from 'core/services/hooks/queries/useQueryCompanies';
import { cnpjMask } from 'core/utils/masks/cnpj.mask';

import {
  COMPANIES_TABLE_PAGE_SIZES,
  DEFAULT_COMPANIES_PAGE_SIZE,
  isAllowedCompaniesPageSize,
  loadCompaniesHiddenColumns,
  loadCompaniesPageSize,
  loadCompaniesSort,
  saveCompaniesHiddenColumns,
  saveCompaniesPageSize,
  saveCompaniesSort,
  StoredCompaniesSort,
} from './companiesTable.storage';
import { CompaniesListSortBy, CompaniesTableColumnId } from './companiesTable.types';

type ColumnDef = {
  id: CompaniesTableColumnId;
  column: string;
  label: string;
  sortField?: CompaniesListSortBy;
  justifyContent?: BoxProps['justifyContent'];
};

export const CompaniesTable: FC<
  { children?: any } & BoxProps & {
      /** Quando definido (ex.: modais), fixa o tamanho da página e oculta o seletor. */
      rowsPerPage?: number;
      onSelectData?: (company: ICompany) => void;
      selectedData?: ICompany[];
      query?: IQueryCompanies;
      hideTitle?: boolean;
      type?: IQueryCompaniesTypes;
    }
> = ({
  rowsPerPage: rowsPerPageProp,
  onSelectData,
  selectedData,
  query,
  hideTitle,
  type,
}) => {
  const { handleSearchChange, search, setSearch, page, setPage } =
    useTableSearchAsync();
  const [searchInputKey, setSearchInputKey] = useState(0);
  const filterProps = useFilterTable(undefined, { setPage });
  const isSelect = !!onSelectData;

  const [sort, setSort] = useState<StoredCompaniesSort | null>(() =>
    loadCompaniesSort(),
  );
  const [hiddenColumns, setHiddenColumns] = useState<
    Partial<Record<CompaniesTableColumnId, boolean>>
  >(() => loadCompaniesHiddenColumns());

  const [pageSize, setPageSize] = useState(() =>
    typeof rowsPerPageProp === 'number'
      ? rowsPerPageProp
      : loadCompaniesPageSize(),
  );

  const queryWithSort = useMemo(
    () => ({
      search,
      ...query,
      ...(search && { companiesIds: undefined }),
      ...filterProps.filtersQuery,
      ...(sort && {
        listSortBy: sort.field,
        listSortOrder: sort.order,
      }),
    }),
    [search, query, filterProps.filtersQuery, sort],
  );

  const { companies, count, isLoading } = useQueryCompanies(
    page,
    queryWithSort,
    pageSize,
    type,
  );

  const { onStackOpenModal } = useModal();
  const uploadMutation = useMutUploadFile();

  const { push } = useRouter();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const handleGoToCompany = (companyId: string) => {
    push(RoutesEnum.COMPANY.replace(':companyId', companyId));
  };

  const onSelectRow = (company: ICompany) => {
    if (isSelect) {
      onSelectData(company);
    } else handleGoToCompany(company.id);
  };

  const allColumnDefs: ColumnDef[] = useMemo(
    () => [
      {
        id: 'name',
        column: 'minmax(200px, 4fr)',
        label: 'Empresa',
        sortField: 'NAME',
      },
      {
        id: 'fantasy',
        column: 'minmax(200px, 3fr)',
        label: 'Fantasia',
        sortField: 'FANTASY',
      },
      {
        id: 'group',
        column: 'minmax(150px, 1fr)',
        label: 'Grupo',
        sortField: 'GROUP_NAME',
      },
      {
        id: 'cnpj',
        column: '130px',
        label: 'CNPJ',
        sortField: 'CNPJ',
      },
      {
        id: 'edit',
        column: '70px',
        label: 'Editar',
        justifyContent: 'center',
      },
      {
        id: 'status',
        column: '90px',
        label: 'Status',
        sortField: 'STATUS',
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
    () =>
      [
        ...(selectedData ? ['15px'] : []),
        ...visibleColumns.map((c) => c.column),
      ].join(' '),
    [selectedData, visibleColumns],
  );

  const onSort = useCallback(
    (field: CompaniesListSortBy, order: 'asc' | 'desc') => {
      const next = { field, order };
      setSort(next);
      saveCompaniesSort(next);
      setPage(1);
    },
    [setPage],
  );

  const onClearTablePreferences = useCallback(() => {
    setSort(null);
    saveCompaniesSort(null);
    setHiddenColumns({});
    saveCompaniesHiddenColumns({});
    setSearch('');
    setSearchInputKey((k) => k + 1);
    setPage(1);
    if (typeof rowsPerPageProp !== 'number') {
      setPageSize(DEFAULT_COMPANIES_PAGE_SIZE);
      saveCompaniesPageSize(DEFAULT_COMPANIES_PAGE_SIZE);
    }
  }, [rowsPerPageProp, setPage, setSearch]);

  const onHideColumn = useCallback((id: CompaniesTableColumnId) => {
    setHiddenColumns((prev) => {
      const next = { ...prev, [id]: true };
      saveCompaniesHiddenColumns(next);
      return next;
    });
  }, []);

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (!isAllowedCompaniesPageSize(size)) return;
      setPageSize(size);
      saveCompaniesPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const setHiddenColumnsFromPicker = useCallback(
    (next: Record<CompaniesTableColumnId, boolean>) => {
      setHiddenColumns(next);
      saveCompaniesHiddenColumns(next);
    },
    [],
  );

  const renderCell = (col: ColumnDef, row: ICompany) => {
    switch (col.id) {
      case 'name':
        return <TextIconRow clickable text={row.name} />;
      case 'fantasy':
        return <TextIconRow clickable text={row.fantasy} />;
      case 'group':
        return <TextIconRow clickable text={row?.group?.name || '-- '} />;
      case 'cnpj':
        return <TextIconRow clickable text={cnpjMask.mask(row.cnpj)} />;
      case 'edit':
        return (
          <IconButtonRow
            icon={<EditIcon />}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        );
      case 'status':
        return (
          <StatusSelect
            large
            sx={{ maxWidth: '120px' }}
            selected={row.status}
            disabled={isSelect}
            statusOptions={
              [
                // StatusEnum.PENDING,
                // StatusEnum.ACTIVE,
                // StatusEnum.INACTIVE,
              ]
            }
            handleSelectMenu={(option, e) => {
              e.stopPropagation();
              handleEditStatus(option.value);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {!isSelect && !hideTitle && (
        <STableTitle icon={BusinessTwoToneIcon}>Empresas</STableTitle>
      )}
      <STableSearch
        key={searchInputKey}
        autoFocus={false}
        {...(!isSelect && {
          onAddClick: () => onStackOpenModal(ModalEnum.COMPANY_EDIT),
          toolbarBeforeFilter: (
            <STableColumnsButton<CompaniesTableColumnId>
              showLabel
              columns={columnPickerItems}
              hiddenColumns={
                hiddenColumns as Record<CompaniesTableColumnId, boolean>
              }
              setHiddenColumns={setHiddenColumnsFromPicker}
            />
          ),
        })}
        onChange={(e) => handleSearchChange(e.target.value)}
      >
        <STableFilterIcon filters={companyFilterList} {...filterProps} />
      </STableSearch>
      <FilterTagList filterProps={filterProps} />
      <STable
        loading={isLoading}
        rowsNumber={pageSize}
        columns={gridTemplate}
      >
        <STableHeader>
          {selectedData && <STableHRow />}
          {visibleColumns.map((col) =>
            col.id === 'edit' ? (
              <STableHRow key={col.id} justifyContent={col.justifyContent}>
                {col.label}
              </STableHRow>
            ) : (
              <TableSortColumnHeader<CompaniesListSortBy>
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
        <STableBody<(typeof companies)[0]>
          key={pageSize}
          hideLoadMore
          rowsInitialNumber={pageSize}
          rowsData={companies}
          renderRow={(row) => {
            return (
              <STableRow
                clickable
                onClick={() => onSelectRow(row)}
                key={row.id}
                status={
                  row.status == StatusEnum.INACTIVE ? 'inactive' : undefined
                }
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={
                      !!selectedData.find((company) => company.id === row.id)
                    }
                  />
                )}
                {visibleColumns.map((col) => (
                  <Fragment key={col.id}>{renderCell(col, row)}</Fragment>
                ))}
              </STableRow>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={pageSize}
        totalCountOfRegisters={isLoading ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
        {...(typeof rowsPerPageProp !== 'number' && {
          pageSizeOptions: [...COMPANIES_TABLE_PAGE_SIZES],
          onRegistersPerPageChange,
        })}
      />
      <ModalUploadFile
        loading={uploadMutation.isLoading}
        onConfirm={async (files: File[], path: string) =>
          await uploadMutation
            .mutateAsync({
              file: files[0],
              path: path,
            })
            .catch(() => {})
        }
        maxFiles={1}
        accept={
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      />
    </>
  );
};
