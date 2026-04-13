import { FC, Fragment, useCallback, useMemo, useState } from 'react';

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
import { clinicFilterList } from 'components/atoms/STable/components/STableFilter/constants/lists/clinicFilterList';
import { FilterTagList } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTagList';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import { STableFilterIcon } from 'components/atoms/STable/components/STableFilter/STableFilterIcon/STableFilterIcon';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import STooltip from 'components/atoms/STooltip';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { TableSortColumnHeader } from 'components/organisms/tables/common/TableSortColumnHeader';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import SClinicIcon from 'assets/icons/SClinicIcon';
import EditIcon from 'assets/icons/SEditIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IAddress, ICompany } from 'core/interfaces/api/ICompany';
import {
  IQueryCompanies,
  IQueryCompaniesTypes,
  useQueryCompanies,
} from 'core/services/hooks/queries/useQueryCompanies';
import { cepMask } from 'core/utils/masks/cep.mask';

import {
  CLINICS_TABLE_PAGE_SIZES,
  DEFAULT_CLINICS_PAGE_SIZE,
  isAllowedClinicsPageSize,
  loadClinicsHiddenColumns,
  loadClinicsPageSize,
  loadClinicsSort,
  saveClinicsHiddenColumns,
  saveClinicsPageSize,
  saveClinicsSort,
  StoredClinicsSort,
} from './clinicsTable.storage';
import { ClinicsListSortBy, ClinicsTableColumnId } from './clinicsTable.types';

type ColumnDef = {
  id: ClinicsTableColumnId;
  column: string;
  label: string;
  sortField?: ClinicsListSortBy;
  justifyContent?: BoxProps['justifyContent'];
};

export const ClinicsTable: FC<
  { children?: any } & BoxProps & {
      /** Quando definido (ex.: modais), fixa o tamanho da página e oculta o seletor. */
      rowsPerPage?: number;
      onSelectData?: (company: ICompany) => void;
      simpleShow?: boolean;
      selectedData?: string[];
      query?: IQueryCompanies;
      type?: IQueryCompaniesTypes;
    }
