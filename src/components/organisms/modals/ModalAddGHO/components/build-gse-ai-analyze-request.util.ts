import type { AiTemporaryDocumentSource } from '@v2/services/security/characterization/characterization/ai-temporary-source/ai-temporary-document-source.types';

export function buildGseAiAnalyzeRequestBody(params: {
  userGuidance: string;
  temporaryDocumentSource: AiTemporaryDocumentSource | null;
  customPrompt?: string;
  model?: string;
  scope?: 'general' | 'risk' | 'field';
  riskId?: string;
  field?:
    | 'fonteGeradora'
    | 'medidasEngenhariaExistentes'
    | 'medidasAdministrativasExistentes'
    | 'medidasEngenhariaRecomendadas'
    | 'medidasAdministrativasRecomendadas';
}): {
  userGuidance?: string;
  temporaryDocumentSources?: AiTemporaryDocumentSource[];
  customPrompt?: string;
  model?: string;
  scope?: 'risk' | 'field';
  riskId?: string;
  field?:
    | 'fonteGeradora'
    | 'medidasEngenhariaExistentes'
    | 'medidasAdministrativasExistentes'
    | 'medidasEngenhariaRecomendadas'
    | 'medidasAdministrativasRecomendadas';
} {
  const scoped = params.scope === 'risk' || params.scope === 'field';

  return {
    userGuidance: params.userGuidance.trim() || undefined,
    temporaryDocumentSources: params.temporaryDocumentSource
      ? [params.temporaryDocumentSource]
      : undefined,
    customPrompt: params.customPrompt,
    model: params.model,
    ...(scoped
      ? {
          scope: params.scope as 'risk' | 'field',
          riskId: params.riskId,
          ...(params.scope === 'field' ? { field: params.field } : {}),
        }
      : {}),
  };
}
