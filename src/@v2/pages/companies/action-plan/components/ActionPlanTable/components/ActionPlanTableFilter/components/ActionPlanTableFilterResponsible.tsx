import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { useInfinityBrowseResponsibles } from '@v2/services/security/action-plan/user/browse-responsibles/hooks/useInfinityBrowseResponsibles';
import { useState } from 'react';

interface ActionPlanTableFilterResponsibleProps {
  companyId: string;
  onFilterData: (props: IActionPlanFilterProps) => void;
  filters: IActionPlanFilterProps;
}

export const ActionPlanTableFilterResponsible = ({
  onFilterData,
  filters,
  companyId,
}: ActionPlanTableFilterResponsibleProps) => {
  const [search, setSearch] = useState('');

  const {
    responsible: responsibles,
    isFetching,
    fetchNextPage,
  } = useInfinityBrowseResponsibles({
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
    responsibles?.pages.reduce(
      (acc, page) => {
        const results = [...(page.results || [])].map((user) => ({
          id: `${user.userId || -1}--${user.employeeId}`,
          name: user.name,
          email: user.email,
        }));

        return [...acc, ...results];
      },
      [] as {
        id: string;
        name: string;
        email: string;
      }[],
    ) || [];

  if (!search)
    options.unshift({
      id: '0--0',
      name: 'Sem Responsável',
      email: '-',
    });

  return (
    <SSearchSelectMultiple
      value={filters.responsibles || []}
      onScrollEnd={() => fetchNextPage()}
      boxProps={{ flex: 1 }}
      options={options}
      onSearch={setSearch}
      loading={isFetching}
      label="Responsável"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      onChange={(option) =>
        onFilterData({
          responsibles: option.map((res) => ({
            id: res.id.split('--')[0],
            name: res.name,
          })),
        })
      }
    />
  );
};
