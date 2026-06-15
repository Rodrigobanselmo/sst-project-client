export enum HoMethodSourceEnum {
  NIOSH = 'NIOSH',
  OSHA = 'OSHA',
  FUNDACENTRO = 'FUNDACENTRO',
  ACGIH = 'ACGIH',
  AIHA = 'AIHA',
  ISO = 'ISO',
  INTERNAL = 'INTERNAL',
  OTHER = 'OTHER',
}

export enum HoMethodAgentTypeEnum {
  CHEMICAL = 'CHEMICAL',
  PHYSICAL = 'PHYSICAL',
  OTHER = 'OTHER',
}

export enum HoMethodEvaluationTypeEnum {
  TWA = 'TWA',
  STEL = 'STEL',
  CEILING = 'CEILING',
  CMPT = 'CMPT',
  VMP = 'VMP',
  NR15_TETO = 'NR15_TETO',
  ACGIH_CEILING = 'ACGIH_CEILING',
  QUALITATIVE = 'QUALITATIVE',
  OTHER = 'OTHER',
}

export enum HoMethodAvailabilityStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_CONSULTATION = 'UNDER_CONSULTATION',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
}

export enum HoMethodLaboratoryAvailabilityStatusEnum {
  AVAILABLE = 'AVAILABLE',
  NOT_AVAILABLE = 'NOT_AVAILABLE',
  UNDER_CONSULTATION = 'UNDER_CONSULTATION',
  UNKNOWN = 'UNKNOWN',
}

export type HoMethodEvaluationConditionRecord = {
  id: string;
  hoMethodAgentId?: string | null;
  evaluationType: HoMethodEvaluationTypeEnum;
  limitValue: string | null;
  limitUnit: string | null;
  minimumFlowRate: number | null;
  maximumFlowRate: number | null;
  minimumVolume: number | null;
  maximumVolume: number | null;
  flowRateUnit: string | null;
  volumeUnit: string | null;
  notes: string | null;
};

export type HoMethodLaboratoryRecord = {
  id: string;
  laboratoryId: string | null;
  laboratoryName: string;
  laboratoryCnpj: string | null;
  laboratoryTradeName: string | null;
  laboratoryCorporateName: string | null;
  availabilityStatus: HoMethodLaboratoryAvailabilityStatusEnum;
  lastConfirmationDate: string | null;
  notes: string | null;
  analyticalNotes: string | null;
  samplerId: string | null;
  samplerName: string | null;
  extractionSolventId: string | null;
  extractionSolventName: string | null;
  minimumFlowRateOverride: number | null;
  maximumFlowRateOverride: number | null;
  minimumVolumeOverride: number | null;
  maximumVolumeOverride: number | null;
  storageTemperatureOverride: number | null;
  storageTemperatureUnitOverride: string | null;
  stabilityDaysOverride: number | null;
};

export type HoMethodAgentRecord = {
  id: string;
  riskFactorId: string;
  agentName: string | null;
  cas: string | null;
  unit: string | null;
  agentType: HoMethodAgentTypeEnum | null;
  sortOrder: number;
  riskFactor: HoMethodRiskFactorSnapshot | null;
  evaluationConditions: HoMethodEvaluationConditionRecord[];
};

export type HoMethodRiskFactorSnapshot = {
  id: string;
  name: string;
  cas: string | null;
  synonymous: string[];
  type: string;
  unit: string | null;
  nr15lt: string | null;
  twa: string | null;
  stel: string | null;
  acgihCeiling: string | null;
  ipvs: string | null;
  nioshRel: string | null;
  nioshStel: string | null;
  nioshCeiling: string | null;
  oshaPel: string | null;
  oshaStel: string | null;
  oshaCeiling: string | null;
  aihaWeel: string | null;
  aihaWeelCeiling: string | null;
};

