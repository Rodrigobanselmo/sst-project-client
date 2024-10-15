import { STableFilterChipProps } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ICharacterizationFilterProps } from '../CharacterizationTable.types';
import { getQueryParamsChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/utils/get-query-params-chip-list';
import { CharacterizationBrowseModel } from '@v2/models/security/models/characterization/characterization-browse.model';

export const useCharacterizationQueryParams = ({
  characterizations,
  queryParams,
  setQueryParams,
}: {
  characterizations: CharacterizationBrowseModel | undefined;
  queryParams: ICharacterizationFilterProps;
  setQueryParams: (values: ICharacterizationFilterProps) => void;
}) => {
  const onFilterQueryParams = (props: ICharacterizationFilterProps) => {
    setQueryParams({ page: 1, ...props });
  };

  const onCleanQueryParams = () => {
    const clearParams: Required<ICharacterizationFilterProps> = {
      search: '',
      orderBy: [],
      stageIds: [],
      page: 1,
      limit: 15,
    };

    setQueryParams(clearParams);
  };

  const selectedStages =
    characterizations?.filters?.stages?.filter((stage) =>
      queryParams.stageIds?.includes(stage.id),
    ) || [];

  const paramsChipList = getQueryParamsChipList(queryParams, {
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
  });

  return {
    paramsChipList,
    onFilterQueryParams,
    onCleanQueryParams,
    selectedStages,
  };
};
