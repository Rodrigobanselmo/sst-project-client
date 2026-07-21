import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import type {
  GenerateFrpsItemExplanationParams,
  GenerateFrpsItemExplanationResponse,
  ReadFrpsItemExplanationParams,
  ReadFrpsItemExplanationResponse,
} from './frps-explainability.types';

export async function readFrpsItemExplanation(
  params: ReadFrpsItemExplanationParams,
): Promise<ReadFrpsItemExplanationResponse> {
  const response = await api.get<ReadFrpsItemExplanationResponse>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.EXPLAIN_ITEM,
      pathParams: {
        companyId: params.companyId,
        applicationId: params.applicationId,
        analysisId: params.analysisId,
      },
    }),
    {
      params: {
        itemType: params.itemType,
        ...(params.itemKey ? { itemKey: params.itemKey } : {}),
        ...(params.itemName ? { itemName: params.itemName } : {}),
      },
    },
  );
  return response.data;
}

export async function generateFrpsItemExplanation(
  params: GenerateFrpsItemExplanationParams,
): Promise<GenerateFrpsItemExplanationResponse> {
  const response = await api.post<GenerateFrpsItemExplanationResponse>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.EXPLAIN_ITEM_GENERATE,
      pathParams: {
        companyId: params.companyId,
        applicationId: params.applicationId,
        analysisId: params.analysisId,
      },
    }),
    {
      itemType: params.itemType,
      ...(params.itemKey ? { itemKey: params.itemKey } : {}),
      ...(params.itemName ? { itemName: params.itemName } : {}),
      ...(params.conceptualModel
        ? { conceptualModel: params.conceptualModel }
        : {}),
    },
  );
  return response.data;
}

/** Gera somente contextual (qualquer usuário autorizado; exige conceitual VALIDATED). */
export async function generateFrpsContextualExplanation(
  params: Omit<GenerateFrpsItemExplanationParams, 'conceptualModel'>,
): Promise<GenerateFrpsItemExplanationResponse> {
  const response = await api.post<GenerateFrpsItemExplanationResponse>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.EXPLAIN_ITEM_CONTEXTUAL_GENERATE,
      pathParams: {
        companyId: params.companyId,
        applicationId: params.applicationId,
        analysisId: params.analysisId,
      },
    }),
    {
      itemType: params.itemType,
      ...(params.itemKey ? { itemKey: params.itemKey } : {}),
      ...(params.itemName ? { itemName: params.itemName } : {}),
    },
  );
  return response.data;
}

export async function patchConceptualExplanation(params: {
  id: string;
  content: Record<string, unknown>;
  asDraft?: boolean;
}) {
  const response = await api.patch(
    bindUrlParams({
      path: FormRoutes.AI_EXPLANATIONS.CONCEPTUAL,
      pathParams: { id: params.id },
    }),
    { content: params.content, asDraft: params.asDraft !== false },
  );
  return response.data;
}

export async function patchContextualExplanation(params: {
  id: string;
  content: Record<string, unknown>;
  asDraft?: boolean;
}) {
  const response = await api.patch(
    bindUrlParams({
      path: FormRoutes.AI_EXPLANATIONS.CONTEXTUAL,
      pathParams: { id: params.id },
    }),
    { content: params.content, asDraft: params.asDraft !== false },
  );
  return response.data;
}

export async function validateConceptualExplanation(id: string) {
  const response = await api.post(
    bindUrlParams({
      path: FormRoutes.AI_EXPLANATIONS.CONCEPTUAL_VALIDATE,
      pathParams: { id },
    }),
  );
  return response.data;
}

export async function validateContextualExplanation(id: string) {
  const response = await api.post(
    bindUrlParams({
      path: FormRoutes.AI_EXPLANATIONS.CONTEXTUAL_VALIDATE,
      pathParams: { id },
    }),
  );
  return response.data;
}

export async function rejectConceptualExplanation(id: string) {
  const response = await api.post(
    bindUrlParams({
      path: FormRoutes.AI_EXPLANATIONS.CONCEPTUAL_REJECT,
      pathParams: { id },
    }),
  );
  return response.data;
}

export async function rejectContextualExplanation(id: string) {
  const response = await api.post(
    bindUrlParams({
      path: FormRoutes.AI_EXPLANATIONS.CONTEXTUAL_REJECT,
      pathParams: { id },
    }),
  );
  return response.data;
}
