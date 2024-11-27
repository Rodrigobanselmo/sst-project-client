import { SIconDate } from '@v2/assets/icons/SIconDate/SIconAdd';
import { SIconStatus } from '@v2/assets/icons/SIconStatus/SIconStatus';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SDatePickerPopper } from '@v2/components/forms/fields/SDatePicker/SDatePickerPopper';
import {
  IActionPlanUUIDParams,
  useActionPlanValidityActions,
} from '@v2/pages/companies/action-plan/hooks/useActionPlanValidityActions';

interface ActionPlanTableSelectionProps {
  getIds: () => IActionPlanUUIDParams[];
  companyId: string;
}

export const ActionPlanTableValiditySelection = ({
  getIds,
  companyId,
}: ActionPlanTableSelectionProps) => {
  const { onEditManyActionPlanValidy, isLoading: isLoadingStatus } =
    useActionPlanValidityActions({ companyId });

  return (
    <SDatePickerPopper
      value={new Date()}
      onChange={(date) => {
        if (date)
          onEditManyActionPlanValidy({
            valdityEndDate: date,
            uuids: getIds(),
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
