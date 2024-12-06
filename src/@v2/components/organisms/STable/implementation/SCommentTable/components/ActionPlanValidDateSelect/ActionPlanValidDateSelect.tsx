import { SDatePickerRow } from '@v2/components/organisms/STable/addons/addons-rows/SDatePickerRow/SDatePickerRow';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { useActionPlanValidityActions } from '@v2/pages/companies/action-plan/hooks/useActionPlanValidityActions';

export const ActionPlanValidDateSelect = ({
  companyId,
  row,
}: {
  companyId: string;
  row: ActionPlanBrowseResultModel;
}) => {
  const { onEditActionPlanValidy, isLoading } = useActionPlanValidityActions({
    companyId,
  });

  return (
    <SDatePickerRow
      loading={isLoading}
      emptyDate="SEM PRAZO"
      date={row.validDate}
      onChange={(date) =>
        onEditActionPlanValidy({
          uuid: row.uuid,
          valdityEndDate: date,
        })
      }
    />
  );
};
