import type { AiTemporaryDocumentSource } from '../../ai-temporary-source/ai-temporary-document-source.types';

export class AiAnalyzeCharacterizationPayload {
  customPrompt?: string;
  userGuidance?: string;
  temporaryDocumentSources?: AiTemporaryDocumentSource[];
  model?: string; // Optional AI model to use (e.g., 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo')
}
