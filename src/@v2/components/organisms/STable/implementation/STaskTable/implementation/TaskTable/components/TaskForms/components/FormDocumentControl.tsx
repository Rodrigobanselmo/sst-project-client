import { SFormRow } from '@v2/components/forms/components/SFormRow/SFormRow';
import { SDatePickerForm } from '@v2/components/forms/controlled/SDatePickerForm/SDatePickerForm';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';
import { SSearchSelectForm } from '@v2/components/forms/controlled/SSearchSelectForm/SSearchSelectForm';
import { SSelectStatusForm } from '@v2/components/forms/controlled/SSelectStatusForm/SSelectStatusForm';
import { useApiStatus } from '@v2/hooks/useApiStatus';
import { StatusTypeEnum } from '@v2/models/security/enums/status-type.enum';
import { useFetchBrowseTaskResponsible } from '@v2/services/tasks/user/browse-responsibles/hooks/useFetchBrowseTaskResponsible';
import { useState } from 'react';
import { TaskPriorityList } from '../../../../../maps/task-priority-map';

interface Props {
  companyId: string;
}

export const FormTask = ({ companyId }: Props) => {
  const [search, setSearch] = useState('');

  const {
    onAddStatus,
    onEditStatus,
    onDeleteStatus,
    statusOptions,
    isLoadingStatusOptions,
  } = useApiStatus({
    companyId,
    type: StatusTypeEnum.TASK_ACTION_PLAN,
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
    <>
      <SInputMultilineForm
        label="Descrição"
        placeholder="descrição"
        fullWidth
        autoFocus
        inputProps={{ minRows: 46, autoFocus: true }}
        name="description"
      />

      <SFormRow>
        <SSearchSelectForm
          boxProps={{ flex: 1 }}
          label="Prioridade"
          placeholder="selecione a prioridade"
          name="priority"
          options={TaskPriorityList}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
        />
        <SDatePickerForm
          boxProps={{ flex: 1 }}
          label="Prazo"
          name="endDate"
          autoFocus={false}
        />
        <SSelectStatusForm
          name="status"
          placeholder=""
          label="Status"
          popperStatusProps={{
            onAdd: ({ value }) => onAddStatus(value),
            onDelete: (id) => onDeleteStatus(id),
            onEdit: ({ color, value, id }) =>
              onEditStatus({ id, color, name: value }),
            options: statusOptions,
            isLoading: isLoadingStatusOptions,
          }}
        />
      </SFormRow>
      <SSearchSelectForm
        name="responsible"
        label="Responsável"
        placeholder="selecione o responsável"
        boxProps={{ onClick: (e) => e.stopPropagation() }}
        loading={isLoading}
        getOptionLabel={(resp) => resp.name}
        getOptionValue={(resp) => resp._id}
        onSearch={setSearch}
        options={responsible?.results || []}
      />
    </>
  );
};
