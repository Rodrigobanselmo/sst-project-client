import type { AiTemporaryDocumentSource } from '@v2/services/security/characterization/characterization/ai-temporary-source/ai-temporary-document-source.types';

export function buildGseAiAnalyzeRequestBody(params: {
  userGuidance: string;
  temporaryDocumentSource: AiTemporaryDocumentSource | null;
  customPrompt?: string;
  model?: string;
}): {
  userGuidance?: string;
  temporaryDocumentSources?: AiTemporaryDocumentSource[];
  customPrompt?: string;
  model?: string;
} {
  return {
    userGuidance: params.userGuidance.trim() || undefined,
    temporaryDocumentSources: params.temporaryDocumentSource
      ? [params.temporaryDocumentSource]
      : undefined,
    customPrompt: params.customPrompt,
    model: params.model,
  };
}
