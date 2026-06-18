import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import { Box, BoxProps, FormControl, MenuItem, Select } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
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
import { STableButton } from 'components/atoms/STable/components/STableButton';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagButton } from 'components/atoms/STagButton';
import SText from 'components/atoms/SText';
import { CompanyFlowTableSection } from 'components/organisms/main/CompanyFlow/CompanyFlowTableSection';
import { initialMainDocState } from 'components/organisms/modals/ModalAddDocVersion/hooks/useMainActions';
import {
  filterOfficialVersionsBySeries,
  filterUnofficialVersions,
  formatRevisionDisplayLabel,
  getDocumentVersionFamilyLabel,
  isOfficialDocumentVersion,
} from 'components/organisms/modals/ModalAddDocVersion/helpers/document-version.helpers';
import { ModalAddRiskGroup } from 'components/organisms/modals/ModalAddRiskGroup';
import { ModalSelectDocPgr } from 'components/organisms/modals/ModalSelectDocPgr';
import { ModalShowHierarchyTree } from 'components/organisms/modals/ModalShowHierarchyTree';
import { ModalViewDocDownload } from 'components/organisms/modals/ModalViewDocDownloads';
import { initialViewDocDownloadState } from 'components/organisms/modals/ModalViewDocDownloads/hooks/useModalViewDocDownload';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { TableSortColumnHeader } from 'components/organisms/tables/common/TableSortColumnHeader';
import dayjs from 'dayjs';
import { DocumentTypeEnum } from 'project/enum/document.enums';
import { StatusEnum } from 'project/enum/status.enum';

import SDownloadIcon from 'assets/icons/SDownloadIcon';
import { SDeleteIcon } from 'assets/icons/SDeleteIcon';
import { SReloadIcon } from 'assets/icons/SReloadIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IRiskDocument } from 'core/interfaces/api/IRiskData';
import {
  IQueryDocVersion,
  useQueryDocVersions,
} from 'core/services/hooks/queries/useQueryDocVersions/useQueryDocVersions';
import { useMutDeleteDocVersion } from 'core/services/hooks/mutations/checklist/documentData/useMutDeleteDocVersion/useMutDeleteDocVersion';
import { useMutResetOfficialSeries } from 'core/services/hooks/mutations/checklist/documentData/useMutResetOfficialSeries/useMutResetOfficialSeries';
import { useMutResetUnofficialVersions } from 'core/services/hooks/mutations/checklist/documentData/useMutResetUnofficialVersions/useMutResetUnofficialVersions';
import { useQueryDocumentData } from 'core/services/hooks/queries/useQueryDocumentData/useQueryDocumentData';
import { queryClient } from 'core/services/queryClient';

import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';

import {
  compareDocVersions,
  DOC_VERSIONS_FETCH_LIMIT,
  filterDocsByFamily,
} from './docTable.helpers';
import {
  DEFAULT_DOC_VERSIONS_PAGE_SIZE,
  DOC_VERSIONS_TABLE_PAGE_SIZES,
  isAllowedDocVersionsPageSize,
  loadDocVersionsFamilyFilter,
  loadDocVersionsPageSize,
  loadDocVersionsSort,
  loadHiddenDocVersionsColumns,
  saveDocVersionsFamilyFilter,
  saveDocVersionsPageSize,
  saveDocVersionsSort,
  saveHiddenDocVersionsColumns,
  StoredDocVersionsSort,
} from './docTable.storage';
import {
  DocTableColumnId,
  DocTableFamilyFilter,
  DocTableSortBy,
} from './docTable.types';

type ColumnDef = {
  id: DocTableColumnId;
  column: string;
  label: string;
  sortField?: DocTableSortBy;
  justifyContent?: BoxProps['justifyContent'];
};

const FAMILY_FILTER_LABELS: Record<DocTableFamilyFilter, string> = {
  all: 'Todos',
  test: 'Teste',
  official: 'Oficial',
};

export const DocTable: FC<
  { children?: any } & BoxProps & {
      hideTitle?: boolean;
      /** Quando definido, fixa o tamanho da página e oculta o seletor. */
      rowsPerPage?: number;
      query?: Partial<IQueryDocVersion>;
      type: DocumentTypeEnum;
      workspaceId?: string;
      workspaceName?: string;
      companyFlowSticky?: boolean;
      companyFlowBelowTabs?: boolean;
    }
