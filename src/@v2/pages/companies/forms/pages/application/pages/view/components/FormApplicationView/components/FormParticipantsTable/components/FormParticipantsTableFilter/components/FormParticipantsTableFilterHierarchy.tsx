import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { ActionPlanHierarchyBrowseResultModel } from '@v2/models/security/models/action-plan-hierarchy/action-plan-hierarchy-browse-result.model';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { useInfinityBrowseFormHierarchies } from '@v2/services/forms/hierarchy/browse-form-hierarchies/hooks/useInfinityBrowseFormHierarchies';
import { useMemo, useState } from 'react';

type HierarchyFilterValue = {
  id: string;
  name: string;
  type?: HierarchyTypeEnum;
};

interface FormParticipantsTableFilterHierarchyProps {
  companyId: string;
  label: string;
  allowedTypes: HierarchyTypeEnum[];
  workspaceIds?: string[];
  value: HierarchyFilterValue[];
  onChange: (selected: HierarchyFilterValue[]) => void;
}

export const FormParticipantsTableFilterHierarchy = ({
  companyId,
  label,
  allowedTypes,
  workspaceIds,
  value,
  onChange,
}: FormParticipantsTableFilterHierarchyProps) => {
  const [search, setSearch] = useState('');

  const { hierarchies, isFetching, fetchNextPage } =
    useInfinityBrowseFormHierarchies({
      companyId,
      filters: {
        search,
        type: allowedTypes,
        workspaceIds: workspaceIds?.length ? workspaceIds : undefined,
      },
      pagination: {
        page: 1,
        limit: 50,
      },
    });

  const options = useMemo(() => {
    return (
      hierarchies?.pages.reduce((acc, page) => {
        return [...acc, ...page.results];
      }, [] as ActionPlanHierarchyBrowseResultModel[]) ?? []
    );
  }, [hierarchies?.pages]);

  return (
    <SSearchSelectMultiple
      value={value}
      onScrollEnd={() => fetchNextPage()}
      boxProps={{ flex: 1 }}
      options={options}
      onSearch={setSearch}
      loading={isFetching}
      label={label}
      popperItemProps={{
        sx: {
          p: 0,
          height: undefined,
          minHeight: undefined,
        },
      }}
      renderItem={({ option }) => {
        const type = (option as ActionPlanHierarchyBrowseResultModel).type;
        const isOffice = type === HierarchyTypeEnum.OFFICE;
        const fontSize = isOffice ? 14 : 11;
        return (
          <SFlex sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
            <SText fontSize={11} color="grey.700" sx={{ fontWeight: 600 }}>
              {hierarchyTypeTranslation[type]}:
            </SText>
            <SText fontSize={fontSize}>{option.name}</SText>
          </SFlex>
        );
      }}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      onChange={(option) => {
        onChange(
          option.map((res) => ({
            id: res.id,
            name: res.name,
            type: (res as ActionPlanHierarchyBrowseResultModel).type,
          })),
        );
      }}
    />
  );
};
