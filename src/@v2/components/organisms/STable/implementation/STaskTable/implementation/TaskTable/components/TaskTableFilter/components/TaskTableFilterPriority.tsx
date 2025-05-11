import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { TaskPriorityList } from '@v2/components/organisms/STable/implementation/STaskTable/maps/task-priority-map';
import { ITaskFilterProps } from '@v2/components/organisms/STable/implementation/STaskTable/STaskTable.types';

interface TaskTableFilterPriorityProps {
  onFilterData: (props: ITaskFilterProps) => void;
  filters: ITaskFilterProps;
}

export const TaskTableFilterPriority = ({
  onFilterData,
  filters,
}: TaskTableFilterPriorityProps) => {
  const values =
    filters.priorities
      ?.map(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (v) => TaskPriorityList.find((option) => option.value == v)!,
      )
      .filter(Boolean) || [];

  return (
    <SSearchSelectMultiple
      label="Prioridade"
      value={values}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      onChange={(option) =>
        onFilterData({ priorities: option.map((o) => o.value) })
      }
      boxProps={{ flex: 1 }}
      placeholder="selecione"
      options={TaskPriorityList}
    />
  );
};