> = ({
  rowsPerPage: rowsPerPageProp,
  hideTitle,
  query,
  type,
  workspaceId,
  workspaceName,
  companyFlowSticky = false,
  companyFlowBelowTabs = false,
}) => {
  const { handleSearchChange, search, setSearch, page, setPage } =
    useTableSearchAsync();
  const [searchInputKey, setSearchInputKey] = useState(0);
  const [sort, setSort] = useState<StoredDocVersionsSort | null>(() =>
    loadDocVersionsSort(),
  );
  const [hiddenColumns, setHiddenColumns] = useState<
    Partial<Record<DocTableColumnId, boolean>>
  >(() => loadHiddenDocVersionsColumns() as Partial<Record<DocTableColumnId, boolean>>);
  const [familyFilter, setFamilyFilter] = useState<DocTableFamilyFilter>(() =>
    loadDocVersionsFamilyFilter(),
  );
  const [pageSize, setPageSize] = useState(() =>
    typeof rowsPerPageProp === 'number'
      ? rowsPerPageProp
      : loadDocVersionsPageSize(),
  );

  const {
    data: allDocs,
    isLoading,
    count,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryDocVersions(
    1,
    {
      search,
      ...query,
      type,
    },
    DOC_VERSIONS_FETCH_LIMIT,
  );

  const { onOpenModal } = useModal();
  const { companyId } = useGetCompanyId();
  const { preventDelete } = usePreventAction();
  const { showConfirmation } = useConfirmationModal();
  const deleteDocVersion = useMutDeleteDocVersion();
  const resetUnofficialVersions = useMutResetUnofficialVersions();
  const resetOfficialSeries = useMutResetOfficialSeries();

  const { data: documentData } = useQueryDocumentData({
    companyId: companyId ?? '',
    workspaceId: workspaceId ?? '',
    type,
  });

  const unofficialVersions = useMemo(
    () => filterUnofficialVersions(allDocs),
    [allDocs],
  );

  const activeOfficialVersions = useMemo(
    () =>
      filterOfficialVersionsBySeries(
        allDocs,
        documentData?.officialRevisionSeries ?? 1,
      ),
    [allDocs, documentData?.officialRevisionSeries],
  );

  const allColumnDefs: ColumnDef[] = useMemo(
    () => [
      {
        id: 'name',
        column: 'minmax(160px, 1.2fr)',
        label: 'Identificação',
        sortField: 'NAME',
      },
      {
        id: 'description',
        column: 'minmax(160px, 2fr)',
        label: 'Descrição',
        sortField: 'DESCRIPTION',
      },
      {
        id: 'workspace',
        column: 'minmax(140px, 1.5fr)',
        label: 'Estabelecimento',
        sortField: 'WORKSPACE',
      },
      {
        id: 'family',
        column: '90px',
        label: 'Tipo',
        sortField: 'FAMILY',
        justifyContent: 'center',
      },
      {
        id: 'version',
        column: '100px',
        label: 'Versão',
        sortField: 'VERSION',
        justifyContent: 'center',
      },
      {
        id: 'created',
        column: '110px',
        label: 'Criação',
        sortField: 'CREATED',
        justifyContent: 'center',
      },
      {
        id: 'status',
        column: '100px',
        label: 'Status',
        sortField: 'STATUS',
        justifyContent: 'center',
      },
      {
        id: 'actions',
        column: '130px',
        label: 'Download',
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
        .filter((c) => c.id !== 'actions')
        .map((c) => ({ label: c.label, value: c.id })),
    [allColumnDefs],
  );

  const gridTemplate = useMemo(
    () => visibleColumns.map((c) => c.column).join(' '),
    [visibleColumns],
  );

  const defaultSort: StoredDocVersionsSort = {
    field: 'CREATED',
    order: 'desc',
  };
  const sortForData = sort ?? defaultSort;
  const sortForHeader = sort ?? defaultSort;

  const familyFilteredDocs = useMemo(
    () => filterDocsByFamily(allDocs, familyFilter),
    [allDocs, familyFilter],
  );

  const sortedDocs = useMemo(() => {
    return [...familyFilteredDocs].sort((a, b) =>
      compareDocVersions(a, b, sortForData.field, sortForData.order),
    );
  }, [familyFilteredDocs, sortForData]);

  const totalCount =
    familyFilter === 'all' ? count : familyFilteredDocs.length;

  const pagedDocs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedDocs.slice(start, start + pageSize);
  }, [sortedDocs, page, pageSize]);

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(totalCount / pageSize) || 1);
    if (page > lastPage) setPage(lastPage);
  }, [totalCount, pageSize, page, setPage]);

  const isDownloadExpired = useCallback(
    (createdAt: string | Date) =>
      dayjs(createdAt).add(7, 'days').isBefore(dayjs()),
    [],
  );

  const getDeleteConfirmMessage = useCallback(
    (doc: IRiskDocument) => {
      const processing = doc.status === StatusEnum.PROCESSING;
      const downloadExpired = isDownloadExpired(doc.created_at);

      if (processing) {
        return 'Este documento ainda está em processamento. Tem certeza que deseja excluí-lo?';
      }

      if (!downloadExpired) {
        return 'Este documento ainda está disponível para download. Tem certeza que deseja excluí-lo?';
      }

      return 'Tem certeza que deseja excluir este documento?';
    },
    [isDownloadExpired],
  );

  const handleDeleteDoc = useCallback(
    (doc: IRiskDocument) => {
      preventDelete(
        async () => {
          await deleteDocVersion
            .mutateAsync({ id: doc.id, companyId })
            .catch(() => {});
        },
        getDeleteConfirmMessage(doc),
      );
    },
    [companyId, deleteDocVersion, getDeleteConfirmMessage, preventDelete],
  );

  const handleEditStatus = (_status: StatusEnum) => {
    // TODO edit checklist status
  };

  const documentMap: Record<DocumentTypeEnum, { title: string }> = {
    [DocumentTypeEnum.PGR]: {
      title: 'PGR',
    },
    [DocumentTypeEnum.PCSMO]: {
      title: 'PCMSO',
    },
    [DocumentTypeEnum.PERICULOSIDADE]: {
      title: 'PERICULOSIDADE',
    },
    [DocumentTypeEnum.LTCAT]: {
      title: 'LTCAT',
    },
    [DocumentTypeEnum.INSALUBRIDADE]: {
      title: 'INSALUBRIDADE',
    },
    [DocumentTypeEnum.FRPS]: {
      title: 'FRPS',
    },
    [DocumentTypeEnum.OTHER]: {
      title: 'Outros',
    },
  };

  const handleOpenDocModal = (doc: IRiskDocument) => {
    onOpenModal(ModalEnum.DOCUMENT_DOWNLOAD, {
      id: doc.id,
      companyId,
      documentType: type,
    } as typeof initialViewDocDownloadState);
  };

  const onGenerateVersion = async () => {
    if (!workspaceId) return;
    onOpenModal(ModalEnum.DOCUMENT_DATA_UPSERT, {
      workspaceId,
      workspaceName: workspaceName || '',
      companyId,
      type,
    } as typeof initialMainDocState);
  };

  const handleResetUnofficialVersions = useCallback(() => {
    if (!documentData?.id || !companyId) return;

    const versionLabels = unofficialVersions.map((doc) => doc.version).join(', ');

    preventDelete(
      async () => {
        await resetUnofficialVersions
          .mutateAsync({
            companyId,
            documentDataId: documentData.id,
          })
          .catch(() => {});
      },
      `As versões de teste (${versionLabels}) serão excluídas permanentemente, incluindo anexos.\n\nA próxima versão sugerida voltará para 0.0.0.`,
      {
        title: 'Reiniciar versões de teste?',
        confirmText: 'Reiniciar',
        tag: 'delete',
        inputConfirm: true,
      },
    );
  }, [
    companyId,
    documentData?.id,
    preventDelete,
    resetUnofficialVersions,
    unofficialVersions,
  ]);

  const handleResetOfficialSeries = useCallback(async () => {
    if (!documentData?.id || !companyId) return;

    const confirmed = await showConfirmation({
      title: 'Iniciar nova série oficial?',
      message: `As versões oficiais atuais (${activeOfficialVersions
        .map((doc) => doc.version)
        .join(', ')}) permanecerão preservadas na lista.\n\nA próxima versão oficial sugerida voltará para 1.0.0 em uma nova série, sem misturar a tabela de revisões com a série anterior.`,
      confirmText: 'Reiniciar série',
      cancelText: 'Cancelar',
      variant: 'warning',
    });

    if (!confirmed) return;

    await resetOfficialSeries
      .mutateAsync({
        companyId,
        documentDataId: documentData.id,
      })
      .catch(() => {});
  }, [
    activeOfficialVersions,
    companyId,
    documentData?.id,
    resetOfficialSeries,
    showConfirmation,
  ]);

  const onSort = useCallback(
    (field: DocTableSortBy, order: 'asc' | 'desc') => {
      const next = { field, order };
      setSort(next);
      saveDocVersionsSort(next);
      setPage(1);
    },
    [setPage],
  );

  const onClearTablePreferences = useCallback(() => {
    setSort(null);
    saveDocVersionsSort(null);
    setHiddenColumns({});
    saveHiddenDocVersionsColumns({});
    setFamilyFilter('all');
    saveDocVersionsFamilyFilter('all');
    setSearch('');
    setSearchInputKey((k) => k + 1);
    setPage(1);
    if (typeof rowsPerPageProp !== 'number') {
      setPageSize(DEFAULT_DOC_VERSIONS_PAGE_SIZE);
      saveDocVersionsPageSize(DEFAULT_DOC_VERSIONS_PAGE_SIZE);
    }
  }, [rowsPerPageProp, setPage, setSearch]);

  const onHideColumn = useCallback((id: DocTableColumnId) => {
    setHiddenColumns((prev) => {
      const next = { ...prev, [id]: true };
      saveHiddenDocVersionsColumns(next);
      return next;
    });
  }, []);

  const setHiddenColumnsFromPicker = useCallback(
    (next: Record<DocTableColumnId, boolean>) => {
      setHiddenColumns(next);
      saveHiddenDocVersionsColumns(next);
    },
    [],
  );

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (!isAllowedDocVersionsPageSize(size)) return;
      setPageSize(size);
      saveDocVersionsPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const onFamilyFilterChange = useCallback(
    (event: SelectChangeEvent<DocTableFamilyFilter>) => {
      const value = event.target.value as DocTableFamilyFilter;
      setFamilyFilter(value);
      saveDocVersionsFamilyFilter(value);
      setPage(1);
    },
    [setPage],
  );

  const renderCell = (col: ColumnDef, row: IRiskDocument) => {
    const processing = row.status == StatusEnum.PROCESSING;
    const isError =
      processing && dayjs(row.created_at).add(3, 'hour').isBefore(dayjs());
    const isOfficialVersion = isOfficialDocumentVersion(row.version);
    const downloadExpired =
      !isOfficialVersion && isDownloadExpired(row.created_at);

    switch (col.id) {
      case 'name':
        return <TextIconRow key="name" text={row.name || '--'} />;
      case 'description':
        return <TextIconRow key="description" text={row.description || '--'} />;
      case 'workspace':
        return (
          <TextIconRow key="workspace" text={row.workspaceName || '--'} />
        );
      case 'family':
        return (
          <TextIconRow
            key="family"
            text={getDocumentVersionFamilyLabel(row.version)}
            justifyContent="center"
          />
        );
      case 'version':
        return (
          <TextIconRow
            key="version"
            text={formatRevisionDisplayLabel(row.version)}
            justifyContent="center"
          />
        );
      case 'created':
        return (
          <TextIconRow
            key="created"
            text={dayjs(row.created_at).format('DD/MM/YYYY')}
            justifyContent="center"
          />
        );
      case 'status':
        return (
          <StatusSelect
            key="status"
            large
            sx={{ maxWidth: '120px' }}
            selected={isError ? StatusEnum.ERROR : row.status}
            loading={isError ? false : processing}
            statusOptions={[]}
            disabled
            handleSelectMenu={(option) => handleEditStatus(option.value)}
          />
        );
      case 'actions':
        return (
          <SFlex
            key="actions"
            align="center"
            justifyContent="flex-end"
            gap={1}
            className="table-row-box"
            sx={{ width: '100%', pr: 1 }}
          >
            <STagButton
              text="Baixar"
              onClick={() => handleOpenDocModal(row)}
              large
              disabled={processing || downloadExpired}
              icon={SDownloadIcon}
              sx={{ flexShrink: 0 }}
            />
            <IconButtonRow
              icon={<SDeleteIcon />}
              tooltipTitle={
                isOfficialVersion
                  ? 'Versões oficiais não podem ser excluídas'
                  : 'Excluir'
              }
              sx={{
                flexShrink: 0,
                width: 32,
                height: 32,
                mx: 0,
                svg: { fontSize: 18, color: 'grey.600' },
              }}
              disabled={
                isOfficialVersion ||
                (deleteDocVersion.isLoading &&
                  deleteDocVersion.variables?.id === row.id)
              }
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteDoc(row);
              }}
            />
          </SFlex>
        );
      default:
        return null;
    }
  };

  const tableChrome = (
    <>
      {!hideTitle && (
        <STableTitle mr={5} icon={LibraryAddCheckIcon}>
          Versões{' '}
          <SText component="span" fontSize={14} fontWeight="600">
            ({documentMap[type]?.title})
          </SText>
        </STableTitle>
      )}
      <STableSearch
        key={searchInputKey}
        onAddClick={() => onGenerateVersion()}
        onChange={(e) => handleSearchChange(e.target.value)}
        toolbarBeforeFilter={
          <SFlex align="center" gap={2}>
            <STableColumnsButton<DocTableColumnId>
              showLabel
              columns={columnPickerItems}
              hiddenColumns={
                hiddenColumns as Record<DocTableColumnId, boolean>
              }
              setHiddenColumns={setHiddenColumnsFromPicker}
            />
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={familyFilter}
                onChange={onFamilyFilterChange}
                displayEmpty
                sx={{
                  height: 32,
                  fontSize: 13,
                  '& .MuiSelect-select': { py: 0.5 },
                }}
              >
                <MenuItem value="all">Tipo: {FAMILY_FILTER_LABELS.all}</MenuItem>
                <MenuItem value="test">Tipo: {FAMILY_FILTER_LABELS.test}</MenuItem>
                <MenuItem value="official">
                  Tipo: {FAMILY_FILTER_LABELS.official}
                </MenuItem>
              </Select>
            </FormControl>
          </SFlex>
        }
      >
        <STableButton
          tooltip="autualizar"
          onClick={() => {
            refetch();
            queryClient.invalidateQueries([QueryEnum.DOCUMENT_VERSION]);
          }}
          loading={isLoading || isFetching || isRefetching}
          icon={SReloadIcon}
          color="grey.500"
        />
        {workspaceId && documentData?.id && (
          <>
            <STableButton
              tooltip="Reiniciar versões de teste"
              text="Reset teste"
              onClick={handleResetUnofficialVersions}
              loading={resetUnofficialVersions.isLoading}
              disabled={unofficialVersions.length === 0}
              color="grey.600"
            />
            <STableButton
              tooltip="Iniciar nova série oficial"
              text="Reset oficial"
              onClick={handleResetOfficialSeries}
              loading={resetOfficialSeries.isLoading}
              disabled={activeOfficialVersions.length === 0}
              color="grey.600"
            />
          </>
        )}
      </STableSearch>
    </>
  );

  const tableHeader = (
    <STableHeader>
      {visibleColumns.map((col) =>
        col.id === 'actions' ? (
          <STableHRow key={col.id} justifyContent={col.justifyContent}>
            {col.label}
          </STableHRow>
        ) : (
          <TableSortColumnHeader<DocTableSortBy>
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
  );

  const tableBody = (
    <STableBody<IRiskDocument>
      hideLoadMore
      rowsData={pagedDocs}
      rowsInitialNumber={pageSize}
      renderRow={(row) => (
        <STableRow key={row.id}>
          {visibleColumns.map((col) => renderCell(col, row))}
        </STableRow>
      )}
    />
  );

  const tablePagination = (
    <STablePagination
      mt={2}
      registersPerPage={pageSize}
      totalCountOfRegisters={isLoading ? undefined : totalCount}
      currentPage={page}
      onPageChange={setPage}
      {...(typeof rowsPerPageProp !== 'number' && {
        pageSizeOptions: [...DOC_VERSIONS_TABLE_PAGE_SIZES],
        onRegistersPerPageChange,
      })}
    />
  );

  const tableContent = companyFlowSticky ? (
    <CompanyFlowTableSection
      chrome={tableChrome}
      columns={gridTemplate}
      loading={isLoading}
      rowsNumber={pageSize}
      header={tableHeader}
      footer={tablePagination}
      belowModuleTabs={companyFlowBelowTabs}
    >
      {tableBody}
    </CompanyFlowTableSection>
  ) : (
    <>
      {tableChrome}
      <STable columns={gridTemplate} loading={isLoading} rowsNumber={pageSize}>
        {tableHeader}
        {tableBody}
      </STable>
      {tablePagination}
    </>
  );

  return (
    <>
      {tableContent}
      <ModalAddRiskGroup />
      <ModalShowHierarchyTree />
      <ModalSelectDocPgr />
      <ModalViewDocDownload />
    </>
  );
};
