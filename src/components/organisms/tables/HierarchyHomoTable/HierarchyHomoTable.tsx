import { FC, useCallback, useMemo, useState } from 'react';

import { Box, BoxProps } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import { STable, STableBody, STableRow } from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import SText from 'components/atoms/SText';
import { useStartEndDate } from 'components/organisms/modals/ModalAddCharacterization/hooks/useStartEndDate';
import dayjs from 'dayjs';

import { SDeleteIcon } from 'assets/icons/SDeleteIcon';

import { originRiskMap } from 'core/constants/maps/origin-risk';
import { usePreventAction } from 'core/hooks/usePreventAction';
import { useTableSearch } from 'core/hooks/useTableSearch';
import { IHierarchyOnHomogeneous } from 'core/interfaces/api/IGho';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { useMutDeleteHierarchyGho } from 'core/services/hooks/mutations/checklist/gho/useMutDeleteHierarchyGho/useMutDeleteHierarchyGho';
import { useMutUpdateHierarchyGho } from 'core/services/hooks/mutations/checklist/gho/useMutUpdateHierarchyGho/useMutUpdateHierarchyGho';
import { dateToString } from 'core/utils/date/date-format';
import { sortDate } from 'core/utils/sorts/data.sort';
import { sortString } from 'core/utils/sorts/string.sort';
import { CHARACTERIZATION_LINK_CLEANUP_TEXTS } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-link-cleanup.util';

import {
  formatCharacterizationSectorGroupedRow,
  formatHierarchyFullContextLabel,
  formatHierarchySectorCargoLabel,
} from './format-hierarchy-cargo-path.util';
import {
  insertWorkspaceGroupHeaders,
  sortHierarchyHomoRowsByWorkspaceGroup,
} from './group-hierarchy-homo-rows.util';
import { paginateHierarchyHomoRows } from './paginate-hierarchy-homo-rows.util';
import {
  canUnlinkGseHierarchyRow,
  formatGseUnlinkOtherWorkspaceTooltip,
} from './can-unlink-gse-hierarchy-row.util';
import {
  resolveHierarchyWorkspaceGroupId,
  UNGROUPED_WORKSPACE_ID,
  UNGROUPED_WORKSPACE_NAME,
} from './resolve-hierarchy-workspace-group.util';

const HIERARCHY_HOMO_PAGE_SIZES = [15, 25, 50, 100] as const;
const DEFAULT_HIERARCHY_HOMO_PAGE_SIZE = 15;

export const HierarchyHomoTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (company: IHierarchy) => void;
      selectedData?: IHierarchy[];
      // query?: IQueryExam;
      onAdd?: () => void;
      hierarchies: IHierarchy[];
      loading: boolean;
      isCreate?: boolean;
      /** Quando definido, fixa o tamanho da página e oculta o seletor. */
      fixedRowsPerPage?: number;
      /** Chamado após remoção bem-sucedida de um vínculo (não em isCreate). */
      onUnlinkSuccess?: (payload: {
        removedLinkId: number;
        remainingActiveCount: number;
      }) => void;
      /** Opt-in do editor GSE: agrupa por estabelecimento. */
      groupByWorkspace?: boolean;
      /** Opt-in (Elemento Caracterizável): agrupa por setor. */
      groupBySector?: boolean;
      preferredWorkspaceId?: string;
      gseWorkspaceIds?: string[];
      workspaceNamesById?: Record<string, string>;
    }
