import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { useInfinityBrowseGenerateSources } from '@v2/services/security/action-plan/generate-source/browse-generate-sources/hooks/useInfinityBrowseGenerateSources';
import { SText } from '@v2/components/atoms/SText/SText';
import { useState } from 'react';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import STooltip from '@v2/components/atoms/STooltip/STooltip';
import { GenerateSourceBrowseResultModel } from '@v2/models/security/models/generate-source';

interface ActionPlanTableFilterGenerateSourceProps {
  companyId: string;
  onFilterData: (props: IActionPlanFilterProps) => void;
  filters: IActionPlanFilterProps;
}

export const ActionPlanTableFilterGenerateSource = ({
  onFilterData,
  filters,
  companyId,
}: ActionPlanTableFilterGenerateSourceProps) => {
  const [search, setSearch] = useState('');

  const { generateSources, isFetching, fetchNextPage } =
    useInfinityBrowseGenerateSources({
      companyId,
      filters: {
        search: search,
      },
      pagination: {
        page: 1,
        limit: 15,
      },
    });

  const options =
    generateSources?.pages.reduce((acc, page) => {
      const results = [...(page.results || [])];

      return [...acc, ...results];
    }, [] as GenerateSourceBrowseResultModel[]) || [];

  return (
    <SSearchSelectMultiple
      value={
        (filters.generateSources as GenerateSourceBrowseResultModel[]) || []
      }
      onScrollEnd={() => fetchNextPage()}
      boxProps={{ flex: 1 }}
      options={options}
      onSearch={setSearch}
      loading={isFetching}
      label="Fonte Geradora"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      renderItem={({ label, option }) => (
        <STooltip title={label} minLength={100} placement="left-end">
          <SFlex maxWidth={400} direction={'column'}>
            <SText fontSize={14} lineNumber={2} color="text.primary">
              {label}
            </SText>
            <SText fontSize={11} lineNumber={2} color="text.secondary">
              {option.risk?.type} - {option.risk?.name}
            </SText>
          </SFlex>
        </STooltip>
      )}
      onChange={(option) =>
        onFilterData({
          generateSources: option.map((source) => ({
            id: source.id,
            name: source.name,
          })),
        })
      }
    />
  );
};
