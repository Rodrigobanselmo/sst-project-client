import type { AiCharacterizationAssistParams } from './ai-characterization-assist.types';

export type AiCharacterizationAssistPayload = Omit<
  AiCharacterizationAssistParams,
  'companyId' | 'workspaceId' | 'characterizationId'
>;
