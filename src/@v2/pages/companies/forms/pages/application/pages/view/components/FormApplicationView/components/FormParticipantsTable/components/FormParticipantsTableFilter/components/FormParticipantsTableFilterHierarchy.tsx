import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { IFormParticipantsFilterProps } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/SFormParticipantsTable.types';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { ActionPlanHierarchyBrowseResultModel } from '@v2/models/security/models/action-plan-hierarchy/action-plan-hierarchy-browse-result.model';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { useInfinityBrowseFormHierarchies } from '@v2/services/forms/hierarchy/browse-form-hierarchies/hooks/useInfinityBrowseFormHierarchies';
import { useState } from 'react';

interface FormParticipantsTableFilterHierarchyProps {
  companyId: string;
  onFilterData: (props: IFormParticipantsFilterProps) => void;
  filters: IFormParticipantsFilterProps;
}

export const hierarchyTypeLevel: Record<number, string> = {
  [0]: '',
  [1]: '->',
  [2]: '-->',
  [3]: '--->',
  [4]: '---->',
  [5]: '----->',
};

export const FormParticipantsTableFilterHierarchy = ({
  onFilterData,
  filters,
  companyId,
}: FormParticipantsTableFilterHierarchyProps) => {
  const [search, setSearch] = useState('');

  const { hierarchies, isFetching, fetchNextPage } =
    useInfinityBrowseFormHierarchies({
      companyId,
      filters: {
        search: search,
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

  return (
    <>
      <SSearchSelectMultiple
        value={filters.hierarchies || []}
        onScrollEnd={() => fetchNextPage()}
        boxProps={{ flex: 1 }}
        options={options}
        onSearch={setSearch}
        loading={isFetching}
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
          const fontSize = isOffice ? 14 : 11;
          return (
            <SFlex sx={{ position: 'sticky', alignItems: 'center' }}>
              <SText fontSize={11} color="grey.600">
                {hierarchyTypeLevel[0]}
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
