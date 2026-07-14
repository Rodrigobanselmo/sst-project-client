export type CharacterizationTechnicalRecordType =
  | 'DOCUMENTARY_RESEARCH'
  | 'TECHNICAL_FOUNDATION'
  | 'EXTERNAL_AI_ANALYSIS'
  | 'EXPERT_CONSULTATION'
  | 'CLIENT_INFORMATION'
  | 'TECHNICAL_NOTE'
  | 'REVIEW'
  | 'OTHER';

export type CharacterizationTechnicalAnalysisOrigin =
  | 'INTERNAL_RESEARCH'
  | 'EXTERNAL_AI_USER_DECLARED'
  | 'EXPERT'
  | 'CLIENT'
  | 'TECHNICAL_RESPONSIBLE'
  | 'OTHER';

export type CharacterizationTechnicalRecordStatus =
  | 'DRAFT'
  | 'REVIEWED'
  | 'USED_AS_SUPPORT'
  | 'SUPERSEDED'
  | 'ARCHIVED';

export type CharacterizationTechnicalRelatedField =
  | 'ELEMENT_NAME'
  | 'DESCRIPTION'
  | 'WORK_ACTIVITIES'
  | 'CONSIDERATIONS'
  | 'RISK_IDENTIFICATION'
  | 'RECOMMENDATIONS'
  | 'REFERENCE_ONLY';

export type CharacterizationTechnicalSourceType =
  | 'TECHNICAL_DATASHEET'
  | 'PREVIOUS_PGR'
  | 'PREVIOUS_SST_DOCUMENT'
  | 'INSTITUTIONAL_DOCUMENT'
  | 'STANDARD_OR_TECHNICAL_REFERENCE'
  | 'WEBSITE'
  | 'MARITIME_OR_CADASTRAL_DATABASE'
  | 'CONTRACTUAL_DOCUMENT'
  | 'CLIENT_INFORMATION'
  | 'PHOTOGRAPH'
  | 'EXPERT_OPINION'
  | 'EXTERNAL_AI'
  | 'OWN_TECHNICAL_NOTE'
  | 'OTHER';

export type CharacterizationTechnicalSourceStrength =
  | 'VERY_HIGH'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'NOT_APPLICABLE'
  | 'UNDEFINED';

export type CharacterizationFinalSnapshot = {
  name: string | null;
  description: string[] | string | null;
  workActivities: string[] | string | null;
  considerations: string[] | string | null;
  capturedAt: string;
  capturedById: number | null;
  capturedByName: string | null;
};

export type CharacterizationTechnicalRecordUser = {
  id: number;
  name: string | null;
  email: string | null;
};

