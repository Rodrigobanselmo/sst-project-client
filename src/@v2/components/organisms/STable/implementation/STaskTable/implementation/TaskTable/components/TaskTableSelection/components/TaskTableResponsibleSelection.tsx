import { SIconUser } from '@v2/assets/icons/SIconUser/SIconUser';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { useTasksResponsibleActions } from '@v2/components/organisms/STable/implementation/STaskTable/hooks/useTasksResponsibleActions';
import { useFetchBrowseTaskResponsible } from '@v2/services/tasks/user/browse-responsibles/hooks/useFetchBrowseTaskResponsible';
import { useState } from 'react';

interface TaskTableSelectionProps {
  selectedIds: number[];
  companyId: string;
}

export const TaskTableResponsibleSelection = ({
  selectedIds,
  companyId,
}: TaskTableSelectionProps) => {
  const [search, setSearch] = useState('');
  const { onEditManyTaskResponsible, isLoading: isLoadingEdit } =
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
    <SSearchSelect
      inputProps={{ sx: { width: 300 } }}
      options={responsible?.results || []}
      onSearch={setSearch}
      loading={isLoading || isLoadingEdit}
      label="Responsável"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option._id}
      onChange={(option) => {
        onEditManyTaskResponsible({
          ids: selectedIds,
          userId: option?.id,
          employeeId: option?.employeeId,
          email: option?.email || '',
          name: option?.name || '',
          _id: '',
        });
      }}
      component={() => (
        <SButton
          icon={<SIconUser />}
          color="paper"
          variant="outlined"
          text="Atualizar Responsável"
        />
      )}
    />
  );
};
