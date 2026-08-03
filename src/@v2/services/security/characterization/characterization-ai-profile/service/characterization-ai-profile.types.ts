import { CharacterizationTypeEnum } from 'project/enum/characterization-type.enum';

export enum CharacterizationAiProfileDraftCreationModeEnum {
  ADAPT_REFERENCE = 'ADAPT_REFERENCE',
  SYSTEM_BASE = 'SYSTEM_BASE',
  FROM_SCRATCH = 'FROM_SCRATCH',
}

export type CharacterizationAiProfileSourceKind =
  | 'MANUAL'
  | 'ASSISTED_DRAFT'
  | 'DUPLICATED'
  | 'IMPORTED'
  | 'SYSTEM_PROMOTED';

export type CharacterizationAiProfileFieldInstructions = {
  description: string;
  workActivities: string;
  photos: string;
  considerations: string;
};

export type CharacterizationAiProfileDto = {
  id: string;
  companyId: string;
  name: string;
  objective: string | null;
  description: string | null;
  usageGuidance: string | null;
  instructions: string;
  fieldInstructions: CharacterizationAiProfileFieldInstructions | null;
  recommendedCharacterizationTypes: CharacterizationTypeEnum[];
  category: string | null;
  internalNotes: string | null;
  isCompanyDefault: boolean;
  isActive: boolean;
  version: number;
  origin: {
    sourceKind: CharacterizationAiProfileSourceKind;
    sourceProfileId: string | null;
    sourceCompanyId: string | null;
    copiedAt: string | null;
  };
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CharacterizationAiProfileBrowseResult = {
  data: CharacterizationAiProfileDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CharacterizationAiProfileDraftChangeSummary = {
  preserved: string[];
  removed: string[];
  added: string[];
  warnings: string[];
};

export type CharacterizationAiProfileDraftDto = {
  name: string;
  category: string | null;
  objective: string;
  description: string | null;
  usageGuidance: string | null;
  recommendedCharacterizationTypes: CharacterizationTypeEnum[];
  fieldInstructions: CharacterizationAiProfileFieldInstructions;
  generalInstructions: string;
  instructions: string;
  changeSummary: CharacterizationAiProfileDraftChangeSummary;
};

export type CharacterizationAiProfileTranscribeResult = {
  text: string;
  language?: string;
  durationSeconds?: number;
  provider: string;
  model: string;
  warnings: string[];
};

export type CreateCharacterizationAiProfilePayload = {
  name: string;
  objective: string;
  instructions: string;
  description?: string | null;
  usageGuidance?: string | null;
  fieldInstructions?: CharacterizationAiProfileFieldInstructions | null;
  recommendedCharacterizationTypes?: CharacterizationTypeEnum[];
  category?: string | null;
  internalNotes?: string | null;
  sourceKind?: CharacterizationAiProfileSourceKind;
};

export type UpdateCharacterizationAiProfilePayload = {
  name?: string;
  objective?: string | null;
  instructions?: string;
  description?: string | null;
  usageGuidance?: string | null;
  fieldInstructions?: CharacterizationAiProfileFieldInstructions | null;
  recommendedCharacterizationTypes?: CharacterizationTypeEnum[];
  category?: string | null;
  internalNotes?: string | null;
};

export type GenerateCharacterizationAiProfileDraftPayload = {
  creationMode: CharacterizationAiProfileDraftCreationModeEnum;
  sourceInstructions?: string;
  referenceProfileId?: string;
  suggestedName?: string;
  objective?: string;
  category?: string;
  recommendedCharacterizationTypes?: CharacterizationTypeEnum[];
  additionalGuidance?: string;
};
