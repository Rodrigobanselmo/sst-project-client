import { useRouter } from 'next/router';

import {
  STableFilterChip,
  STableFilterChipProps,
} from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableExportButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableExportButton/STableExportButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableButtonDivider } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButtonDivider/STableButtonDivider';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { SCharacterizationTable } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable';
import { useApiStatus } from '@v2/hooks/useApiStatus';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ordenByTranslation } from '@v2/models/@shared/translations/orden-by.translation';
import { StatusTypeEnum } from '@v2/models/security/enums/status-type.enum';
import { ordenByCharacterizationTranslation } from '@v2/models/security/translations/orden-by-characterization.translation';
import { useFetchBrowseCharaterizations } from '@v2/services/security/characterization/browse/hooks/useFetchBrowseCharacterization';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import { useRef, useState } from 'react';
import { useCharacterizationActions } from '../../hooks/useCharacterizationActions';
import { ICharacterizationFilterProps } from './CharacterizationTable.types';
import { SSelectMultiple } from '@v2/components/forms/SSelect/SSelectMultiple';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SInput } from '@v2/components/forms/SInput/SInput';
import { SAutocompleteSelect } from '@v2/components/forms/SAutocompleteSelect/SAutocompleteSelect';
import { SSearchSelect } from '@v2/components/forms/SSearchSelect/SSearchSelect';
import { SSearchSelectMultiple } from '@v2/components/forms/SSearchSelect/SSearchSelectMultiple';
import { useCharacterizationQueryParams } from './hooks/useCharacterizationQueryParams';
import { useQueryParams } from '@v2/hooks/useQueryParams';

const limit = 15;

export const CharacterizationTable = () => {
  const router = useRouter();

  const companyId = router.query.companyId as string;
  const workspaceId = router.query.workspaceId as string;

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

  const selectedStages =
    characterizations?.filters?.stages?.filter((stage) =>
      queryParams.stageIds?.includes(stage.id),
    ) || [];

  const { onCleanQueryParams, onFilterQueryParams, paramsChipList } =
    useQueryParams({
      queryParams,
      setQueryParams,
      chipMap: {
        stageIds: (value) => ({
          leftLabel: 'Status',
          label: selectedStages.find((stage) => stage.id === value)?.name || '',
          onDelete: () =>
            setQueryParams({
              stageIds: queryParams.stageIds?.filter((id) => id !== value),
            }),
        }),
        limit: null,
        orderBy: null,
        page: null,
        search: null,
      },
      cleanParams: {
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
        onSearch={(search) => onFilterQueryParams({ search })}
      >
        <STableSearchContent>
          <STableAddButton onClick={handleCharacterizationAdd} />
          <STableColumnsButton onClick={() => null} />
          <STableFilterButton onClick={() => null}>
            <SFlex direction="column" gap={4} width={300}>
              <SSearchSelectMultiple
                label="Status"
                value={selectedStages}
                getOptionLabel={(option) => option?.name}
                getOptionValue={(option) => option?.id}
                onChange={(option) =>
                  onFilterQueryParams({ stageIds: option.map((o) => o.id) })
                }
                onInputChange={(value) => console.log(value)}
                placeholder="selecione um ou mais status"
                options={characterizations?.filters?.stages || []}
              />
            </SFlex>
          </STableFilterButton>
          <STableButtonDivider />
          <STableExportButton onClick={handleCharacterizationExport} />
        </STableSearchContent>
      </STableSearch>
      <STableFilterChipList onClean={onCleanQueryParams}>
        {[...orderChipList, ...paramsChipList]?.map((chip) => (
          <STableFilterChip
            key={1}
            leftLabel={chip.leftLabel}
            label={chip.label}
            onDelete={chip.onDelete}
          />
        ))}
      </STableFilterChipList>
      <SCharacterizationTable
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
        orderBy={queryParams.orderBy}
        setPage={(page) => onFilterQueryParams({ page })}
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