> = ({
  rowsPerPage: rowsPerPageProp,
  simpleShow,
  onSelectData,
  selectedData,
  query,
  type,
}) => {
  const { handleSearchChange, search, setSearch, page, setPage } =
    useTableSearchAsync();
  const [searchInputKey, setSearchInputKey] = useState(0);
  const filterProps = useFilterTable(undefined, { setPage });
  const isSelect = !!onSelectData;

  const [sort, setSort] = useState<StoredClinicsSort | null>(() =>
    loadClinicsSort(),
  );
  const [hiddenColumns, setHiddenColumns] = useState<
    Partial<Record<ClinicsTableColumnId, boolean>>
  >(() => loadClinicsHiddenColumns());

  const [pageSize, setPageSize] = useState(() =>
    typeof rowsPerPageProp === 'number'
      ? rowsPerPageProp
      : loadClinicsPageSize(),
  );

  const queryWithSort = useMemo(
    () => ({
      search,
      ...query,
      isClinic: true,
      ...(search && { scheduleBlockId: undefined }),
      ...(search && { companyToClinicsId: undefined }),
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
  const isFilterSelectCompanyToClinicsId =
    !!query?.companyToClinicsId && !search;

  const { push } = useRouter();

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const handleGoToClinic = (companyId: string) => {
    push(`${RoutesEnum.CLINICS}/${companyId}`);
  };

  const onSelectRow = (company: ICompany) => {
    if (isSelect) {
      onSelectData(company);
    } else handleGoToClinic(company.id);
  };

  const getAddress = (address?: IAddress) => {
    if (!address) return '';
    return `${address.street}, ${address.neighborhood} - ${cepMask.mask(
      address.cep,
    )}`;
  };

  const allColumnDefs: ColumnDef[] = useMemo(() => {
    const list: ColumnDef[] = [
      {
        id: 'fantasy',
        column: 'minmax(200px, 4fr)',
        label: 'Clínica',
        sortField: 'FANTASY',
      },
    ];
    if (!simpleShow) {
      list.push({
        id: 'address',
        column: 'minmax(200px, 5fr)',
        label: 'Endereço',
        sortField: 'ADDRESS_STREET',
      });
    }
    list.push(
      {
        id: 'city',
        column: 'minmax(150px, 1fr)',
        label: 'Cidade',
        sortField: 'CITY',
      },
      {
        id: 'state',
        column: '50px',
        label: 'UF',
        sortField: 'STATE',
      },
      {
        id: 'phone',
        column: '100px',
        label: 'Telefone',
        sortField: 'PHONE',
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
    );
    return list;
  }, [simpleShow]);

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
    (field: ClinicsListSortBy, order: 'asc' | 'desc') => {
      const next = { field, order };
      setSort(next);
      saveClinicsSort(next);
      setPage(1);
    },
    [setPage],
  );

  /** Não chama `clearFilter`: preserva UF/Cidade/Empresa conforme pedido. */
  const onClearTablePreferences = useCallback(() => {
    setSort(null);
    saveClinicsSort(null);
    setHiddenColumns({});
    saveClinicsHiddenColumns({});
    setSearch('');
    setSearchInputKey((k) => k + 1);
    setPage(1);
    if (typeof rowsPerPageProp !== 'number') {
      setPageSize(DEFAULT_CLINICS_PAGE_SIZE);
      saveClinicsPageSize(DEFAULT_CLINICS_PAGE_SIZE);
    }
  }, [rowsPerPageProp, setPage, setSearch]);

  const onHideColumn = useCallback((id: ClinicsTableColumnId) => {
    setHiddenColumns((prev) => {
      const next = { ...prev, [id]: true };
      saveClinicsHiddenColumns(next);
      return next;
    });
  }, []);

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (!isAllowedClinicsPageSize(size)) return;
      setPageSize(size);
      saveClinicsPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const setHiddenColumnsFromPicker = useCallback(
    (next: Record<ClinicsTableColumnId, boolean>) => {
      setHiddenColumns(next);
      saveClinicsHiddenColumns(next);
    },
    [],
  );

  const renderCell = (col: ColumnDef, row: ICompany) => {
    switch (col.id) {
      case 'fantasy':
        return <TextIconRow clickable text={row.fantasy} />;
      case 'address':
        return <TextIconRow clickable text={getAddress(row.address)} />;
      case 'city':
        return <TextIconRow clickable text={row?.address?.city || '-'} />;
      case 'state':
        return <TextIconRow clickable text={row?.address?.state} />;
      case 'phone':
        return (
          <TextIconRow
            clickable
            text={row?.contacts?.find((c) => c.isPrincipal)?.phone || '-'}
          />
        );
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
            sx={{ maxWidth: '120px' }}
            selected={row.status}
            disabled={isSelect}
            statusOptions={[
              StatusEnum.PENDING,
              StatusEnum.ACTIVE,
              StatusEnum.INACTIVE,
            ]}
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
      {!isSelect && <STableTitle icon={SClinicIcon}>Clínicas</STableTitle>}
      <STableSearch
        key={searchInputKey}
        autoFocus={false}
        {...(!isSelect &&
          !simpleShow && {
            toolbarBeforeFilter: (
              <STableColumnsButton<ClinicsTableColumnId>
                showLabel
                columns={columnPickerItems}
                hiddenColumns={
                  hiddenColumns as Record<ClinicsTableColumnId, boolean>
                }
                setHiddenColumns={setHiddenColumnsFromPicker}
              />
            ),
          })}
        {...(!isSelect &&
          !simpleShow && {
            onAddClick: () => onStackOpenModal(ModalEnum.CLINIC_EDIT),
          })}
        onChange={(e) => handleSearchChange(e.target.value)}
      >
        <STableFilterIcon filters={clinicFilterList} {...filterProps} />
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
              <TableSortColumnHeader<ClinicsListSortBy>
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
            const checked =
              selectedData &&
              !!selectedData.find((companyId) => companyId === row.id);
            return (
              <STableRow
                clickable
                onClick={() => onSelectRow(row)}
                key={row.id}
              >
                {selectedData && (
                  <STooltip
                    title={
                      !checked && isFilterSelectCompanyToClinicsId
                        ? 'Selecionado atravez do grupo empresarial'
                        : ''
                    }
                  >
                    <SCheckBox
                      label=""
                      {...(!checked &&
                        isFilterSelectCompanyToClinicsId && {
                          color: 'info',
                        })}
                      checked={checked || isFilterSelectCompanyToClinicsId}
                    />
                  </STooltip>
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
          pageSizeOptions: [...CLINICS_TABLE_PAGE_SIZES],
          onRegistersPerPageChange,
        })}
      />
    </>
  );
};
