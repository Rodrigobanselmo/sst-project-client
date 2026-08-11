import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  Box,
  BoxProps,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import SCheckBox from 'components/atoms/SCheckBox';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import { FilterTagList } from 'components/atoms/STable/components/STableFilter/FilterTag/FilterTagList';
import { useFilterTable } from 'components/atoms/STable/components/STableFilter/hooks/useFilterTable';
import { STableButton } from 'components/atoms/STable/components/STableButton';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STagRisk } from 'components/atoms/STagRisk';
import { SCheckRiskDocInfo } from 'components/molecules/SCheckRiskDocInfo';
import { initialAddRiskState } from 'components/organisms/modals/ModalAddRisk/hooks/useAddRisk';
import { StatusSelect } from 'components/organisms/tagSelects/StatusSelect';
import { TableSortColumnHeader } from 'components/organisms/tables/common/TableSortColumnHeader';
import { useRouter } from 'next/router';
import { StatusEnum } from 'project/enum/status.enum';

import SReloadIcon from 'assets/icons/SReloadIcon';
import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IRiskDocInfo, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutDeleteRisk } from 'core/services/hooks/mutations/checklist/risk/useMutDeleteRisk';
import { useMutUpdateRiskStatus } from 'core/services/hooks/mutations/checklist/risk/useMutUpdateRiskStatus';
import { useMutUpsertRiskDocInfo } from 'core/services/hooks/mutations/checklist/risk/useMutUpsertRiskDocInfo';
import { IQueryExam } from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { queryClient } from 'core/services/queryClient';

import { getRiskDoc } from '../RiskCompanyTable/RiskCompanyTable';
import { sortRisksIdentifiedForVisualDisplay } from '../RiskCompanyTable/riskCompanyIdentifiedVisualSort';
import { RiskActionsRow } from './RiskActionsRow';
import { registeredRisksFilterList } from './registeredRisksFilterList';
import {
  DEFAULT_RISKS_REGISTERED_PAGE_SIZE,
  isAllowedRisksRegisteredPageSize,
  loadRisksRegisteredHiddenColumns,
  loadRisksRegisteredPageSize,
  loadRisksRegisteredSort,
  RISKS_REGISTERED_TABLE_PAGE_SIZES,
  saveRisksRegisteredHiddenColumns,
  saveRisksRegisteredPageSize,
  saveRisksRegisteredSort,
  StoredRiskRegisteredSort,
} from './registeredRisksTable.storage';
import {
  RiskRegisteredColumnId,
  RiskRegisteredListSortBy,
} from './registeredRisksTable.types';
import {
  buildRegisteredFiltersFromUrl,
  parseRisksListQuery,
  RISKS_LIST_QUERY_KEYS,
  risksListQueryEqual,
  serializeRisksListQuery,
  type RiskStatusFilter,
} from './risksListQuery.util';
import { useQueryRisks } from '@/core/services/hooks/queries/useQueryRisks/useQueryRisks';
import { effectiveRiskStatus } from 'core/utils/effectiveRiskStatus';

type ColumnDef = {
  id: RiskRegisteredColumnId;
  column: string;
  label: string;
  sortField?: RiskRegisteredListSortBy;
  justifyContent?: BoxProps['justifyContent'];
};

export const RisksTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (company: IRiskFactors) => void;
      selectedData?: IRiskFactors[];
      query?: IQueryExam;
      onEditRisk?: (
        risk: IRiskFactors,
        listQuery?: Record<string, string>,
      ) => void;
    }
