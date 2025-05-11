import { SSearchSelectButtonRow } from '@v2/components/organisms/STable/addons/addons-rows/SSearchSelectButtonRow/SSearchSelectButtonRow';
import { useTasksResponsibleActions } from '@v2/components/organisms/STable/implementation/STaskTable/hooks/useTasksResponsibleActions';
import { TaskBrowseResultModel } from '@v2/models/tasks/models/task/task-browse-result.model';
import { useFetchBrowseTaskResponsible } from '@v2/services/tasks/user/browse-responsibles/hooks/useFetchBrowseTaskResponsible';
import { useState } from 'react';

export const TaskResponsibleSelect = ({
  companyId,
  row,
  disabled,
}: {
  row: TaskBrowseResultModel;
  companyId: string;
  disabled?: boolean;
}) => {
  const [search, setSearch] = useState('');
  const { onEditTaskResponsible, isLoading: isLoadingEdit } =
    useTasksResponsibleActions({
      companyId,
    });

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

  return (
    <SSearchSelectButtonRow
      disabled={disabled}
      loading={isLoading || isLoadingEdit}
      onSearch={setSearch}
      label={row.responsible?.map((r) => r.name).join(', ') || '-'}
      options={responsible?.results || []}
      onSelect={(resp) =>
        onEditTaskResponsible({
          id: row.id,
          userId: resp?.id,
          employeeId: resp?.employeeId,
          email: resp?.email || '',
          name: resp?.name || '',
          _id: '',
        })
      }
      getOptionLabel={(resp) => resp.name}
      getOptionValue={(resp) => resp._id}
    />
  );
};
