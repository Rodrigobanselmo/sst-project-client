import { SDatePickerRow } from '@v2/components/organisms/STable/addons/addons-rows/SDatePickerRow/SDatePickerRow';
import { TaskBrowseResultModel } from '@v2/models/tasks/models/task/task-browse-result.model';
import { useTaskEndDateActions } from '@v2/components/organisms/STable/implementation/STaskTable/hooks/useTaskEndDateActions';

export const TaskValidDateSelect = ({
  companyId,
  row,
}: {
  companyId: string;
  row: TaskBrowseResultModel;
}) => {
  const { onEditTaskEndDate, isLoading } = useTaskEndDateActions({
    companyId,
  });

  return (
    <SDatePickerRow
      loading={isLoading}
      emptyDate="SEM PRAZO"
      date={row.endDate || null}
      onChange={(date) =>
        onEditTaskEndDate({
          id: row.id,
          endDate: date,
        })
      }
    />
  );
};
