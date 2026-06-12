import {
  ConsolidatedViewQuestionsAnswersModel,
  toConsolidatedViewQuestionsAnswersModel,
} from '@v2/models/enterprise/company-group/consolidated-view-questions-answers.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { CompanyGroupRoutes } from '../../home-summary/constants/company-group.routes';

type ApiConsolidatedViewQuestionsAnswersModel = Omit<
  ConsolidatedViewQuestionsAnswersModel,
  'formQuestionsAnswers'
> & {
  results: ConsolidatedViewQuestionsAnswersModel['formQuestionsAnswers']['results'];
  participantStructures: ConsolidatedViewQuestionsAnswersModel['formQuestionsAnswers']['participantStructures'];
};

export async function readConsolidatedViewQuestionsAnswers(params: {
  companyGroupId: number;
  applicationIds?: string[];
}): Promise<ConsolidatedViewQuestionsAnswersModel> {
  const response = await api.get<ApiConsolidatedViewQuestionsAnswersModel>(
    bindUrlParams({
      path: CompanyGroupRoutes.CONSOLIDATED_VIEW_QUESTIONS_ANSWERS,
      pathParams: { companyGroupId: params.companyGroupId },
      queryParams: {
        ...(params.applicationIds?.length
          ? { applicationIds: params.applicationIds.join(',') }
          : {}),
      },
    }),
  );

  return toConsolidatedViewQuestionsAnswersModel(response.data);
}
