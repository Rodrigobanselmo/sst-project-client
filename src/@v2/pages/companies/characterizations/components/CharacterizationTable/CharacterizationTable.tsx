import { useRouter } from 'next/router';

import { SIconStatus } from '@v2/assets/icons/SIconStatus/SIconStatus';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSearchSelectRenderOptionStatusRenderOptionStatus } from '@v2/components/forms/SSearchSelect/addons/render-option/RenderOptionStatus/RenderOptionStatus';
import { SSearchSelect } from '@v2/components/forms/SSearchSelect/SSearchSelect';
import { SSearchSelectMultiple } from '@v2/components/forms/SSearchSelect/SSearchSelectMultiple';
import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableExportButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableExportButton/STableExportButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableButtonDivider } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButtonDivider/STableButtonDivider';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { STableSelection } from '@v2/components/organisms/STable/addons/addons-table/STableSelectionUpdate/STableSelectionUpdate';
import {
  TablesSelectEnum,
  useTableSelect,
} from '@v2/components/organisms/STable/hooks/useTableSelect';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { CharacterizationColumnsEnum } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/enums/characterization-columns.enum';
import { characterizationColumns } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/maps/characterization-column-map';
import { SCharacterizationTable } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable';
import { ICharacterizationTableTableProps } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable.types';
import { useApiStatus } from '@v2/hooks/useApiStatus';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ordenByTranslation } from '@v2/models/@shared/translations/orden-by.translation';
import { StatusTypeEnum } from '@v2/models/security/enums/status-type.enum';
import { ordenByCharacterizationTranslation } from '@v2/models/security/translations/orden-by-characterization.translation';
import { useFetchBrowseCharaterizations } from '@v2/services/security/characterization/browse/hooks/useFetchBrowseCharacterization';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import { useEffect, useState } from 'react';
import { useCharacterizationActions } from '../../hooks/useCharacterizationActions';
import { ICharacterizationFilterProps } from './CharacterizationTable.types';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { CharacterizationTableSelection } from './components/CharacterizationTableSelection/CharacterizationTableSelection';
import { CharacterizationTableFilter } from './components/CharacterizationTableFilter/CharacterizationTableFilter';
import { CharacterizationTableFilterStage } from './components/CharacterizationTableFilter/components/CharacterizationTableFilterStage';
import { Box } from '@mui/material';

const limit = 15;
const table = TablesSelectEnum.CHARACTERIZATION;

export const CharacterizationTable = () => {
  const router = useRouter();

  const companyId = router.query.companyId as string;
  const workspaceId = router.query.workspaceId as string;

  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<CharacterizationColumnsEnum, boolean>
  >(persistKeys.COLUMNS_CHARACTERIZATION, {} as any);

  const [multipleUpdateData, setMultipleUpdateData] = useState<{
    stageId?: number | null;
  }>({});

  const { queryParams, setQueryParams } =
    useQueryParamsState<ICharacterizationFilterProps>();

  const { characterizations, isLoading } = useFetchBrowseCharaterizations({
    companyId,
    workspaceId,
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
      limit: queryParams.limit || limit,
    },
  });

  const {
    handleCharacterizationAdd,
    handleCharacterizationEdit,
    handleCharacterizationEditStage,
    handleCharacterizationEditPosition,
    handleCharacterizationExport,
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
    getLabel: ({ order }) => ordenByTranslation[order],
    getLeftLabel: ({ field }) => ordenByCharacterizationTranslation[field],
  });

  const stages = characterizations?.filters?.stages || [];
  const selectedStages =
    stages.filter((stage) => queryParams.stageIds?.includes(stage.id)) || [];

  const { onCleanData, onFilterData, paramsChipList } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
      stageIds: (value) => ({
        leftLabel: 'Status',
        label: selectedStages.find((stage) => stage.id === value)?.name || '',
        onDelete: () =>
          setQueryParams({
            stageIds: queryParams.stageIds?.filter((id) => id !== value),
          }),
      }),
    },
    cleanData: {
      search: '',
      orderBy: [],
      stageIds: [],
      page: 1,
      limit,
    },
  });

  return (
    <>
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => onFilterData({ search })}
      >
        <STableSearchContent>
          <STableAddButton onClick={handleCharacterizationAdd} />
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
          <STableButtonDivider />
          <STableExportButton onClick={handleCharacterizationExport} />
        </STableSearchContent>
      </STableSearch>
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
        <CharacterizationTableSelection table={table} stages={stages} />
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
        onSelectRow={(row) => handleCharacterizationEdit(row)}
        onEditStage={(stageId, row) =>
          handleCharacterizationEditStage({ ...row, stageId })
        }
        onEditPosition={(order, row) =>
          handleCharacterizationEditPosition({ ...row, order })
        }
        data={characterizations?.results}
        isLoading={isLoading}
        pagination={characterizations?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
        statusButtonProps={{
          onAdd: ({ value }) => onAddStatus(value),
          onDelete: (id) => onDeleteStatus(id),
          onEdit: ({ color, value, id }) =>
            onEditStatus({ id, color, name: value }),
          options: statusOptions,
          isLoading: isLoadingStatusOptions,
        }}
      />
    </>
  );
};
