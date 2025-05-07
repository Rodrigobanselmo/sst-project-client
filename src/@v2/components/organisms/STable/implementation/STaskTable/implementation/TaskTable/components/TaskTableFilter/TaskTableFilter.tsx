import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSwitch } from '@v2/components/forms/fields/SSwitch/SSwitch';
import { ITaskFilterProps } from '@v2/components/organisms/STable/implementation/STaskTable/STaskTable.types';
import { TaskTableFilterPriority } from './components/TaskTableFilterPriority';
import { TaskTableFilterResponsible } from './components/TaskTableFilterResponsible';
import { TaskTableFilterStatus } from './components/TaskTableFilterStatus';

interface TaskTableFilterProps {
  onFilterData: (props: ITaskFilterProps) => void;
  filters: ITaskFilterProps;
  companyId: string;
  status: {
    id: number;
    name: string;
    color?: string;
  }[];
  selectedStatus: {
    id: number;
    name: string;
    color?: string;
  }[];
}

export const TaskTableFilter = ({
  onFilterData,
  filters,
  companyId,
  status,
  selectedStatus,
}: TaskTableFilterProps) => {
  return (
    <SFlex direction="column" gap={4} width={400} pb={10}>
      <TaskTableFilterResponsible
        filters={filters}
        onFilterData={onFilterData}
        companyId={companyId}
      />
      <TaskTableFilterStatus
        selectedStatus={selectedStatus}
        status={status}
        onFilterData={onFilterData}
      />
      <TaskTableFilterPriority filters={filters} onFilterData={onFilterData} />
      <SSwitch
        label="Filtrar somente itens Expirados"
        value={!!filters.isExpired}
        formControlProps={{ sx: { mx: 1, mt: 2 } }}
        onChange={(e) => onFilterData({ isExpired: e.target.checked })}
      />
    </SFlex>
  );
};