export type CharacterizationTechnicalRecordSource = {
  id: string;
  sourceType: CharacterizationTechnicalSourceType;
  authorInstitution: string | null;
  title: string | null;
  publicationOrRevisionDate: string | null;
  referenceOrRevision: string | null;
  fileName: string | null;
  url: string | null;
  accessedAt: string | null;
  sourceStrength: CharacterizationTechnicalSourceStrength;
  sourceClassification: string | null;
  informationUsed: string | null;
  limitations: string | null;
  applicationInCharacterization: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CharacterizationTechnicalRecordItem = {
  id: string;
  title: string;
  recordType: CharacterizationTechnicalRecordType;
  analysisDate: string;
  responsibleUserId: number | null;
  responsibleName: string;
  analysisOrigin: CharacterizationTechnicalAnalysisOrigin;
  externalAiTool: string | null;
  externalAiModel: string | null;
  status: CharacterizationTechnicalRecordStatus;
  technicalReport: string | null;
  relatedFields: CharacterizationTechnicalRelatedField[];
  finalCharacterizationSnapshot: CharacterizationFinalSnapshot | null;
  sources: CharacterizationTechnicalRecordSource[];
  createdAt: string;
  updatedAt: string;
  createdBy: CharacterizationTechnicalRecordUser | null;
  updatedBy: CharacterizationTechnicalRecordUser | null;
  responsibleUser: CharacterizationTechnicalRecordUser | null;
};

export type CharacterizationTechnicalRecordSourceInput = {
  id?: string;
  sourceType: CharacterizationTechnicalSourceType;
  authorInstitution?: string | null;
  title?: string | null;
  publicationOrRevisionDate?: string | null;
  referenceOrRevision?: string | null;
  fileName?: string | null;
  url?: string | null;
  accessedAt?: string | null;
  sourceStrength?: CharacterizationTechnicalSourceStrength;
  sourceClassification?: string | null;
  informationUsed?: string | null;
  limitations?: string | null;
  applicationInCharacterization?: string | null;
  sortOrder?: number;
};

export type CharacterizationTechnicalRecordPayload = {
  title: string;
  recordType: CharacterizationTechnicalRecordType;
  analysisDate: string;
  responsibleUserId?: number | null;
  responsibleName: string;
  analysisOrigin: CharacterizationTechnicalAnalysisOrigin;
  externalAiTool?: string | null;
  externalAiModel?: string | null;
  status?: CharacterizationTechnicalRecordStatus;
  technicalReport?: string | null;
  relatedFields?: CharacterizationTechnicalRelatedField[];
  finalCharacterizationSnapshot?: CharacterizationFinalSnapshot | null;
  sources?: CharacterizationTechnicalRecordSourceInput[];
};

export type BrowseCharacterizationTechnicalRecordsParams = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
};

export type CharacterizationTechnicalRecordMutationParams =
  BrowseCharacterizationTechnicalRecordsParams &
    CharacterizationTechnicalRecordPayload & {
      recordId?: string;
    };

export type DeleteCharacterizationTechnicalRecordParams =
  BrowseCharacterizationTechnicalRecordsParams & {
    recordId: string;
  };

export type TechnicalUrlImportSuggestionStatus =
  | 'READ_SUCCESS'
  | 'PARTIAL'
  | 'METADATA_ONLY'
  | 'READ_FAILED'
  | 'BLOCKED'
  | 'ALREADY_REGISTERED'
  | 'INVALID_URL';

export type TechnicalUrlImportSuggestion = {
  originalUrl: string;
  normalizedUrl: string | null;
  status: TechnicalUrlImportSuggestionStatus;
  errorCode?: string | null;
  title: string | null;
  authorInstitution: string | null;
  publicationDate: string | null;
  accessedAt: string;
  fileName: string | null;
  suggestedSourceType: CharacterizationTechnicalSourceType;
  suggestedStrength: CharacterizationTechnicalSourceStrength;
  strengthRationale: string;
  contentType: string | null;
  readCompleteness: 'FULL' | 'PARTIAL' | 'NONE';
  alreadyRegistered: boolean;
  warning?: string | null;
};

export type TechnicalAiEvidenceSuggestionKind =
  | 'URL_SUCCESS'
  | 'URL_FAILED'
  | 'TEMPORARY_PDF'
  | 'PHOTO'
  | 'MENTIONED_ONLY';

export type TechnicalAiEvidenceSuggestion = {
  id: string;
  kind: TechnicalAiEvidenceSuggestionKind;
  verified: boolean;
  originLabel: string;
  traceId: string;
  traceCreatedAt: string | null;
  url: string | null;
  title: string | null;
  fileName: string | null;
  warning: string | null;
  suggestedSourceType: CharacterizationTechnicalSourceType;
  suggestedStrength: CharacterizationTechnicalSourceStrength;
  strengthRationale: string;
  alreadyRegistered: boolean;
};

export const TECHNICAL_SOURCE_APPLICATION_MAX_CHARS = 280;

/**
 * Future: POST .../technical-records/assist-report-draft
 * Preview-only report draft (replace | append | cancel). Not wired in this front.
 */
