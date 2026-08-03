import type {
  AiCharacterizationAssistCompanyRole,
  AiCharacterizationAssistOutputIntent,
  AiCharacterizationAssistQuestionnaire,
  AiCharacterizationAssistScope,
  AiCharacterizationAssistTarget,
} from './ai-characterization-assist.types';

export type AiCharacterizationAssistArchitecturePreviewParams = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  motorPrompt: string;
  profileId?: string | null;
  questionnaire: AiCharacterizationAssistQuestionnaire;
  userObservations?: string;
  userProvidedSources?: string;
  enableWebSearch?: boolean;
  temporaryDocumentFileName?: string | null;
  hasTemporaryDocumentText?: boolean;
  characterizationCounts?: {
    paragraphsCount?: number;
    activitiesCount?: number;
    considerationsCount?: number;
    photosCount?: number;
  };
  environmental?: {
    temperature?: string | null;
    noiseValue?: string | null;
    luminosity?: string | null;
    moisturePercentage?: string | null;
  };
  labels: {
    scope: Record<AiCharacterizationAssistScope, string>;
    companyRole: Record<AiCharacterizationAssistCompanyRole, string>;
    target: Record<AiCharacterizationAssistTarget, string>;
    outputIntent: Record<AiCharacterizationAssistOutputIntent, string>;
  };
};

export type AiCharacterizationAssistArchitecturePreviewResult = {
  questionnaireRows: Array<{ key: string; label: string; value: string }>;
  sourceStatuses: Array<{
    key: string;
    label: string;
    used: boolean;
    detail: string;
  }>;
  specialistAppendix: string | null;
  effectivePromptPreview: string;
};
