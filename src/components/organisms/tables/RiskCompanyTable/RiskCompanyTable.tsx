import { FC, useCallback, useMemo, useState } from 'react';

import { Box, BoxProps } from '@mui/material';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import SCheckBox from 'components/atoms/SCheckBox';
import SFlex from 'components/atoms/SFlex';
import { SSwitch } from 'components/atoms/SSwitch';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { STag } from 'components/atoms/STag';
import { ITagActionColors } from 'components/atoms/STag/types';
import { STagRisk } from 'components/atoms/STagRisk';
import SText from 'components/atoms/SText';
import { SCheckRiskDocInfo } from 'components/molecules/SCheckRiskDocInfo';
import { useOpenRiskTool } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/hooks/useOpenRiskTool';
import { TableSortColumnHeader } from 'components/organisms/tables/common/TableSortColumnHeader';

import { SRiskFactorIcon } from 'assets/icons/SRiskFactorIcon';

import { QueryEnum } from 'core/enums/query.enums';
import { usePushRoute } from 'core/hooks/actions-push/usePushRoute';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { useThrottle } from 'core/hooks/useThrottle';
import { IRiskDocInfo, IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useMutUpsertRiskDocInfo } from 'core/services/hooks/mutations/checklist/risk/useMutUpsertRiskDocInfo';
import { IQueryExam } from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { useQueryRiskGroupData } from 'core/services/hooks/queries/useQueryRiskGroupData';
import { useQueryRisksCompany } from 'core/services/hooks/queries/useQueryRisksCompany/useQueryRisksCompany';
import { queryClient } from 'core/services/queryClient';

import {
  DEFAULT_RISKS_IDENTIFIED_PAGE_SIZE,
  isAllowedRisksIdentifiedPageSize,
  loadRisksIdentifiedHiddenColumns,
  loadRisksIdentifiedPageSize,
  loadRisksIdentifiedSort,
  RISKS_IDENTIFIED_TABLE_PAGE_SIZES,
  saveRisksIdentifiedHiddenColumns,
  saveRisksIdentifiedPageSize,
  saveRisksIdentifiedSort,
  StoredRiskIdentifiedSort,
} from './identifiedRisksTable.storage';
import {
  RiskIdentifiedColumnId,
  RiskIdentifiedListSortBy,
} from './identifiedRisksTable.types';

export const getRiskDoc = (
  risk: IRiskFactors,
  {
    companyId,
    hierarchyId,
    firstHierarchy,
  }: { companyId?: string; hierarchyId?: string; firstHierarchy?: boolean },
) => {
  if (firstHierarchy || hierarchyId) {
    const data = risk?.docInfo?.find(
      (i) =>
        i.hierarchyId && (hierarchyId ? i.hierarchyId == hierarchyId : true),
    );
    if (data) return data;
  }

  if (companyId) {
    const first = risk?.docInfo?.find(
      (i) => !i.hierarchyId && i.companyId === companyId,
    );
    if (first) return first;
  }

  const second = risk?.docInfo?.find((i) => !i.hierarchyId);
  if (second) return second;

  return risk;
};

type ColumnDef = {
  id: RiskIdentifiedColumnId;
  column: string;
  label: string;
  sortField?: RiskIdentifiedListSortBy;
  justifyContent?: BoxProps['justifyContent'];
};

export const RiskCompanyTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (risk: IRiskFactors) => void;
      selectedData?: IRiskFactors[];
      query?: IQueryExam;
    }
