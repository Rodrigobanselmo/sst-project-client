import type { AiTemporaryDocumentSource } from '../../ai-temporary-source/ai-temporary-document-source.types';

export type { AiTemporaryDocumentSource };

export type AiCharacterizationAssistMode =
  | 'DRAFT'
  | 'REVIEW'
  | 'CRITICAL_ANALYSIS';

export type AiCharacterizationAssistScope =
  | 'OWN_ESTABLISHMENT'
  | 'THIRD_PARTY'
  | 'EXTERNAL_ITINERANT'
  | 'SPECIFIC_EQUIPMENT';

export type AiCharacterizationAssistCompanyRole =
  | 'DIRECT_OPERATOR'
  | 'SERVICE_CONSULTING'
  | 'MAINTENANCE'
  | 'ADMINISTRATIVE';

export type AiCharacterizationAssistTarget =
  | 'FULL_ESTABLISHMENT'
  | 'SECTOR'
  | 'WORKSTATION'
  | 'ACTIVITY'
  | 'VESSEL_PLATFORM_EQUIPMENT'
  | 'WORK_FRONT';

export type AiCharacterizationAssistOutputIntent =
  | 'GENERATE_FINAL'
  | 'REVIEW_EXISTING'
  | 'CRITICAL_ONLY';

export type AiCharacterizationAssistTextItem = {
  text: string;
  type?: 'PARAGRAPH' | 'BULLET_0' | 'BULLET_1' | 'BULLET_2';
};

export type AiCharacterizationAssistSourceClassification = {
  label: string;
  source: 'SYSTEM' | 'USER' | 'USER_PROVIDED_SOURCE' | 'AI_INFERENCE';
};

export type AiCharacterizationAssistQuestionnaire = {
  characterizationScope: AiCharacterizationAssistScope;
  companyRole: AiCharacterizationAssistCompanyRole;
  characterizationTarget: AiCharacterizationAssistTarget;
  outputIntent: AiCharacterizationAssistOutputIntent;
  useAttachedPhotos: boolean;
};

export interface AiCharacterizationAssistParams {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  mode: AiCharacterizationAssistMode;
  questionnaire: AiCharacterizationAssistQuestionnaire;
  userObservations?: string;
  userProvidedSources?: string;
  temporaryDocumentSources?: AiTemporaryDocumentSource[];
  customPrompt?: string;
  model?: string;
}

export type AiCharacterizationAssistResult = {
  description: AiCharacterizationAssistTextItem[];
  workActivities: AiCharacterizationAssistTextItem[];
  considerations: AiCharacterizationAssistTextItem[];
  suggestedName?: string;
  uncertaintyPoints: string[];
  inconsistencies: string[];
  cautions: string[];
  sourceClassification?: AiCharacterizationAssistSourceClassification[];
  metadata?: Record<string, unknown>;
  characterization: {
    id: string;
    name: string;
    type: string;
  };
};
