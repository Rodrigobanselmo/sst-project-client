import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export type ReviewAnalysisItemParams = {
  companyId: string;
  applicationId: string;
  analysisId: string;
  itemType:
    | 'fontesGeradoras'
    | 'medidasEngenhariaRecomendadas'
    | 'medidasAdministrativasRecomendadas';
  itemIndex: number;
};

export async function acceptFormQuestionsAnswersAnalysisItem(
  params: ReviewAnalysisItemParams,
) {
  const response = await api.post(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.ACCEPT_ANALYSIS_ITEM,
      pathParams: {
        companyId: params.companyId,
        applicationId: params.applicationId,
        analysisId: params.analysisId,
      },
    }),
    {
      itemType: params.itemType,
      itemIndex: params.itemIndex,
    },
  );

  return response.data;
}

export async function commentFormQuestionsAnswersAnalysisItem(
  params: ReviewAnalysisItemParams & { text: string },
) {
  const response = await api.post(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.COMMENT_ANALYSIS_ITEM,
      pathParams: {
        companyId: params.companyId,
        applicationId: params.applicationId,
        analysisId: params.analysisId,
      },
    }),
    {
      itemType: params.itemType,
      itemIndex: params.itemIndex,
      text: params.text,
    },
  );

  return response.data;
}
