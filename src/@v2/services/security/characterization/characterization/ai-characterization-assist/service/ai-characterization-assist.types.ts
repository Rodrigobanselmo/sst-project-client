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
  source:
    | 'SYSTEM'
    | 'USER'
    | 'USER_PROVIDED_SOURCE'
    | 'WEB_SEARCH'
    | 'AI_INFERENCE';
};

export type AiCharacterizationAssistQuestionnaire = {
  characterizationScope: AiCharacterizationAssistScope;
  companyRole: AiCharacterizationAssistCompanyRole;
  characterizationTarget: AiCharacterizationAssistTarget;
  outputIntent: AiCharacterizationAssistOutputIntent;
  useAttachedPhotos: boolean;
};

export type UserProvidedUrlReadStatus =
  | 'READ_SUCCESS'
  | 'READ_FAILED'
  | 'BLOCKED'
  | 'TRUNCATED';

export type CharacterizationWebSearchStatus =
  | 'SUCCESS'
  | 'PARTIAL'
  | 'UNAVAILABLE'
  | 'FAILED'
  | 'SKIPPED';

export type CharacterizationExternalSourcesSummary = {
  userProvidedUrls: Array<{
    url: string;
    status: UserProvidedUrlReadStatus;
    title?: string;
    charCount: number;
    warning?: string;
  }>;
  webSearch: {
    enabled: boolean;
    status: CharacterizationWebSearchStatus;
    provider?: string;
    queries: string[];
    results: Array<{
      title: string;
      url: string;
      sourceType: 'OFFICIAL' | 'TECHNICAL' | 'GENERAL' | 'UNKNOWN';
      snippet?: string;
      warning?: string;
    }>;
    warning?: string;
  };
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
  enableWebSearch?: boolean;
  webSearchConsentAccepted?: boolean;
  customPrompt?: string;
  model?: string;
}

export type AiCharacterizationAssistSanitizationMeta = {
  warnings: string[];
  blockedReasons: string[];
  needsRegeneration: boolean;
  blockedFields: Array<'description' | 'workActivities' | 'considerations'>;
  fieldsWithWarnings: Array<'description' | 'workActivities' | 'considerations'>;
  problematicExcerpts: Array<{
    field: 'description' | 'workActivities' | 'considerations';
    excerpt: string;
    rule: string;
  }>;
};

export type AiCharacterizationAssistResult = {
  traceId?: string;
  description: AiCharacterizationAssistTextItem[];
  workActivities: AiCharacterizationAssistTextItem[];
  considerations: AiCharacterizationAssistTextItem[];
  suggestedName?: string;
  uncertaintyPoints: string[];
  inconsistencies: string[];
  cautions: string[];
  sourceClassification?: AiCharacterizationAssistSourceClassification[];
  externalSources?: CharacterizationExternalSourcesSummary;
  metadata?: Record<string, unknown>;
  sanitization?: AiCharacterizationAssistSanitizationMeta;
  needsRegeneration?: boolean;
  blockedFields?: Array<'description' | 'workActivities' | 'considerations'>;
  /** Effective model used for this generation. */
  modelUsed?: string;
  /** True when the system default/economic model was used. */
  isSystemDefaultModel?: boolean;
  /**
   * Commercial/UX notice for default model usage.
   * Must remain outside description/workActivities/considerations.
   */
  modelUsageNotice?: string;
  characterization: {
    id: string;
    name: string;
    type: string;
  };
};
