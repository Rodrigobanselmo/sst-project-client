import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { MedTypeEnum } from 'project/enum/medType.enum';
import { RecTypeEnum } from 'project/enum/recType.enum';

export interface ApplyAiAnalysisAsRiskDataParams {
  companyId: string;
  applicationId: string;
  hierarchyId: string;
  riskId: string;
  probability?: number;
  generateSourcesAddOnly?: { name: string }[];
  engsAddOnly?: {
    medName?: string;
    medType?: MedTypeEnum;
    companyId?: string;
  }[];
  recAddOnly?: {
    recName?: string;
    recType?: RecTypeEnum;
    companyId?: string;
  }[];
  admsAddOnly?: {
    recName?: string;
    recType?: RecTypeEnum;
    companyId?: string;
  }[];
}

export interface ApplyAiAnalysisAsRiskDataResponse {
  success: boolean;
  operationalCompanyId: string;
  riskFactorDataId?: string;
}

export async function applyAiAnalysisAsRiskData({
  companyId,
  applicationId,
  hierarchyId,
  riskId,
  probability,
  generateSourcesAddOnly,
  engsAddOnly,
  recAddOnly,
  admsAddOnly,
}: ApplyAiAnalysisAsRiskDataParams): Promise<ApplyAiAnalysisAsRiskDataResponse> {
  const response = await api.post<ApplyAiAnalysisAsRiskDataResponse>(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_APPLY_AI_ANALYSIS_RISK_DATA,
      pathParams: { companyId, applicationId },
    }),
    {
      hierarchyId,
      riskId,
      probability,
      generateSourcesAddOnly,
      engsAddOnly,
      recAddOnly,
      admsAddOnly,
    },
  );

  return response.data;
}
