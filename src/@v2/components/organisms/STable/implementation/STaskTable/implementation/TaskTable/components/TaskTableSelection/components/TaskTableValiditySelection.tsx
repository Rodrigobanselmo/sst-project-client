import { SIconDate } from '@v2/assets/icons/SIconDate/SIconDate';
import { SIconStatus } from '@v2/assets/icons/SIconStatus/SIconStatus';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SDatePickerPopper } from '@v2/components/forms/fields/SDatePicker/SDatePickerPopper';
import {
  IActionPlanUUIDParams,
  useActionPlanValidityActions,
} from '@v2/pages/companies/action-plan/hooks/useActionPlanValidityActions';
import { useTaskEndDateActions } from '@v2/components/organisms/STable/implementation/STaskTable/hooks/useTaskEndDateActions';

interface TaskTableSelectionProps {
  selectedIds: number[];
  companyId: string;
}

export const TaskTableValiditySelection = ({
  selectedIds,
  companyId,
}: TaskTableSelectionProps) => {
  const { onEditManyTaskEndDate, isLoading: isLoadingStatus } =
    useTaskEndDateActions({ companyId });

  return (
    <SDatePickerPopper
      value={new Date()}
      onChange={(date) => {
        if (date)
          onEditManyTaskEndDate({
            endDate: date,
            ids: selectedIds,
          });
      }}
    >
      <SButton
        icon={<SIconDate />}
        loading={isLoadingStatus}
        color="paper"
        variant="outlined"
        text="Atualizar Prazo"
      />
    </SDatePickerPopper>
  );
};