> = ({ rowsPerPage: rowsPerPageProp, onSelectData, selectedData }) => {
  const [showOrigins, setShowRiskExam] = useState(false);
  const [openId, setOpenId] = useState('');
  const { data: riskGroupData } = useQueryRiskGroupData();

  const riskGroupId = riskGroupData?.[riskGroupData.length - 1]?.id;
  const { handleOpenAddRiskModal } = usePushRoute();
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const { onOpenRiskToolSelected } = useOpenRiskTool();

  const isSelect = !!onSelectData;
  const upsertRiskDocInfo = useMutUpsertRiskDocInfo();

  const [sort, setSort] = useState<StoredRiskIdentifiedSort | null>(() =>
    loadRisksIdentifiedSort(),
  );
  const [hiddenColumns, setHiddenColumns] = useState<
    Partial<Record<RiskIdentifiedColumnId, boolean>>
  >(() => loadRisksIdentifiedHiddenColumns());

  const [pageSize, setPageSize] = useState(() =>
    typeof rowsPerPageProp === 'number'
      ? rowsPerPageProp
      : loadRisksIdentifiedPageSize(),
  );

  const queryWithSort = useMemo(
    () => ({
      search,
      ...(sort && {
        listSortBy: sort.field,
        listSortOrder: sort.order,
      }),
    }),
    [search, sort],
  );

  const {
    data: risks,
    isLoading: loadRisks,
    count,
    companyId,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryRisksCompany(page, queryWithSort, pageSize);

  const onChangeRiskDocInfo = (docInfo: Partial<IRiskDocInfo>) => {
    if (!docInfo.riskId) return;

    upsertRiskDocInfo.mutateAsync({
      ...docInfo,
      riskId: docInfo.riskId,
    });
  };

  const onAddRisk = () => {
    handleOpenAddRiskModal();
  };

  const onSelectRow = (risk: IRiskFactors) => {
    if (isSelect) {
      onSelectData(risk);
    }

    return setOpenId(risk.id);
  };

  const allColumnDefs: ColumnDef[] = useMemo(
    () => [
      {
        id: 'type',
        column: '40px',
        label: 'Tipo',
        sortField: 'TYPE',
      },
      {
        id: 'name',
        column: 'minmax(250px, 400px)',
        label: 'Nome',
        sortField: 'NAME',
      },
    ],
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

  const columnPickerItems = useMemo(
    () => allColumnDefs.map((c) => ({ label: c.label, value: c.id })),
    [allColumnDefs],
  );

  const onSort = useCallback(
    (field: RiskIdentifiedListSortBy, order: 'asc' | 'desc') => {
      const next = { field, order };
      setSort(next);
      saveRisksIdentifiedSort(next);
      setPage(1);
    },
    [setPage],
  );

  const onClearTablePreferences = useCallback(() => {
    setSort(null);
    saveRisksIdentifiedSort(null);
    setHiddenColumns({});
    saveRisksIdentifiedHiddenColumns({});
    setPage(1);
    setShowRiskExam(false);
    setOpenId('');
    if (typeof rowsPerPageProp !== 'number') {
      setPageSize(DEFAULT_RISKS_IDENTIFIED_PAGE_SIZE);
      saveRisksIdentifiedPageSize(DEFAULT_RISKS_IDENTIFIED_PAGE_SIZE);
    }
  }, [setPage, rowsPerPageProp]);

  const onHideColumn = useCallback((id: RiskIdentifiedColumnId) => {
    setHiddenColumns((prev) => {
      const next = { ...prev, [id]: true };
      saveRisksIdentifiedHiddenColumns(next);
      return next;
    });
  }, []);

  const setHiddenColumnsFromPicker = useCallback(
    (next: Record<RiskIdentifiedColumnId, boolean>) => {
      setHiddenColumns(next);
      saveRisksIdentifiedHiddenColumns(next);
    },
    [],
  );

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (!isAllowedRisksIdentifiedPageSize(size)) return;
      setPageSize(size);
      saveRisksIdentifiedPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const onRefetchThrottle = useThrottle(() => {
    refetch();
    queryClient.invalidateQueries([QueryEnum.RISK, 'pagination']);
  }, 1000);

  const renderMainCells = (row: IRiskFactors) =>
    visibleColumns.map((col) => {
      if (col.id === 'type') {
        return <STagRisk key="type" hideRiskName riskFactor={row} />;
      }
      return (
        <TextIconRow key="name" clickable text={row.name || '-'} />
      );
    });

  return (
    <>
      {!isSelect && (
        <STableTitle
          subtitle="Lista de fatores de risco e perigos identificados na empresa"
          icon={SRiskFactorIcon}
        >
          Fatores de risco e perigos
        </STableTitle>
      )}
      <STableSearch
        onAddClick={onAddRisk}
        onChange={(e) => handleSearchChange(e.target.value)}
        loadingReload={loadRisks || isFetching || isRefetching}
        onReloadClick={onRefetchThrottle}
        toolbarBeforeFilter={
          !isSelect ? (
            <STableColumnsButton<RiskIdentifiedColumnId>
              showLabel
              columns={columnPickerItems}
              hiddenColumns={
                hiddenColumns as Record<RiskIdentifiedColumnId, boolean>
              }
              setHiddenColumns={setHiddenColumnsFromPicker}
            />
          ) : undefined
        }
      >
        <SFlex justify="end" flex={1}>
          <SSwitch
            onChange={() => {
              setShowRiskExam(!showOrigins);
            }}
            label="Expandir Todos"
            checked={showOrigins}
            sx={{ mr: 4 }}
            color="text.light"
          />
        </SFlex>
      </STableSearch>
      <STable
        loading={loadRisks}
        rowsNumber={pageSize}
        columns={
          [
            ...(selectedData ? ['15px'] : []),
            ...visibleColumns.map((c) => c.column),
          ].join(' ')
        }
      >
        <STableHeader>
          {selectedData && <STableHRow key="check-col" />}
          {visibleColumns.map((col) => (
            <TableSortColumnHeader<RiskIdentifiedListSortBy>
              key={col.id}
              label={col.label}
              sortField={col.sortField}
              activeSort={sort}
              justifyContent={col.justifyContent}
              onSort={onSort}
              onHideColumn={() => onHideColumn(col.id)}
              onClearTable={onClearTablePreferences}
            />
          ))}
        </STableHeader>
        <STableBody<(typeof risks)[0]>
          key={pageSize}
          rowsData={risks}
          hideLoadMore
          rowsInitialNumber={pageSize}
          renderRow={(row) => {
            const isOpen = showOrigins || openId === row.id;
            return (
              <>
                <STableRow
                  onClick={() => onSelectRow(row)}
                  clickable
                  key={row.id}
                  minHeight={40}
                >
                  {selectedData && (
                    <SCheckBox
                      label=""
                      checked={
                        !!selectedData.find((exam) => exam.id === row.id)
                      }
                    />
                  )}
                  {renderMainCells(row)}
                  {isOpen && (
                    <Box gridColumn="1 / -1" mb={6} mt={-1}>
                      {row?.riskFactorData?.map((riskData) => {
                        return (
                          <SFlex
                            direction="row"
                            align="center"
                            key={riskData.id}
                            gap={2}
                          >
                            <SText lineHeight="1.4rem" fontSize={11} mt={0}>
                              <b>Origem:</b>{' '}
                              <SText
                                component="span"
                                sx={{
                                  borderRadius: '4px',
                                  mr: 1,
                                  backgroundColor: 'background.box',
                                  px: 3,
                                  py: '1px',
                                  border: '1px solid',
                                  borderColor: 'grey.400',
                                  '&:hover': {
                                    textDecoration: 'underline',
                                  },
                                }}
                                fontSize={11}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenRiskToolSelected({
                                    homogeneousGroup: riskData.homogeneousGroup,
                                    riskFactor: row,
                                    riskGroupId,
                                  });
                                }}
                              >
                                {riskData.origin || ''}
                              </SText>
                            </SText>
                            <STag
                              action={
                                String(
                                  riskData.level,
                                ) as unknown as ITagActionColors
                              }
                              minHeight={10}
                              display="inline-block"
                              text={''}
                              minWidth={10}
                              sx={{ p: 0, m: 0 }}
                            />
                          </SFlex>
                        );
                      })}
                    </Box>
                  )}
                  {isOpen && (
                    <Box gridColumn="1 / -1" mb={6} mt={-1}>
                      <SFlex gap={'10px'} flexWrap="wrap">
                        <Box
                          sx={{
                            backgroundColor: 'grey.100',
                            padding: '5px 10px 0px',
                            borderRadius: 1,
                          }}
                        >
                          <SText fontSize={13} mb={-2}>
                            Empresa
                          </SText>
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

                        {row?.docInfo?.map((docInfo) => {
                          if (!docInfo.hierarchyId) return null;
                          return (
                            <Box
                              key={docInfo.id}
                              sx={{
                                backgroundColor: 'grey.100',
                                padding: '5px 10px 0px',
                                borderRadius: 1,
                              }}
                            >
                              <SText fontSize={13} mb={-2}>
                                (Cargo) {docInfo?.hierarchy?.name}
                              </SText>
                              <SCheckRiskDocInfo
                                onUnmount={upsertRiskDocInfo.isError}
                                onSelectCheck={(docInfo) =>
                                  onChangeRiskDocInfo({
                                    ...docInfo,
                                    riskId: row.id,
                                    hierarchyId: docInfo.hierarchyId,
                                  })
                                }
                                riskDocInfo={docInfo}
                              />
                            </Box>
                          );
                        })}
                      </SFlex>
                    </Box>
                  )}
                </STableRow>
              </>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={pageSize}
        totalCountOfRegisters={loadRisks ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
        {...(typeof rowsPerPageProp !== 'number' && {
          pageSizeOptions: RISKS_IDENTIFIED_TABLE_PAGE_SIZES,
          onRegistersPerPageChange,
        })}
      />
    </>
  );
};
