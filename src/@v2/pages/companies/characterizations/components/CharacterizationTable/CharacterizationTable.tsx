import { useRouter } from 'next/router';

import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableExportButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableExportButton/STableExportButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableButtonDivider } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButtonDivider/STableButtonDivider';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { setOrderByTable } from '@v2/components/organisms/STable/helpers/set-order-by-table.helper';
import { SCharacterizationTable } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable';
import { useApiStatus } from '@v2/hooks/useApiStatus';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ordenByTranslation } from '@v2/models/@shared/translations/orden-by.translation';
import { StatusTypeEnum } from '@v2/models/security/enums/status-type.enum';
import { ordenByCharacterizationTranslation } from '@v2/models/security/translations/orden-by-characterization.translation';
import { useFetchBrowseCharaterizations } from '@v2/services/security/characterization/browse/hooks/useFetchBrowseCharacterization';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { useCharacterizationActions } from '../../hooks/useCharacterizationActions';
import { ICharacterizationFilterProps } from './CharacterizationTable.types';
import { useOrderBy } from '@v2/hooks/useOrderBy';

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
      limit: queryParams.limit || 15,
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

  const onCleanQueryParams = () => {
    setQueryParams({ search: '', orderBy: [] });
  };

  return (
    <>
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => setQueryParams({ search })}
      >
        <STableSearchContent>
          <STableAddButton onClick={handleCharacterizationAdd} />
          <STableColumnsButton onClick={() => null} />
          <STableFilterButton onClick={() => null} />
          <STableButtonDivider />
          <STableExportButton onClick={handleCharacterizationExport} />
        </STableSearchContent>
      </STableSearch>
      <STableFilterChipList onClean={onCleanQueryParams}>
        {orderChipList?.map((chip) => (
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
        setPage={(page) => setQueryParams({ page })}
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
