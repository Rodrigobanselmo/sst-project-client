import { useRouter } from 'next/router';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';

import { Box } from '@mui/material';
import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';
import { STableButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/STableButton';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableExportButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableExportButton/STableExportButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableButtonDivider } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButtonDivider/STableButtonDivider';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { TablesSelectEnum } from '@v2/components/organisms/STable/hooks/useTableSelect';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { CharacterizationColumnsEnum } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/enums/characterization-columns.enum';
import { characterizationColumns } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/maps/characterization-column-map';
import { SCharacterizationTable } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable';
import { ICharacterizationFilterProps } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable.types';
import { useApiStatus } from '@v2/hooks/useApiStatus';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { orderByTranslation } from '@v2/models/.shared/translations/orden-by.translation';
import { StatusTypeEnum } from '@v2/models/security/enums/status-type.enum';
import { ordenByCharacterizationTranslation } from '@v2/models/security/translations/orden-by-characterization.translation';
import { useFetchBrowseCharaterizations } from '@v2/services/security/characterization/characterization/browse-characterization/hooks/useFetchBrowseCharacterization';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/characterization/browse-characterization/service/browse-characterization.types';
import { useFetchBrowseAllWorkspaces } from '@v2/services/enterprise/workspace/browse-all-workspaces/hooks/useFetchBrowseAllWorkspaces';
import { useCharacterizationActions } from '../../hooks/useCharacterizationActions';
import { CharacterizationTableFilter } from './components/CharacterizationTableFilter/CharacterizationTableFilter';
import { CharacterizationTableFilterStage } from './components/CharacterizationTableFilter/components/CharacterizationTableFilterStage';
import { CharacterizationTableSelection } from './components/CharacterizationTableSelection/CharacterizationTableSelection';
import { useCallback, useEffect, useMemo } from 'react';

const table = TablesSelectEnum.CHARACTERIZATION;

const CARACTERIZACAO_ROOT_PATHNAME =
  '/dashboard/empresas/[companyId]/caracterizacao';

export const CharacterizationTable = () => {
  const router = useRouter();

  const companyId = router.query.companyId as string;
  const workspaceId =
    (router.query.workspaceId as string | undefined) ||
    (router.query.tabWorkspaceId as string | undefined);
  const hasWorkspaceSelected = !!workspaceId;

  const { workspaces, isLoadingAllWorkspaces } = useFetchBrowseAllWorkspaces({
    companyId: companyId || '',
  });

  const soleEstablishmentId = useMemo(() => {
    if (workspaces?.results?.length !== 1) return undefined;
    return workspaces.results[0]?.id;
  }, [workspaces?.results]);

  useEffect(() => {
    if (router.pathname !== CARACTERIZACAO_ROOT_PATHNAME) return;
    if (isLoadingAllWorkspaces || !soleEstablishmentId) return;
    if (router.query.tabWorkspaceId || router.query.workspaceId) return;

    const nextQuery = { ...router.query };
    nextQuery.tabWorkspaceId = soleEstablishmentId;
    void router.replace(
      { pathname: router.pathname, query: nextQuery },
      undefined,
      { shallow: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: sync URL once when sole establishment resolves
  }, [
    isLoadingAllWorkspaces,
    soleEstablishmentId,
    router.pathname,
    router.query.tabWorkspaceId,
    router.query.workspaceId,
  ]);

  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<CharacterizationColumnsEnum, boolean>
  >(persistKeys.COLUMNS_CHARACTERIZATION, {} as any);

  const { queryParams, setQueryParams } =
    useQueryParamsState<ICharacterizationFilterProps>();

  const {
    pageLimit,
    pageSizeOptions,
    resetPersistedLimit,
    createPageSizeChangeHandler,
    defaultLimit,
  } = useTablePageLimit(queryParams.limit, persistKeys.LIMIT_CHARACTERIZATION);

  const { characterizations, isLoading } = useFetchBrowseCharaterizations(
    {
      companyId,
      workspaceId: workspaceId || '',
      filters: {
        search: queryParams.search,
        stageIds: queryParams.stageIds,
      },
      orderBy: queryParams.orderBy || [
        {
          field: CharacterizationOrderByEnum.TYPE,
          order: 'asc',
        },
        {
          field: CharacterizationOrderByEnum.ORDER,
          order: 'asc',
        },
        {
          field: CharacterizationOrderByEnum.NAME,
          order: 'asc',
        },
      ],
      pagination: {
        page: queryParams.page || 1,
        limit: pageLimit,
      },
    },
    {
      enabled: hasWorkspaceSelected,
    },
  );

  const {
    handleCharacterizationAdd,
    handleCharacterizationEdit,
    handleCharacterizationEditStage,
    handleCharacterizationEditPosition,
    handleCharacterizationExport,
    handleCharacterizationEditMany,
    handleCharacterizationCopy,
    handleCharacterizationDeleteMany,
  } = useCharacterizationActions({ companyId, workspaceId });

  const {
    onAddStatus,
    onEditStatus,
    onDeleteStatus,
    statusOptions,
    isLoadingStatusOptions,
  } = useApiStatus({
    companyId,
    type: StatusTypeEnum.CHARACTERIZATION,
  });

  const { onOrderBy, orderChipList } = useOrderBy({
    orderByList: queryParams.orderBy,
    setOrderBy: (orderBy) => setQueryParams({ orderBy }),
    getLabel: ({ order }) => orderByTranslation[order],
    getLeftLabel: ({ field }) => ordenByCharacterizationTranslation[field],
  });

  const stages = hasWorkspaceSelected
    ? characterizations?.filters?.stages || []
    : [];
  const selectedStages =
    stages.filter((stage) => queryParams.stageIds?.includes(stage.id)) || [];

  const {
    onCleanData: resetFromTableState,
    onFilterData,
    paramsChipList,
  } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
      stageIds: (value) => ({
        leftLabel: 'Status',
        label: selectedStages.find((stage) => stage.id === value)?.name || '',
        onDelete: () =>
          setQueryParams({
            page: 1,
            stageIds: queryParams.stageIds?.filter((id) => id !== value),
          }),
      }),
    },
    cleanData: {
      search: '',
      orderBy: [],
      stageIds: [],
      page: 1,
      limit: defaultLimit,
    },
  });

  const onCleanData = useCallback(() => {
    resetPersistedLimit();
    resetFromTableState();
  }, [resetPersistedLimit, resetFromTableState]);

  const onPageSizeChange = createPageSizeChangeHandler(onFilterData);

  return (
    <>
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => onFilterData({ search })}
      >
        <STableSearchContent>
          {hasWorkspaceSelected && (
            <>
              <STableAddButton onClick={handleCharacterizationAdd} />
              <STableButton
                onClick={handleCharacterizationCopy}
                text="Copiar caracterização"
                icon={<ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />}
                color="success"
              />
            </>
          )}
          <STableColumnsButton
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            columns={characterizationColumns}
          />
          <STableFilterButton>
            <CharacterizationTableFilter
              onFilterData={onFilterData}
              selectedStages={selectedStages}
              stages={stages}
            />
          </STableFilterButton>
          {hasWorkspaceSelected && (
            <>
              <STableButtonDivider />
              <STableExportButton onClick={handleCharacterizationExport} />
            </>
          )}
        </STableSearchContent>
      </STableSearch>
      {!hasWorkspaceSelected && (
        <Box mb={2} mt={1} color="text.secondary" fontSize={13}>
          Selecione um estabelecimento no header para carregar os ambientes e
          atividades.
        </Box>
      )}
      <STableInfoSection>
        <STableFilterChipList onClean={onCleanData}>
          {[...orderChipList, ...paramsChipList]?.map((chip) => (
            <STableFilterChip
              key={1}
              leftLabel={chip.leftLabel}
              label={chip.label}
              onDelete={chip.onDelete}
            />
          ))}
        </STableFilterChipList>
        <CharacterizationTableSelection
          onEditMany={handleCharacterizationEditMany}
          onDeleteMany={handleCharacterizationDeleteMany}
          table={table}
          stages={hasWorkspaceSelected ? statusOptions : []}
        />
      </STableInfoSection>
      <SCharacterizationTable
        table={table}
        filterColumns={{
          [CharacterizationColumnsEnum.STAGE]: (
            <Box mx={4} mt={2} mb={2} width={250}>
              <CharacterizationTableFilterStage
                selectedStages={selectedStages}
                stages={stages}
                onFilterData={onFilterData}
              />
            </Box>
          ),
        }}
        filters={queryParams}
        setFilters={onFilterData}
        setHiddenColumns={setHiddenColumns}
        hiddenColumns={hiddenColumns}
        onSelectRow={(row) =>
          hasWorkspaceSelected && handleCharacterizationEdit(row)
        }
        onEditStage={(stageId, row) =>
          handleCharacterizationEditStage({ ...row, stageId })
        }
        onEditPosition={(order, row) =>
          handleCharacterizationEditPosition({ ...row, order })
        }
        data={hasWorkspaceSelected ? characterizations?.results : []}
        isLoading={hasWorkspaceSelected ? isLoading : false}
        pagination={
          hasWorkspaceSelected ? characterizations?.pagination : undefined
        }
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
        statusButtonProps={{
          onAdd: ({ value }) =>
            hasWorkspaceSelected && (onAddStatus(value) as any),
          onDelete: (id) => hasWorkspaceSelected && (onDeleteStatus(id) as any),
          onEdit: ({ color, value, id }) =>
            hasWorkspaceSelected &&
            (onEditStatus({ id, color, name: value }) as any),
          options: hasWorkspaceSelected ? statusOptions : [],
          isLoading: hasWorkspaceSelected ? isLoadingStatusOptions : false,
        }}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
};