> = ({
  rowsPerPage: rowsPerPageProp,
  onSelectData,
  selectedData,
  onEditRisk: onEditRiskExternal,
}) => {
  const router = useRouter();
  const initialList = useMemo(
    () => parseRisksListQuery(router.query),
    // Hydrate once from the URL when the table mounts (list page waits for router.isReady).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { handleSearchChange, search, page, setPage } = useTableSearchAsync({
    initialSearch: initialList.search,
    initialPage: initialList.page,
  });
  const filterProps = useFilterTable(
    buildRegisteredFiltersFromUrl(initialList),
  );
  const [statusFilter, setStatusFilter] = useState<RiskStatusFilter>(
    initialList.status,
  );

  const isSelect = !!onSelectData;

  const [sort, setSort] = useState<StoredRiskRegisteredSort | null>(
    () => initialList.sort || loadRisksRegisteredSort(),
  );
  const [hiddenColumns, setHiddenColumns] = useState<
    Partial<Record<RiskRegisteredColumnId, boolean>>
  >(() => loadRisksRegisteredHiddenColumns());

  const [pageSize, setPageSize] = useState(() => {
    if (typeof rowsPerPageProp === 'number') return rowsPerPageProp;
    if (
      initialList.pageSize &&
      isAllowedRisksRegisteredPageSize(initialList.pageSize)
    ) {
      return initialList.pageSize;
    }
    return loadRisksRegisteredPageSize();
  });

  const prevFiltersQueryKeyRef = useRef<string | null>(null);
  useEffect(() => {
    // Only reset page when filter *content* actually changes (user action).
    // Do NOT reset on mount / Strict Mode double-invoke / same-content remounts —
    // that was wiping hydrated `page` from the URL after edit → list return.
    const key = JSON.stringify(filterProps.filtersQuery ?? {});
    if (prevFiltersQueryKeyRef.current === null) {
      prevFiltersQueryKeyRef.current = key;
      return;
    }
    if (prevFiltersQueryKeyRef.current === key) return;
    prevFiltersQueryKeyRef.current = key;
    setPage(1);
  }, [filterProps.filtersQuery, setPage]);

  // Keep list context in the URL (source of truth for edit → list return).
  useEffect(() => {
    if (isSelect || !router.isReady) return;

    const companyId = router.query.companyId;
    if (!companyId || Array.isArray(companyId)) return;

    const serialized = serializeRisksListQuery({
      search,
      page,
      pageSize: typeof rowsPerPageProp === 'number' ? null : pageSize,
      status: statusFilter,
      riskTypes: (filterProps.filtersQuery.riskTypes as string[]) || [],
      severities: (
        (filterProps.filtersQuery.severities as Array<string | number>) || []
      )
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n)),
      riskSubTypeIds: (
        (filterProps.filtersQuery.riskSubTypeIds as Array<string | number>) ||
        []
      )
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n)),
      mustIsPGR: Boolean(filterProps.filtersQuery.mustIsPGR),
      mustIsPPP: Boolean(filterProps.filtersQuery.mustIsPPP),
      mustIsPCMSO: Boolean(filterProps.filtersQuery.mustIsPCMSO),
      mustIsAso: Boolean(filterProps.filtersQuery.mustIsAso),
      sort,
    });

    const nextQuery: Record<string, string> = {
      companyId,
      ...serialized,
    };
    const active = router.query.active;
    if (typeof active === 'string' && active !== '') {
      nextQuery.active = active;
    }

    const currentQuery: Record<string, string> = { companyId };
    for (const key of [...RISKS_LIST_QUERY_KEYS, 'active'] as const) {
      const value = router.query[key];
      if (typeof value === 'string' && value !== '') {
        currentQuery[key] = value;
      }
    }

    if (risksListQueryEqual(nextQuery, currentQuery)) return;

    void router.replace(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true },
    );
  }, [
    isSelect,
    router,
    search,
    page,
    pageSize,
    statusFilter,
    filterProps.filtersQuery,
    sort,
    rowsPerPageProp,
  ]);

  const queryWithSort = useMemo(() => {
    const fq = { ...filterProps.filtersQuery };
    if (Array.isArray(fq.riskSubTypeIds)) {
      fq.riskSubTypeIds = fq.riskSubTypeIds.map((id) => Number(id));
    }
    if (Array.isArray(fq.severities)) {
      fq.severities = fq.severities.map((n) => Number(n));
    }
    return {
      search,
      statusFilter,
      ...fq,
      ...(sort && {
        listSortBy: sort.field,
        listSortOrder: sort.order,
      }),
    };
  }, [search, sort, filterProps.filtersQuery, statusFilter]);

  const {
    data: risks,
    isLoading: loadRisks,
    count,
    companyId,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryRisks(page, queryWithSort, pageSize);

  const displayRisks = useMemo(
    () => sortRisksIdentifiedForVisualDisplay(risks),
    [risks],
  );

  const { onStackOpenModal } = useModal();
  const upsertRiskDocInfo = useMutUpsertRiskDocInfo();
  const deleteRiskMut = useMutDeleteRisk();
  const updateRiskStatusMut = useMutUpdateRiskStatus();

  const handleEditStatus = (row: IRiskFactors, status: StatusEnum) => {
    if (status === StatusEnum.INACTIVE) {
      deleteRiskMut.mutate(row.id);
      return;
    }
    updateRiskStatusMut.mutate({
      id: row.id,
      status: StatusEnum.ACTIVE,
      companyId: row.companyId || companyId,
    });
  };

  const onAddRisk = () => {
    onStackOpenModal(ModalEnum.RISK_ADD, {} as typeof initialAddRiskState);
  };

  const buildListQueryForNavigation = useCallback(() => {
    const serialized = serializeRisksListQuery({
      search,
      page,
      pageSize: typeof rowsPerPageProp === 'number' ? null : pageSize,
      status: statusFilter,
      riskTypes: (filterProps.filtersQuery.riskTypes as string[]) || [],
      severities: (
        (filterProps.filtersQuery.severities as Array<string | number>) || []
      )
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n)),
      riskSubTypeIds: (
        (filterProps.filtersQuery.riskSubTypeIds as Array<string | number>) ||
        []
      )
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n)),
      mustIsPGR: Boolean(filterProps.filtersQuery.mustIsPGR),
      mustIsPPP: Boolean(filterProps.filtersQuery.mustIsPPP),
      mustIsPCMSO: Boolean(filterProps.filtersQuery.mustIsPCMSO),
      mustIsAso: Boolean(filterProps.filtersQuery.mustIsAso),
      sort,
    });
    const active = router.query.active;
    if (typeof active === 'string' && active !== '') {
      return { ...serialized, active };
    }
    return serialized;
  }, [
    search,
    page,
    pageSize,
    statusFilter,
    filterProps.filtersQuery,
    sort,
    rowsPerPageProp,
    router.query.active,
  ]);

  const onEditRisk = (risk: IRiskFactors) => {
    if (onEditRiskExternal) {
      // Prefer in-memory list state over router.query so a lagged shallow
      // replace cannot drop `page` when opening /edit.
      onEditRiskExternal(risk, buildListQueryForNavigation());
      return;
    }

    onStackOpenModal(ModalEnum.RISK_ADD, {
      ...(risk as any),
    } as typeof initialAddRiskState);
  };

  const onChangeRiskDocInfo = (docInfo: Partial<IRiskDocInfo>) => {
    if (!docInfo.riskId) return;

    upsertRiskDocInfo.mutateAsync({
      ...docInfo,
      riskId: docInfo.riskId,
    });
  };

  const onSelectRow = (risk: IRiskFactors) => {
    if (isSelect) {
      onSelectData(risk);
    } else onEditRisk(risk);
  };

  const allColumnDefs: ColumnDef[] = useMemo(() => {
    const list: ColumnDef[] = [
      {
        id: 'type',
        column: 'minmax(92px, max-content)',
        label: 'Tipo',
        sortField: 'TYPE',
      },
      {
        id: 'name',
        column: 'minmax(160px, 400px)',
        label: 'Nome',
        sortField: 'NAME',
      },
      {
        id: 'subtype',
        column: 'minmax(120px, 1fr)',
        label: 'Subtipo',
      },
      {
        id: 'severity',
        column: '50px',
        label: 'Sev.',
        sortField: 'SEVERITY',
        justifyContent: 'center',
      },
      {
        id: 'presentIn',
        column: 'minmax(250px, 1fr)',
        label: 'Presente em',
      },
      {
        id: 'status',
        column: '90px',
        label: 'Status',
        sortField: 'STATUS',
        justifyContent: 'center',
      },
      {
        id: 'edit',
        column: '80px',
        label: 'Ações',
        justifyContent: 'center',
      },
    ];
    return list;
  }, []);

  const visibleColumns = useMemo(
    () => allColumnDefs.filter((c) => !hiddenColumns[c.id]),
    [allColumnDefs, hiddenColumns],
  );

  const gridTemplate = useMemo(
    () => visibleColumns.map((c) => c.column).join(' '),
    [visibleColumns],
  );

  const columnPickerItems = useMemo(
    () =>
      allColumnDefs
        .filter((c) => c.id !== 'edit')
        .map((c) => ({ label: c.label, value: c.id })),
    [allColumnDefs],
  );

  const onSort = useCallback(
    (field: RiskRegisteredListSortBy, order: 'asc' | 'desc') => {
      const next = { field, order };
      setSort(next);
      saveRisksRegisteredSort(next);
      setPage(1);
    },
    [setPage],
  );

  const onClearTablePreferences = useCallback(() => {
    setSort(null);
    saveRisksRegisteredSort(null);
    setHiddenColumns({});
    saveRisksRegisteredHiddenColumns({});
    filterProps.clearFilter();
    setPage(1);
    if (typeof rowsPerPageProp !== 'number') {
      setPageSize(DEFAULT_RISKS_REGISTERED_PAGE_SIZE);
      saveRisksRegisteredPageSize(DEFAULT_RISKS_REGISTERED_PAGE_SIZE);
    }
  }, [filterProps, setPage, rowsPerPageProp]);

  const onHideColumn = useCallback((id: RiskRegisteredColumnId) => {
    setHiddenColumns((prev) => {
      const next = { ...prev, [id]: true };
      saveRisksRegisteredHiddenColumns(next);
      return next;
    });
  }, []);

  const setHiddenColumnsFromPicker = useCallback(
    (next: Record<RiskRegisteredColumnId, boolean>) => {
      setHiddenColumns(next);
      saveRisksRegisteredHiddenColumns(next);
    },
    [],
  );

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (!isAllowedRisksRegisteredPageSize(size)) return;
      setPageSize(size);
      saveRisksRegisteredPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const renderCell = (col: ColumnDef, row: IRiskFactors) => {
    switch (col.id) {
      case 'type':
        return <STagRisk key="type" hideRiskName riskFactor={row} />;
      case 'name':
        return <TextIconRow key="name" clickable text={row.name || '-'} />;
      case 'subtype': {
        const names =
          row.subTypes
            ?.map((s) => s?.sub_type?.name)
            .filter(Boolean)
            .join(', ') || '-';
        return (
          <TextIconRow key="subtype" clickable lineNumber={2} text={names} />
        );
      }
      case 'severity':
        return (
          <TextIconRow
            key="sev"
            justify="center"
            clickable
            text={row.severity || '-'}
          />
        );
      case 'presentIn':
        return (
          <Box key="present" onClick={(e) => e.stopPropagation()}>
            <SCheckRiskDocInfo
              onUnmount={upsertRiskDocInfo.isError}
              onSelectCheck={(docInfo) =>
                onChangeRiskDocInfo({
                  ...docInfo,
                  riskId: row.id,
                })
              }
              riskDocInfo={getRiskDoc(row, {
                companyId,
              })}
            />
          </Box>
        );
      case 'status':
        return (
          <StatusSelect
            key="status"
            large={false}
            sx={{ maxWidth: '90px' }}
            iconProps={{ sx: { fontSize: 10 } }}
            textProps={{ fontSize: 10 }}
            selected={effectiveRiskStatus(row)}
            statusOptions={[StatusEnum.ACTIVE, StatusEnum.INACTIVE]}
            handleSelectMenu={(option) =>
              handleEditStatus(row, option.value)
            }
            disabled={false}
          />
        );
      case 'edit':
        return (
          <Box key="edit" onClick={(e) => e.stopPropagation()}>
            <RiskActionsRow
              risk={row}
              companyId={companyId}
              onEdit={onEditRisk}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {!isSelect && (
        <STableTitle icon={SRiskFactorIcon}>
          Fatores de Risco e Perigos
        </STableTitle>
      )}
      <STableSearch
        onAddClick={onAddRisk}
        defaultValue={initialList.search}
        onChange={(e) => handleSearchChange(e.target.value)}
        filterProps={
          !isSelect
            ? { filters: registeredRisksFilterList, ...filterProps }
            : undefined
        }
        toolbarBeforeFilter={
          !isSelect ? (
            <>
              <FormControl size="small" sx={{ minWidth: 140, mr: 1 }}>
                <InputLabel id="risk-status-filter-label">Status</InputLabel>
                <Select
                  labelId="risk-status-filter-label"
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as RiskStatusFilter);
                    setPage(1);
                  }}
                >
                  <MenuItem value="ACTIVE">Ativos</MenuItem>
                  <MenuItem value="INACTIVE">Inativos</MenuItem>
                  <MenuItem value="ALL">Todos</MenuItem>
                </Select>
              </FormControl>
              <STableColumnsButton<RiskRegisteredColumnId>
                showLabel
                columns={columnPickerItems}
                hiddenColumns={
                  hiddenColumns as Record<RiskRegisteredColumnId, boolean>
                }
                setHiddenColumns={setHiddenColumnsFromPicker}
              />
            </>
          ) : undefined
        }
      >
        <STableButton
          tooltip="autualizar"
          onClick={() => {
            refetch();
            queryClient.invalidateQueries([QueryEnum.RISK, 'pagination']);
          }}
          loading={loadRisks || isFetching || isRefetching}
          icon={SReloadIcon}
          color="grey.500"
        />
      </STableSearch>
      {!isSelect && <FilterTagList filterProps={filterProps} />}
      <STable
        loading={loadRisks}
        rowsNumber={pageSize}
        columns={[
          ...(selectedData ? ['15px'] : []),
          ...visibleColumns.map((c) => c.column),
        ].join(' ')}
      >
        <STableHeader>
          {selectedData && <STableHRow key="check-col" />}
          {visibleColumns.map((col) =>
            col.id === 'edit' ? (
              <STableHRow key={col.id} justifyContent={col.justifyContent}>
                {col.label}
              </STableHRow>
            ) : (
              <TableSortColumnHeader<RiskRegisteredListSortBy>
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
        <STableBody<IRiskFactors>
          key={pageSize}
          rowsData={displayRisks}
          hideLoadMore
          rowsInitialNumber={pageSize}
          renderRow={(row) => {
            return (
              <STableRow
                onClick={() => onSelectRow(row)}
                clickable
                key={row.id}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={!!selectedData.find((exam) => exam.id === row.id)}
                  />
                )}
                {visibleColumns.map((col) => renderCell(col, row))}
              </STableRow>
            );
          }}
        />
      </STable>{' '}
      <STablePagination
        mt={2}
        registersPerPage={pageSize}
        totalCountOfRegisters={loadRisks ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
        {...(typeof rowsPerPageProp !== 'number' && {
          pageSizeOptions: RISKS_REGISTERED_TABLE_PAGE_SIZES,
          onRegistersPerPageChange,
        })}
      />
    </>
  );
};
