import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { BoxProps } from '@mui/material';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import SFlex from 'components/atoms/SFlex';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import { STableAddButton } from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { ModalAddWorkspace } from 'components/organisms/modals/ModalAddWorkspace';
import { initialWorkspaceState } from 'components/organisms/modals/ModalAddWorkspace/hooks/useEditWorkspace';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { TableSortColumnHeader } from 'components/organisms/tables/common/TableSortColumnHeader';
import { StatusEnum } from 'project/enum/status.enum';

import EditIcon from 'assets/icons/SEditIcon';
import SWorkspaceIcon from 'assets/icons/SWorkspaceIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { usePushRoute } from 'core/hooks/actions-push/usePushRoute';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IWorkspace } from 'core/interfaces/api/ICompany';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';

import {
  DEFAULT_WORKSPACE_COMPANY_PAGE_SIZE,
  isAllowedWorkspaceCompanyPageSize,
  loadWorkspaceCompanyHiddenColumns,
  loadWorkspaceCompanyPageSize,
  loadWorkspaceCompanySort,
  saveWorkspaceCompanyHiddenColumns,
  saveWorkspaceCompanyPageSize,
  saveWorkspaceCompanySort,
  StoredWorkspaceCompanySort,
  WORKSPACE_COMPANY_TABLE_PAGE_SIZES,
} from './workspaceCompanyTable.storage';
import {
  WorkspaceCompanyColumnId,
  WorkspaceCompanySortBy,
} from './workspaceCompanyTable.types';

type ColumnDef = {
  id: WorkspaceCompanyColumnId;
  column: string;
  label: string;
  sortField?: WorkspaceCompanySortBy;
  justifyContent?: BoxProps['justifyContent'];
};

function compareWorkspaces(
  a: IWorkspace,
  b: IWorkspace,
  field: WorkspaceCompanySortBy,
  order: 'asc' | 'desc',
): number {
  const dir = order === 'asc' ? 1 : -1;
  const va = (v: unknown) => String(v ?? '');
  switch (field) {
    case 'NAME':
      return (
        dir *
        va(a.name).localeCompare(va(b.name), 'pt-BR', { sensitivity: 'base' })
      );
    case 'DESCRIPTION':
      return (
        dir *
        va(a.description).localeCompare(va(b.description), 'pt-BR', {
          sensitivity: 'base',
        })
      );
    case 'ABBREVIATION':
      return (
        dir *
        va(a.abbreviation).localeCompare(va(b.abbreviation), 'pt-BR', {
          sensitivity: 'base',
        })
      );
    case 'STATUS':
      return (
        dir *
        va(a.status).localeCompare(va(b.status), 'pt-BR', {
          sensitivity: 'base',
        })
      );
    default:
      return 0;
  }
}

export const WorkspaceTable: FC<
  { children?: any } & BoxProps & {
      hideModal?: boolean;
      /** When set, locks page size (no selector). */
      rowsPerPage?: number;
    }
