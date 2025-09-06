import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseFormQuestionsAnswersRisksParams } from './browse-form-questions-answers-risks.types';

export type Result = {
  // entityId -> riskId --> values
  entityRiskMap: Record<
    string,
    Record<string, { values: number[]; probability: number }>
  >;
  // entityId -> { id: string; type: HierarchyEnum; name: string }
  entityMap: Record<
    string,
    { id: string; type: HierarchyTypeEnum; name: string }
  >;
  // riskId -> { id: string; name: string; type: RiskEnum; subTypes: { sub_type: { id: number; name: string } }[] }
  riskMap: Record<
    string,
    {
      id: string;
      name: string;
      type: RiskTypeEnum;
      subTypes: { sub_type: { id: number; name: string } }[];
    }
  >;
};

export async function browseFormQuestionsAnswersRisks({
  companyId,
  applicationId,
}: BrowseFormQuestionsAnswersRisksParams): Promise<Result | null> {
  const response = await api.get<Result>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.PATH_RISKS,
      pathParams: { companyId, applicationId },
    }),
  );

  return response.data;
}
