import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { ITaskFilterProps } from '@v2/components/organisms/STable/implementation/STaskTable/STaskTable.types';
import { useFetchBrowseTaskResponsible } from '@v2/services/tasks/user/browse-responsibles/hooks/useFetchBrowseTaskResponsible';
import { useState } from 'react';

interface TaskTableFilterResponsibleProps {
  companyId: string;
  onFilterData: (props: ITaskFilterProps) => void;
  filters: ITaskFilterProps;
}

export const TaskTableFilterResponsible = ({
  onFilterData,
  filters,
  companyId,
}: TaskTableFilterResponsibleProps) => {
  const [search, setSearch] = useState('');

  const { responsible, isLoading } = useFetchBrowseTaskResponsible({
    companyId,
    filters: {
      search: search,
    },
    pagination: {
      page: 1,
      limit: 10,
    },
  });

  const options = [...(responsible?.results || [])].map((user) => ({
    id: user.id || -1,
    name: user.name,
    email: user.email,
  }));
  if (!search) options.unshift({ id: 0, name: 'Sem Responsável', email: '-' });

  return (
    <SSearchSelectMultiple
      value={filters.responsible || []}
      boxProps={{ flex: 1 }}
      options={options}
      onSearch={setSearch}
      loading={isLoading}
      label="Responsável"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      onChange={(option) =>
        onFilterData({
          responsible: option.map((res) => ({
            id: res.id,
            name: res.name,
          })),
        })
      }
    />
  );
};