> = ({ hideModal, rowsPerPage: rowsPerPageProp }) => {
  const { data, isLoading } = useQueryCompany();
  const { onOpenModal } = useModal();
  const { handleAddWorkspace } = usePushRoute();
  const { handleSearchChange, search, setSearch, page, setPage } =
    useTableSearchAsync();

  const [searchInputKey, setSearchInputKey] = useState(0);

  const [sort, setSort] = useState<StoredWorkspaceCompanySort | null>(() =>
    loadWorkspaceCompanySort(),
  );
  const [hiddenColumns, setHiddenColumns] = useState<
    Partial<Record<WorkspaceCompanyColumnId, boolean>>
  >(() => loadWorkspaceCompanyHiddenColumns());

  const [pageSize, setPageSize] = useState(() =>
    typeof rowsPerPageProp === 'number'
      ? rowsPerPageProp
      : loadWorkspaceCompanyPageSize(),
  );

  const handleEditStatus = (status: StatusEnum) => {
    // TODO edit checklist status
  };

  const handleEdit = (row: IWorkspace) => {
    const data: Partial<typeof initialWorkspaceState> = {
      cep: row?.address?.cep,
      number: row?.address?.number,
      city: row?.address?.city,
      complement: row?.address?.complement,
      state: row?.address?.state,
      street: row?.address?.street,
      neighborhood: row?.address?.neighborhood,
      description: row?.description,
      name: row?.name,
      id: row?.id,
      status: row?.status,
      companyJson: row?.companyJson,
      logoUrl: row?.logoUrl,
    };

    onOpenModal(ModalEnum.WORKSPACE_ADD, data);
  };

  const allColumnDefs: ColumnDef[] = useMemo(
    () => [
      {
        id: 'name',
        column: 'minmax(200px, 5fr)',
        label: 'Nome',
        sortField: 'NAME',
      },
      {
        id: 'description',
        column: 'minmax(150px, 1fr)',
        label: 'Descrição',
        sortField: 'DESCRIPTION',
      },
      {
        id: 'abbreviation',
        column: 'minmax(100px, 150px)',
        label: 'Sigla',
        sortField: 'ABBREVIATION',
      },
      {
        id: 'status',
        column: '80px',
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

  const filteredWorkspaces = useMemo(() => {
    const list = [...(data?.workspace || [])];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((w) => (w.name || '').toLowerCase().includes(q));
  }, [data?.workspace, search]);

  const defaultSort: StoredWorkspaceCompanySort = {
    field: 'NAME',
    order: 'asc',
  };
  const sortForData = sort ?? defaultSort;
  const sortForHeader = sort ?? defaultSort;

  const sortedWorkspaces = useMemo(() => {
    return [...filteredWorkspaces].sort((a, b) =>
      compareWorkspaces(a, b, sortForData.field, sortForData.order),
    );
  }, [filteredWorkspaces, sortForData.field, sortForData.order]);

  const totalCount = sortedWorkspaces.length;

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(totalCount / pageSize) || 1);
    if (page > lastPage) setPage(lastPage);
  }, [totalCount, pageSize, page, setPage]);

  const pagedWorkspaces = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedWorkspaces.slice(start, start + pageSize);
  }, [sortedWorkspaces, page, pageSize]);

  const onSort = useCallback(
    (field: WorkspaceCompanySortBy, order: 'asc' | 'desc') => {
      const next = { field, order };
      setSort(next);
      saveWorkspaceCompanySort(next);
      setPage(1);
    },
    [setPage],
  );

  const onClearTablePreferences = useCallback(() => {
    setSort(null);
    saveWorkspaceCompanySort(null);
    setHiddenColumns({});
    saveWorkspaceCompanyHiddenColumns({});
    setSearch('');
    setSearchInputKey((k) => k + 1);
    setPage(1);
    if (typeof rowsPerPageProp !== 'number') {
      setPageSize(DEFAULT_WORKSPACE_COMPANY_PAGE_SIZE);
      saveWorkspaceCompanyPageSize(DEFAULT_WORKSPACE_COMPANY_PAGE_SIZE);
    }
  }, [rowsPerPageProp, setPage, setSearch]);

  const onHideColumn = useCallback((id: WorkspaceCompanyColumnId) => {
    setHiddenColumns((prev) => {
      const next = { ...prev, [id]: true };
      saveWorkspaceCompanyHiddenColumns(next);
      return next;
    });
  }, []);

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (!isAllowedWorkspaceCompanyPageSize(size)) return;
      setPageSize(size);
      saveWorkspaceCompanyPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const setHiddenColumnsFromPicker = useCallback(
    (next: Record<WorkspaceCompanyColumnId, boolean>) => {
      setHiddenColumns(next);
      saveWorkspaceCompanyHiddenColumns(next);
    },
    [],
  );

  const renderCell = (col: ColumnDef, row: IWorkspace) => {
    switch (col.id) {
      case 'name':
        return <TextIconRow key="name" text={row.name} />;
      case 'description':
        return (
          <TextIconRow key="desc" text={row.description || ' -- '} />
        );
      case 'abbreviation':
        return <TextIconRow key="abbr" text={row.abbreviation} />;
      case 'status':
        return (
          <StatusSelect
            key="status"
            large
            sx={{ maxWidth: '120px' }}
            selected={row.status}
            disabled
            statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
            handleSelectMenu={(option) => handleEditStatus(option.value)}
          />
        );
      case 'edit':
        return (
          <IconButtonRow
            key="edit"
            onClick={() => handleEdit(row)}
            icon={<EditIcon />}
          />
        );
      default:
        return null;
    }
  };

  const gridTemplate = visibleColumns.map((c) => c.column).join(' ');

  return (
    <>
      <SFlex mb={8} mt={40} align="center">
        <STableTitle mb={0} mt={0} mr={10} variant="h6" icon={SWorkspaceIcon}>
          Estabelecimentos
        </STableTitle>
        <STableAddButton
          sm
          onAddClick={handleAddWorkspace}
          addText={'Adicionar'}
        />
      </SFlex>
      <STableSearch
        key={searchInputKey}
        placeholder="Buscar por nome do estabelecimento..."
        autoFocus={false}
        onChange={(e) => handleSearchChange(e.target.value)}
        toolbarBeforeFilter={
          <STableColumnsButton<WorkspaceCompanyColumnId>
            showLabel
            columns={columnPickerItems}
            hiddenColumns={
              hiddenColumns as Record<WorkspaceCompanyColumnId, boolean>
            }
            setHiddenColumns={setHiddenColumnsFromPicker}
          />
        }
      />
      <STable
        loading={isLoading}
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
              <TableSortColumnHeader<WorkspaceCompanySortBy>
                key={col.id}
                label={col.label}
                sortField={col.sortField}
                activeSort={sortForHeader}
                justifyContent={col.justifyContent}
                onSort={onSort}
                onHideColumn={() => onHideColumn(col.id)}
                onClearTable={onClearTablePreferences}
              />
            ),
          )}
        </STableHeader>
        <STableBody<IWorkspace>
          key={pageSize}
          rowsData={pagedWorkspaces}
          hideLoadMore
          rowsInitialNumber={pageSize}
          renderRow={(row) => (
            <STableRow key={row.id}>
              {visibleColumns.map((col) => renderCell(col, row))}
            </STableRow>
          )}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={pageSize}
        totalCountOfRegisters={isLoading ? undefined : totalCount}
        currentPage={page}
        onPageChange={setPage}
        {...(typeof rowsPerPageProp !== 'number' && {
          pageSizeOptions: [...WORKSPACE_COMPANY_TABLE_PAGE_SIZES],
          onRegistersPerPageChange,
        })}
      />
      {!hideModal && <ModalAddWorkspace />}
    </>
  );
};
