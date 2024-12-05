import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { useFetchBrowseResponsibles } from '@v2/services/security/action-plan/user/browse-responsibles/hooks/useFetchBrowseResponsibles';
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

  const { responsibles, isLoading } = useFetchBrowseResponsibles({
    companyId,
    filters: {
      search: search,
    },
    pagination: {
      page: 1,
      limit: 10,
    },
  });

  const options = [...(responsibles?.results || [])];
  if (!search) options.unshift({ id: 0, name: 'Sem Responsável', email: '-' });

  return (
    <SSearchSelectMultiple
      value={filters.responsibles || []}
      boxProps={{ flex: 1 }}
      options={options}
      onSearch={setSearch}
      loading={isLoading}
      label="Responsável"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      onChange={(option) =>
        onFilterData({
          responsibles: option.map((res) => ({
            id: res.id,
            name: res.name,
          })),
        })
      }
    />
  );
};
