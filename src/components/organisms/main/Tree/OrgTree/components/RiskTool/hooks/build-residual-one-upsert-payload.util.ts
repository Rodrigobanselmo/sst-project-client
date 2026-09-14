import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import { getEmbeddedWorkspaceIdFromTreeId } from '../../../utils/get-org-workspace-id';
import { ViewsDataEnum } from '../utils/view-data-type.constant';

export const buildResidualOneUpsertPayload = (
  riskData: IRiskData,
  riskId: string,
  riskGroupId: string,
  viewDataType: ViewsDataEnum,
): IUpsertRiskData => {
  const homogeneousGroupId = String(riskData.homogeneousGroupId).split('//')[0];

  const payload: IUpsertRiskData = {
    id: riskData.id,
    probabilityAfter: 1,
    riskId,
    riskFactorGroupDataId: riskGroupId,
    homogeneousGroupId,
  };

  if (viewDataType === ViewsDataEnum.HIERARCHY && riskData.hierarchyId) {
    const workspaceId =
      getEmbeddedWorkspaceIdFromTreeId(riskData.hierarchyId) ||
      getEmbeddedWorkspaceIdFromTreeId(riskData.homogeneousGroupId);
    if (workspaceId) {
      return {
        ...payload,
        type: HomoTypeEnum.HIERARCHY,
        workspaceId,
      };
    }
  }

  return payload;
};