export type HoMethodRecord = {
  id: string;
  displayName: string;
  description: string | null;
  agentName: string | null;
  cas: string | null;
  riskFactorId: string | null;
  riskFactor: HoMethodRiskFactorSnapshot | null;
  institution: HoMethodSourceEnum;
  methodCode: string;
  methodVersion: string | null;
  analyticalMethod: string | null;
  agentType: HoMethodAgentTypeEnum;
  prioritized: boolean;
  status: HoMethodAvailabilityStatusEnum;
  samplerId: string | null;
  samplerName: string | null;
  minimumFlowRate: number | null;
  maximumFlowRate: number | null;
  minimumVolume: number | null;
  maximumVolume: number | null;
  flowRateUnit: string | null;
  volumeUnit: string | null;
  storageTemperature: number | null;
  storageTemperatureUnit: string | null;
  stabilityDays: number | null;
  extractionSolventId: string | null;
  extractionSolventName: string | null;
  originalDocumentFileId: string | null;
  originalDocumentName: string | null;
  originalDocumentUrl: string | null;
  originalDocumentDownloadPath: string | null;
  originalDocumentUploadedAt: string | null;
  evaluationConditions: HoMethodEvaluationConditionRecord[];
  agents: HoMethodAgentRecord[];
  laboratories: HoMethodLaboratoryRecord[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HoMethodEvaluationConditionPayload = {
  evaluationType: HoMethodEvaluationTypeEnum;
  limitValue?: string | null;
  limitUnit?: string | null;
  minimumFlowRate?: number | null;
  maximumFlowRate?: number | null;
  minimumVolume?: number | null;
  maximumVolume?: number | null;
  flowRateUnit?: string | null;
  volumeUnit?: string | null;
  notes?: string | null;
};

export type HoMethodLaboratoryPayload = {
  laboratoryId?: string | null;
  laboratoryName?: string;
  availabilityStatus?: HoMethodLaboratoryAvailabilityStatusEnum;
  lastConfirmationDate?: string | null;
  notes?: string | null;
  analyticalNotes?: string | null;
  samplerId?: string | null;
  extractionSolventId?: string | null;
  minimumFlowRateOverride?: number | null;
  maximumFlowRateOverride?: number | null;
  minimumVolumeOverride?: number | null;
  maximumVolumeOverride?: number | null;
  storageTemperatureOverride?: number | null;
  storageTemperatureUnitOverride?: string | null;
  stabilityDaysOverride?: number | null;
};

export type HoMethodAgentPayload = {
  id?: string;
  riskFactorId: string;
  agentName?: string | null;
  cas?: string | null;
  unit?: string | null;
  agentType?: HoMethodAgentTypeEnum;
  evaluationConditions?: HoMethodEvaluationConditionPayload[];
};

export type HoMethodWritePayload = {
  displayName?: string;
  description?: string | null;
  agentName?: string | null;
  cas?: string | null;
  riskFactorId?: string | null;
  institution: HoMethodSourceEnum;
  methodCode: string;
  methodVersion?: string | null;
  analyticalMethod?: string | null;
  agentType?: HoMethodAgentTypeEnum;
  prioritized?: boolean;
  status?: HoMethodAvailabilityStatusEnum;
  samplerId?: string | null;
  minimumFlowRate?: number | null;
  maximumFlowRate?: number | null;
  minimumVolume?: number | null;
  maximumVolume?: number | null;
  flowRateUnit?: string | null;
  volumeUnit?: string | null;
  storageTemperature?: number | null;
  storageTemperatureUnit?: string | null;
  stabilityDays?: number | null;
  extractionSolventId?: string | null;
  originalDocumentFileId?: string | null;
  originalDocumentName?: string | null;
  originalDocumentUploadedAt?: string | null;
  notes?: string | null;
  evaluationConditions?: HoMethodEvaluationConditionPayload[];
  agents?: HoMethodAgentPayload[];
  laboratories?: HoMethodLaboratoryPayload[];
};

export type BrowseHoMethodsParams = {
  page?: number;
  limit?: number;
  search?: string;
  agentName?: string;
  cas?: string;
  institution?: HoMethodSourceEnum;
  methodCode?: string;
  analyticalMethod?: string;
  evaluationType?: HoMethodEvaluationTypeEnum;
  status?: HoMethodAvailabilityStatusEnum;
  prioritized?: boolean;
};

export type BrowseHoMethodsResponse = {
  results: HoMethodRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type HoSamplerRecord = {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  notes: string | null;
  active: boolean;
};

export type HoExtractionSolventRecord = {
  id: string;
  name: string;
  description: string | null;
  synonyms: string[];
  notes: string | null;
  active: boolean;
};

export type HoLaboratoryRecord = {
  id: string;
  cnpj: string | null;
  corporateName: string;
  tradeName: string | null;
  email: string | null;
  phone: string | null;
  contactName: string | null;
  notes: string | null;
  status: 'ACTIVE' | 'INACTIVE';
};

export type HoMethodFileUploadResponse = {
  fileId: string;
  name: string;
  url: string;
  uploadedAt: string;
};

export type HoMethodImportConfidence = 'high' | 'medium' | 'low';

export type HoMethodImportField<T> = {
  value: T | null;
  confidence: HoMethodImportConfidence;
  rawText?: string | null;
};

export type HoMethodRiskMatchConfidence = 'high' | 'low' | 'none';

export type HoMethodImportAgentSuggestion = {
  substanceName: string;
  cas: string | null;
  synonyms: string[];
  occupationalLimits?: HoMethodImportOccupationalLimitSuggestions;
  matchedRiskFactor: HoMethodRiskFactorSnapshot | null;
  found: boolean;
  matchConfidence: HoMethodRiskMatchConfidence;
  candidateRiskFactors: HoMethodRiskFactorSnapshot[];
};

export type HoMethodImportOccupationalLimitSuggestions = {
  acgihTwa: HoMethodImportField<string>;
  acgihStel: HoMethodImportField<string>;
  acgihCeiling: HoMethodImportField<string>;
  aihaWeel: HoMethodImportField<string>;
  aihaWeelCeiling: HoMethodImportField<string>;
  oshaPel: HoMethodImportField<string>;
  oshaStel: HoMethodImportField<string>;
  oshaCeiling: HoMethodImportField<string>;
  nioshRel: HoMethodImportField<string>;
  nioshStel: HoMethodImportField<string>;
  nioshCeiling: HoMethodImportField<string>;
  nioshIdlh: HoMethodImportField<string>;
};

export type HoMethodImportParseResult = {
  detectedFormat: 'NIOSH' | 'NMAM' | 'UNKNOWN';
  isSupportedMethod: boolean;
  warnings: string[];
  possibleDuplicate: {
    exists: boolean;
    message: string | null;
    existingMethodId: string | null;
  };
  fields: {
    institution: HoMethodImportField<string>;
    methodCode: HoMethodImportField<string>;
    methodVersion: HoMethodImportField<string>;
    issueDate: HoMethodImportField<string>;
    evaluation: HoMethodImportField<string>;
    displayName: HoMethodImportField<string>;
    analyticalMethod: HoMethodImportField<string>;
    sampler: HoMethodImportField<string>;
    minimumFlowRate: HoMethodImportField<number>;
    maximumFlowRate: HoMethodImportField<number>;
    flowRateUnit: HoMethodImportField<string>;
    minimumVolume: HoMethodImportField<number>;
    maximumVolume: HoMethodImportField<number>;
    volumeUnit: HoMethodImportField<string>;
    shipment: HoMethodImportField<string>;
    stabilityDays: HoMethodImportField<number>;
    stabilityText: HoMethodImportField<string>;
    storageTemperature: HoMethodImportField<number>;
    storageTemperatureUnit: HoMethodImportField<string>;
    extractionSolvent: HoMethodImportField<string>;
    technique: HoMethodImportField<string>;
    analyte: HoMethodImportField<string>;
    detector: HoMethodImportField<string>;
    lod: HoMethodImportField<string>;
    range: HoMethodImportField<string>;
    applicability: HoMethodImportField<string>;
    interferences: HoMethodImportField<string>;
    observations: HoMethodImportField<string>;
  };
  occupationalLimits: HoMethodImportOccupationalLimitSuggestions;
  agents: HoMethodImportAgentSuggestion[];
  canConfirm: boolean;
  confirmBlockReason: string | null;
};
