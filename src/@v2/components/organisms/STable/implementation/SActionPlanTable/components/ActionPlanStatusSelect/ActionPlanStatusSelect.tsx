import { SSelectButtonRow } from '@v2/components/organisms/STable/addons/addons-rows/SSelectButtonRow/SSelectButtonRow';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { useActionPlanStatusActions } from '@v2/pages/companies/action-plan/hooks/useActionPlanStatusActions';
import {
  ActionPlanStatusTypeList,
  ActionPlanStatusTypeMap,
} from '../../maps/action-plan-status-type-map';

export const ActionPlanStatusSelect = ({
  companyId,
  row,
}: {
  companyId: string;
  row: ActionPlanBrowseResultModel;
}) => {
  const { onEditActionPlanStatus, isLoading } = useActionPlanStatusActions({
    companyId,
  });

  return (
    <SSelectButtonRow
      loading={isLoading}
      label={ActionPlanStatusTypeMap[row.status].label}
      options={ActionPlanStatusTypeList}
      schema={ActionPlanStatusTypeMap[row.status].schema}
      onSelect={(status) => onEditActionPlanStatus({ uuid: row.uuid, status })}
      minWidth={95}
    />
  );
};
