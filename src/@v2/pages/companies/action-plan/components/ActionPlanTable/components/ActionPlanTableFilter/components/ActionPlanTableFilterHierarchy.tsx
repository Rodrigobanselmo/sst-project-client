import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { ActionPlanHierarchyBrowseResultModel } from '@v2/models/security/models/action-plan-hierarchy/action-plan-hierarchy-browse-result.model';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { useFetchListHierarchyTypes } from '@v2/services/enterprise/hierarchy/list-hierarchy-types/hooks/useFetchListHierarchyTypes';
import { useInfinityBrowseActionPlanHierarchies } from '@v2/services/security/action-plan/hierarchy/browse-action-plan-hierarchies/hooks/useInfinityBrowseActionPlanHierarchies';
import { useState } from 'react';

interface ActionPlanTableFilterHierarchyProps {
  companyId: string;
  workspaceId?: string;
  onFilterData: (props: IActionPlanFilterProps) => void;
  filters: IActionPlanFilterProps;
}

export const hierarchyTypeLevel: Record<number, string> = {
  [0]: '',
  [1]: '->',
  [2]: '-->',
  [3]: '--->',
  [4]: '---->',
  [5]: '----->',
};

export const ActionPlanTableFilterHierarchy = ({
  onFilterData,
  filters,
  companyId,
  workspaceId,
}: ActionPlanTableFilterHierarchyProps) => {
  const [search, setSearch] = useState('');

  const { types, isLoadingTypes } = useFetchListHierarchyTypes({
    companyId,
  });

  const { hierarchies, isFetching, fetchNextPage } =
    useInfinityBrowseActionPlanHierarchies({
      companyId,
      filters: {
        search: search,
        workspaceIds: workspaceId ? [workspaceId] : undefined,
      },
      pagination: {
        page: 1,
        limit: 24,
      },
    });

  const options =
    hierarchies?.pages.reduce((acc, page) => {
      return [...acc, ...page.results];
    }, [] as ActionPlanHierarchyBrowseResultModel[]) || [];

  console.log({ hierarchies: filters.hierarchies });

  return (
    <>
      <SSearchSelectMultiple
        value={filters.hierarchies || []}
        onScrollEnd={() => fetchNextPage()}
        boxProps={{ flex: 1 }}
        options={options}
        onSearch={setSearch}
        loading={isLoadingTypes || isFetching}
        label="Cargos/Setores..."
        popperItemProps={{
          sx: {
            p: 0,
            height: undefined,
            minHeight: undefined,
          },
        }}
        renderItem={({ option }) => {
          const type = (option as any).type;
          const isOffice = type === HierarchyTypeEnum.OFFICE;
          const index = types.findIndex((type) => type === type);
          const fontSize = isOffice ? 14 : 11;
          return (
            <SFlex sx={{ position: 'sticky', alignItems: 'center' }}>
              <SText fontSize={11} color="grey.600">
                {hierarchyTypeLevel[index]}
              </SText>
              <SText fontSize={11} color="grey.600">
                {hierarchyTypeTranslation[type]}:{' '}
              </SText>
              <SText fontSize={fontSize}>{option.name}</SText>
            </SFlex>
          );
        }}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        onChange={(option) => {
          onFilterData({
            hierarchies: option.map((res) => ({
              id: res.id,
              name: res.name,
            })),
          });
        }}
      />
    </>
  );
};