> = ({
  rowsPerPage: rowsPerPageProp,
  fixedRowsPerPage,
  onAdd,
  selectedData,
  onSelectData,
  loading,
  hierarchies,
  isCreate,
  onUnlinkSuccess,
  groupByWorkspace = false,
  groupBySector = false,
  preferredWorkspaceId,
  gseWorkspaceIds,
  workspaceNamesById,
}) => {
  const [pageSize, setPageSize] = useState(() =>
    typeof fixedRowsPerPage === 'number'
      ? fixedRowsPerPage
      : typeof rowsPerPageProp === 'number'
        ? rowsPerPageProp
        : DEFAULT_HIERARCHY_HOMO_PAGE_SIZE,
  );

  const isSelect = !!onSelectData;
  const { selectStartEndDate } = useStartEndDate();
  const updateMutation = useMutUpdateHierarchyGho();
  const deleteMutation = useMutDeleteHierarchyGho();
  const { preventDelete } = usePreventAction();

  // const {
  //   data: exams,
  //   isLoading: loading,
  //   count,
  // } = useQueryExams(page, { search }, rowsPerPage);
  // const count = hierarchies.length;

  // const { onStackOpenModal } = useModal();

  const onAddExam = () => {
    onAdd?.();
    // onStackOpenModal(ModalEnum.EXAMS_ADD, {} as typeof initialExamState);
  };

  const onEdit = (h: IHierarchy & IHierarchyOnHomogeneous) => {
    selectStartEndDate(
      (data) => {
        updateMutation.mutate({
          ids: [h.id],
          endDate: data.endDate,
          startDate: data.startDate,
          companyId: h.companyId,
        });
      },
      {
        endDate: h.endDate ? dayjs(h.endDate).toDate() : undefined,
        startDate: h.startDate ? dayjs(h.startDate).toDate() : undefined,
      },
    );
  };

  const data = useMemo(() => {
    const rows = hierarchies.reduce((acc, curr) => {
      const newData = curr.hierarchyOnHomogeneous?.map((h) => ({
        ...curr,
        ...h,
      })) || [curr];

      return [...acc, ...(newData || [])];
    }, [] as any[]);

    if (!groupByWorkspace && !groupBySector) return rows;

    const linkedWorkspaceIds = gseWorkspaceIds || [];

    return rows.map((row) => {
      const fullPath = [row, ...(row.parents || [])].reverse();

      if (groupByWorkspace) {
        const path = formatHierarchySectorCargoLabel(row);
        const workspaceGroupId = resolveHierarchyWorkspaceGroupId({
          hierarchyWorkspaceIds: [
            ...((row.workspaceIds || []) as string[]),
            ...(
              (row.workspaces || []).map(
                (workspace: { id: string }) => workspace.id,
              ) || []
            ),
          ],
          gseWorkspaceIds: linkedWorkspaceIds,
          preferredWorkspaceId,
        });

        const workspaceGroupName =
          workspaceNamesById?.[workspaceGroupId] ||
          (workspaceGroupId === UNGROUPED_WORKSPACE_ID
            ? UNGROUPED_WORKSPACE_NAME
            : workspaceGroupId);

        return {
          ...row,
          ...path,
          fullPath,
          workspaceGroupId,
          workspaceGroupName,
          searchText: `${workspaceGroupName} ${path.displayName} ${row.name || ''}`,
        };
      }

      const grouped = formatCharacterizationSectorGroupedRow(row);

      return {
        ...row,
        sectorName: grouped.sectorName,
        cargoName: grouped.cargoName,
        displayName: grouped.displayName,
        fullPath,
        workspaceGroupId: grouped.sectorGroupId || UNGROUPED_WORKSPACE_ID,
        workspaceGroupName: grouped.sectorGroupName,
        searchText: `${grouped.sectorGroupName} ${grouped.subSectorName} ${grouped.displayName} ${row.name || ''}`,
      };
    });
  }, [
    groupBySector,
    groupByWorkspace,
    gseWorkspaceIds,
    hierarchies,
    preferredWorkspaceId,
    workspaceNamesById,
  ]);

  const searchableData = useMemo(() => {
    if (!groupByWorkspace && !groupBySector) return data;

    return sortHierarchyHomoRowsByWorkspaceGroup(
      data,
      groupByWorkspace ? preferredWorkspaceId : undefined,
    );
  }, [data, groupBySector, groupByWorkspace, preferredWorkspaceId]);

  const onDelete = (h: IHierarchy & IHierarchyOnHomogeneous) => {
    if (isCreate) {
      return;
    }

    const remainingActiveBefore = data.filter(
      (row: IHierarchy & IHierarchyOnHomogeneous) =>
        !row.endDate && row.id !== h.id,
    ).length;

    deleteMutation.mutate(
      {
        ids: [h.id],
        companyId: h.companyId,
      },
      {
        onSuccess: () => {
          onUnlinkSuccess?.({
            removedLinkId: h.id,
            remainingActiveCount: remainingActiveBefore,
          });
        },
      },
    );
  };

  const onSelectRow = (hier: IHierarchy & IHierarchyOnHomogeneous) => {
    if (isSelect) {
      onSelectData(hier);
    } else onEdit(hier);
  };

  const { handleSearchChange, results, page, setPage } = useTableSearch({
    rowsPerPage: groupByWorkspace || groupBySector ? 0 : pageSize,
    data: searchableData,
    keys: groupByWorkspace || groupBySector
      ? ['name', 'label', 'displayName', 'workspaceGroupName', 'searchText']
      : ['name', 'label'],
    shouldSort: !(groupByWorkspace || groupBySector),
  });

  const showPageSizeSelector =
    typeof fixedRowsPerPage !== 'number' && typeof rowsPerPageProp !== 'number';

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (
        !(HIERARCHY_HOMO_PAGE_SIZES as readonly number[]).includes(size)
      ) {
        return;
      }
      setPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const getName = (row: IHierarchy) => {
    const parents = row?.parents || [];
    const fullPath = [row, ...parents].reverse();

    const sector = row?.parents?.find((p) => p.type == 'SECTOR');
    const sub_sector = row?.parents?.find((p) => p.type == 'SUB_SECTOR');
    const path = [row.name];
    if (sub_sector?.name) path.push(sub_sector?.name);
    if (sector?.name) path.push(sector?.name);

    const name =
      row.type == 'OFFICE'
        ? path.reverse().join(' --> ')
        : `${path.length > 1 ? path.reverse().join(' --> ') : row.name} (${
            originRiskMap[row.type]?.name
          })`;
    return { fullPath, name };
  };

  const rowsData = useMemo(() => {
    if (!groupByWorkspace && !groupBySector) {
      return results
        .map((r) => ({ ...r, ...getName(r) }))
        .sort((a, b) => sortDate(b?.endDate, a?.endDate))
        .sort((a, b) => sortString(a?.name, b?.name));
    }

    return insertWorkspaceGroupHeaders(
      paginateHierarchyHomoRows(results, page, pageSize),
    );
  }, [groupBySector, groupByWorkspace, page, pageSize, results]);

  return (
    <>
      <STableSearch
        onAddClick={onAddExam}
        onChange={(e) => handleSearchChange(e.target.value)}
        addText="Editar cargos"
      />
      <STable
        loading={loading}
        rowsNumber={pageSize}
        columns={`${
          selectedData ? '15px ' : ''
        }minmax(250px, 5fr) 120px 120px 50px`}
      >
        <STableBody<any>
          key={
            groupByWorkspace || groupBySector
              ? `gse-cargos-${page}-${pageSize}-${rowsData.length}-${groupBySector ? 'sector' : 'ws'}`
              : undefined
          }
          rowsData={rowsData}
          rowsInitialNumber={
            groupByWorkspace || groupBySector
              ? rowsData.length || pageSize
              : pageSize
          }
          hideLoadMore
          renderRow={(row) => {
            if (row.kind === 'group') {
              return (
                <STableRow key={row.id} clickable={false}>
                  <Box sx={{ gridColumn: '1 / -1', py: 1 }}>
                    <SText fontWeight="600" fontSize={13}>
                      {row.workspaceGroupName}
                    </SText>
                  </Box>
                </STableRow>
              );
            }

            const cargoRow = groupByWorkspace || groupBySector
              ? row
              : { ...row, ...getName(row) };
            const displayName = groupByWorkspace || groupBySector
              ? cargoRow.displayName || cargoRow.cargoName || cargoRow.name
              : cargoRow.name;
            const fullPath = cargoRow.fullPath || [
              cargoRow,
              ...(cargoRow.parents || []),
            ].reverse();
            const contextLabel = groupByWorkspace
              ? formatHierarchyFullContextLabel({
                  workspaceName: cargoRow.workspaceGroupName,
                  sectorName: cargoRow.sectorName,
                  cargoName: cargoRow.cargoName,
                })
              : '';
            const canUnlink = canUnlinkGseHierarchyRow({
              groupByWorkspace,
              preferredWorkspaceId,
              rowWorkspaceGroupId: cargoRow.workspaceGroupId,
            });

            const indentSx = groupByWorkspace || groupBySector ? { pl: 3 } : undefined;

            return (
              <STableRow
                onClick={() => onSelectRow(cargoRow)}
                clickable
                key={cargoRow.id}
                status={cargoRow.endDate ? 'inactive' : 'none'}
              >
                {selectedData && (
                  <SCheckBox
                    label=""
                    checked={!!selectedData.find((exam) => exam.id === cargoRow.id)}
                  />
                )}
                <TextIconRow
                  clickable
                  tooltipTitle={
                    <Box>
                      {groupByWorkspace && contextLabel && (
                        <SText fontSize={12} color="white" mb={1}>
                          {contextLabel}
                        </SText>
                      )}
                      {fullPath.map((p: IHierarchy) => (
                        <SText fontSize={10} color="white" key={p.name}>
                          {originRiskMap[p.type]?.name || p.type}:{' '}
                          <SText color="white" component="span" fontSize={12}>
                            {p.name}
                          </SText>
                        </SText>
                      ))}
                    </Box>
                  }
                  text={displayName || '-'}
                  tooltipProps={{
                    minLength: 10,
                  }}
                  sx={indentSx}
                />
                <TextIconRow
                  clickable
                  text={`inicio: ${dateToString(cargoRow.startDate)}`}
                />
                <TextIconRow
                  clickable
                  text={`fim: ${dateToString(cargoRow.endDate)}`}
                />
                {!isCreate && (
                  <IconButtonRow
                    icon={<SDeleteIcon />}
                    disabled={!canUnlink}
                    tooltipTitle={
                      canUnlink
                        ? 'deletar'
                        : formatGseUnlinkOtherWorkspaceTooltip(
                            cargoRow.workspaceGroupName,
                          )
                    }
                    sx={{ svg: { fontSize: 18 }, height: 20 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!canUnlink || isCreate) return;
                      const texts = CHARACTERIZATION_LINK_CLEANUP_TEXTS.quickUnlink;
                      preventDelete(
                        () => onDelete(cargoRow),
                        `${texts.body}\n\nCargo: ${cargoRow.name || '-'}`,
                        {
                          title: texts.title,
                          confirmText: texts.confirm,
                          confirmCancel: texts.cancel,
                        },
                      );
                    }}
                  />
                )}
              </STableRow>
            );
          }}
        />
      </STable>
      <STablePagination
        mt={2}
        registersPerPage={pageSize}
        totalCountOfRegisters={loading ? undefined : data.length}
        currentPage={page}
        onPageChange={setPage}
        {...(showPageSizeSelector && {
          pageSizeOptions: [...HIERARCHY_HOMO_PAGE_SIZES],
          onRegistersPerPageChange,
        })}
      />
    </>
  );
};
