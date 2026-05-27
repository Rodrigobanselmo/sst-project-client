import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  ReadSystemAiPromptParams,
  SystemAiPromptResult,
  UpsertSystemAiPromptParams,
} from './system-ai-prompt.types';

export async function readSystemAiPrompt({
  key,
}: ReadSystemAiPromptParams): Promise<SystemAiPromptResult> {
  const response = await api.get<SystemAiPromptResult>(
    bindUrlParams({
      path: `${FormRoutes.SYSTEM_AI_PROMPT.PATH}/:key`,
      pathParams: { key },
    }),
  );

  return response.data;
}

export async function upsertSystemAiPrompt({
  key,
  content,
}: UpsertSystemAiPromptParams): Promise<SystemAiPromptResult> {
  const response = await api.put<SystemAiPromptResult>(
    bindUrlParams({
      path: `${FormRoutes.SYSTEM_AI_PROMPT.PATH}/:key`,
      pathParams: { key },
    }),
    { content },
  );

  return response.data;
}
