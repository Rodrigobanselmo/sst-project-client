import { SSelectButtonRow } from '@v2/components/organisms/STable/addons/addons-rows/SSelectButtonRow/SSelectButtonRow';
import { CommentBrowseResultModel } from '@v2/models/security/models/comment/comment-browse-result.model';
import { useActionPlanStatusActions } from '@v2/pages/companies/action-plan/hooks/useActionPlanStatusActions';
import {
  CommentApprovedMap,
  CommentMapList,
} from '../../maps/comment-approved-status-map';

export const CommentApproveSelect = ({
  companyId,
  row,
}: {
  companyId: string;
  row: CommentBrowseResultModel;
}) => {
  const { onEditActionPlanStatus, isLoading } = useActionPlanStatusActions({
    companyId,
  });

  return (
    <SSelectButtonRow
      loading={isLoading}
      label={CommentApprovedMap[row.approvedStatus].label}
      options={CommentMapList}
      schema={CommentApprovedMap[row.approvedStatus].schema}
      onSelect={(status) => onEditActionPlanStatus({ uuid: row.uuid, status })}
      minWidth={95}
    />
  );
};
