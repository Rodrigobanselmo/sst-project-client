import type {
  AiCharacterizationAssistTextItem,
  CharacterizationExternalSourcesSummary,
} from '../../ai-characterization-assist/service/ai-characterization-assist.types';

export type CharacterizationAiAssistTraceStatus =
  | 'GENERATED'
  | 'PARTIALLY_APPLIED'
  | 'APPLIED'
  | 'SUPERSEDED';

export type CharacterizationAiAssistPromptMode =
  | 'DEFAULT'
  | 'CUSTOM_SESSION'
  | 'SAVED_DEFAULT';

export type CharacterizationAiAssistAppliedFieldName =
  | 'description'
  | 'workActivities'
  | 'considerations'
  | 'suggestedName';

export type CharacterizationAiAssistAppliedField = {
  field: CharacterizationAiAssistAppliedFieldName;
  mode: 'append' | 'replace';
  appliedAt: string;
  content: unknown;
};

export type CharacterizationAiAssistTraceUser = {
  id: number;
  name: string;
  email?: string | null;
};

export type CharacterizationAiAssistTraceItem = {
  id: string;
  status: CharacterizationAiAssistTraceStatus;
  mode: string;
  outputIntent: string;
  model?: string | null;
  promptMode: CharacterizationAiAssistPromptMode;
  usedTemporaryPdf: boolean;
  usedPhotos: boolean;
  usedUserUrls: boolean;
  requestedWebSearch: boolean;
  webSearchStatus?: string | null;
  suggestedName?: string | null;
  suggestedDescription: AiCharacterizationAssistTextItem[] | unknown;
  suggestedWorkActivities: AiCharacterizationAssistTextItem[] | unknown;
  suggestedConsiderations: AiCharacterizationAssistTextItem[] | unknown;
  uncertaintyPoints: string[] | unknown;
  inconsistencies: string[] | unknown;
  cautions: string[] | unknown;
  sourceClassification?: unknown;
  externalSources?: CharacterizationExternalSourcesSummary | unknown;
  temporaryDocumentMeta?: unknown;
  metadata?: unknown;
  appliedFields?: CharacterizationAiAssistAppliedField[] | null;
  appliedAt?: string | null;
  savedAfterApply: boolean;
  savedCharacterizationAt?: string | null;
  processingTimeMs?: number | null;
  createdAt: string;
  updatedAt: string;
  generatedBy?: CharacterizationAiAssistTraceUser | null;
  appliedBy?: CharacterizationAiAssistTraceUser | null;
  hasInconsistencies: boolean;
  hasCautions: boolean;
  hasFailedUrls: boolean;
};

export type BrowseCharacterizationAiAssistTracesParams = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
};

export type ApplyCharacterizationAiAssistTraceParams = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  traceId: string;
  field: CharacterizationAiAssistAppliedFieldName;
  mode: 'append' | 'replace';
  content: unknown;
};

export type MarkSavedCharacterizationAiAssistTraceParams = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  traceId: string;
};
