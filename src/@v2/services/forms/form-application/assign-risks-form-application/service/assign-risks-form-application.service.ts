import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

interface RiskAssignmentItem {
  riskId: string;
  probability: number;
  hierarchyId: string;
}

export interface AssignRisksFormApplicationParams {
  companyId: string;
  applicationId: string;
  risks: RiskAssignmentItem[];
}

export async function assignRisksFormApplication({
  companyId,
  applicationId,
  risks,
}: AssignRisksFormApplicationParams) {
  await api.post(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_ASSIGN_RISKS,
      pathParams: { companyId, applicationId },
    }),
    { risks },
  );
}
