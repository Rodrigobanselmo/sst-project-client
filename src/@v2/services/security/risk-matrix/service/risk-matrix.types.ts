export enum RiskMatrixSourceEnum {
  SYSTEM = 'SYSTEM',
  CUSTOM = 'CUSTOM',
}

export enum RiskMatrixCreateSourceEnum {
  BLANK = 'BLANK',
  SYSTEM = 'SYSTEM',
}

export enum CompanyRiskMatrixStatusEnum {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum CompanyRiskMatrixVersionStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export enum RiskMatrixCoverageKeyEnum {
  FIS = 'FIS',
  QUI = 'QUI',
  BIO = 'BIO',
  ACI = 'ACI',
  ERG = 'ERG',
  PSICOSOCIAL = 'PSICOSOCIAL',
}

export enum RiskMatrixAxisEnum {
  SEVERITY = 'SEVERITY',
  PROBABILITY = 'PROBABILITY',
}

export enum RiskMatrixGridOrientationEnum {
  PROBABILITY_ON_X = 'PROBABILITY_ON_X',
  SEVERITY_ON_X = 'SEVERITY_ON_X',
}

export enum RiskMatrixYAxisDirectionEnum {
  ASCENDING_TOP_TO_BOTTOM = 'ASCENDING_TOP_TO_BOTTOM',
  DESCENDING_TOP_TO_BOTTOM = 'DESCENDING_TOP_TO_BOTTOM',
}

export type RiskMatrixPublishedVersionSummary = {
  id: string;
  versionNumber: number;
  status: CompanyRiskMatrixVersionStatusEnum;
  publishedAt: string | null;
  nameSnapshot: string;
  coverages: RiskMatrixCoverageKeyEnum[];
};

export type RiskMatrixDraftVersionSummary = {
  id: string;
  versionNumber: number;
  status: CompanyRiskMatrixVersionStatusEnum;
};

export type RiskMatrixBrowseItem = {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  status: CompanyRiskMatrixStatusEnum;
  archivedAt: string | null;
  latestPublishedVersion: RiskMatrixPublishedVersionSummary | null;
  draftVersion: RiskMatrixDraftVersionSummary | null;
  hasActiveBindings: boolean;
};

export type BrowseRiskMatricesResponse = {
  results: RiskMatrixBrowseItem[];
};

export type RiskMatrixIdentityVersion = {
  id: string;
  versionNumber: number;
  status: CompanyRiskMatrixVersionStatusEnum;
  publishedAt: string | null;
  nameSnapshot: string;
  coverages: RiskMatrixCoverageKeyEnum[];
  isDraft: boolean;
  bindingCount: number;
};

export type RiskMatrixActiveBinding = {
  id: string;
  workspaceId: string;
  coverageKey: RiskMatrixCoverageKeyEnum;
  matrixVersionId: string;
};

export type RiskMatrixIdentity = RiskMatrixBrowseItem & {
  versions: RiskMatrixIdentityVersion[];
  activeBindings: RiskMatrixActiveBinding[];
};

export type RiskMatrixAxisLevelCriterion = {
  coverageKey: RiskMatrixCoverageKeyEnum;
  criterion: string;
};

export type RiskMatrixAxisLevel = {
  id: string;
  axis: RiskMatrixAxisEnum;
  value: number;
  label: string;
  criteriaByCoverage: RiskMatrixAxisLevelCriterion[];
};

export type RiskMatrixClassification = {
  id: string;
  key: string;
  label: string;
  color: string;
  sortOrder: number;
  compatibilityBands: number[];
};

export type RiskMatrixCell = {
  id: string;
  severity: number;
  probability: number;
  classificationId: string;
};

/**
 * Contrato da versão: coleções axisLevels/classifications/cells.
 * 5x5 é constraint funcional da V1, não formato permanente do catálogo.
 * Não modelar s1p1...s5p5 nem 25 campos fixos.
 */
export type RiskMatrixVersion = {
  id: string;
  matrixId: string;
  companyId: string;
  versionNumber: number;
  status: CompanyRiskMatrixVersionStatusEnum;
  nameSnapshot: string;
  publishedAt: string | null;
  gridOrientation?: RiskMatrixGridOrientationEnum;
  yAxisDirection?: RiskMatrixYAxisDirectionEnum;
  axisLevels: RiskMatrixAxisLevel[];
  classifications: RiskMatrixClassification[];
  cells: RiskMatrixCell[];
  coverages: RiskMatrixCoverageKeyEnum[];
  axisLevelColors?: SystemRiskMatrixAxisLevelColor[];
};

export type SystemRiskMatrixMethodologicalGap = {
  coverageKey: RiskMatrixCoverageKeyEnum;
  field: 'AXIS_CRITERIA';
  axis?: RiskMatrixAxisEnum;
  reason: 'NO_PUBLISHED_SOURCE';
  message: string;
};

export type SystemRiskMatrixVersion = Omit<RiskMatrixVersion, 'companyId'> & {
  companyId: string | null;
  axisLevelColors?: SystemRiskMatrixAxisLevelColor[];
};

export type SystemRiskMatrixAxisCriterion = {
  axis: RiskMatrixAxisEnum;
  value: number;
  coverageKey: RiskMatrixCoverageKeyEnum;
  criterion: string;
};

export type SystemRiskMatrixAxisLevelColor = {
  value: number;
  color: string;
};

export type SystemRiskMatrixClassificationColor = {
  key: string;
  color: string;
};

export type SystemRiskMatrixExtraordinaryProbability = {
  value: number;
  label: string;
  color: string;
  editable?: boolean;
};

export type SystemRiskMatrixEditorialMeta = {
  persisted: boolean;
  revision: number;
  updatedAt: string | Date | null;
  updatedById: number | null;
};

export type PutSystemRiskMatrixPayload = {
  axisCriteria: SystemRiskMatrixAxisCriterion[];
  axisLevelColors: SystemRiskMatrixAxisLevelColor[];
  classificationColors: SystemRiskMatrixClassificationColor[];
};

export type SystemRiskMatrixPresentationClassification = {
  key: string;
  label: string;
  color: string;
  sortOrder?: number;
};

export type SystemRiskMatrixPresentation = {
  source: RiskMatrixSourceEnum;
  name?: string;
  axisLevelColors: SystemRiskMatrixAxisLevelColor[];
  classifications: SystemRiskMatrixPresentationClassification[];
  extraordinaryProbability?: SystemRiskMatrixExtraordinaryProbability;
};

export type SystemRiskMatrixProjection = {
  source: RiskMatrixSourceEnum.SYSTEM;
  name: string;
  description: string;
  readOnly: true;
  coverages: RiskMatrixCoverageKeyEnum[];
  methodologicalGaps: SystemRiskMatrixMethodologicalGap[];
  version: SystemRiskMatrixVersion;
  axisCriteria?: SystemRiskMatrixAxisCriterion[];
  axisLevelColors?: SystemRiskMatrixAxisLevelColor[];
  classificationColors?: SystemRiskMatrixClassificationColor[];
  extraordinaryProbability?: SystemRiskMatrixExtraordinaryProbability;
  editorial?: SystemRiskMatrixEditorialMeta;
};

export type CreateRiskMatrixPayload = {
  name: string;
  description?: string | null;
  source?: RiskMatrixCreateSourceEnum;
};

export type PatchRiskMatrixPayload = {
  name?: string;
  description?: string | null;
};

export type RiskMatrixAxisLevelPayload = {
  axis: RiskMatrixAxisEnum;
  value: number;
  label: string;
  criteriaByCoverage?: RiskMatrixAxisLevelCriterion[];
};

export type RiskMatrixClassificationPayload = {
  key: string;
  label: string;
  color: string;
  sortOrder: number;
  compatibilityBands: number[];
};

export type RiskMatrixCellPayload = {
  severity: number;
  probability: number;
  classificationKey: string;
};

export type ReplaceRiskMatrixDraftPayload = {
  name?: string;
  description?: string | null;
  axisLevels: RiskMatrixAxisLevelPayload[];
  classifications: RiskMatrixClassificationPayload[];
  cells: RiskMatrixCellPayload[];
  coverages: RiskMatrixCoverageKeyEnum[];
  gridOrientation?: RiskMatrixGridOrientationEnum;
  yAxisDirection?: RiskMatrixYAxisDirectionEnum;
  axisLevelColors?: SystemRiskMatrixAxisLevelColor[];
};

export type CreateRiskMatrixVersionPayload = {
  sourceVersionId: string;
};

export type RiskMatrixBindingConflict = {
  coverageKey: RiskMatrixCoverageKeyEnum;
  existingMatrixId: string;
  existingMatrixName: string;
  existingVersionId: string;
  existingVersionNumber: number;
};

export type WorkspaceRiskMatrixEnabledItem = {
  matrixId: string;
  matrixName: string;
  versionId: string;
  versionNumber: number;
  coverages: RiskMatrixCoverageKeyEnum[];
};

export type WorkspaceRiskMatrixCatalogItem = {
  matrixId: string;
  matrixName: string;
  versionId: string;
  versionNumber: number;
  publishedAt: string | null;
  coverages: RiskMatrixCoverageKeyEnum[];
  enabled: boolean;
  conflicts: RiskMatrixBindingConflict[];
  switchFrom: { versionId: string; versionNumber: number } | null;
};

export type WorkspaceRiskMatrixAvailability = {
  workspaceId: string;
  simpleSst: { alwaysAvailable: true };
  enabled: WorkspaceRiskMatrixEnabledItem[];
  catalog: WorkspaceRiskMatrixCatalogItem[];
  occupiedCoverages: RiskMatrixCoverageKeyEnum[];
};

export type SwitchWorkspaceRiskMatrixPayload = {
  sourceVersionId: string;
  targetVersionId: string;
};

export type MatrixWorkspaceAvailabilityAction =
  | 'enable'
  | 'disable'
  | 'switch'
  | 'blocked'
  | 'unavailable';

export type MatrixWorkspaceAvailabilityTargetVersion = {
  versionId: string;
  versionNumber: number;
  coverages: RiskMatrixCoverageKeyEnum[];
};

export type MatrixWorkspaceAvailabilityWorkspace = {
  workspaceId: string;
  workspaceName: string;
  enabled: boolean;
  enabledVersionId: string | null;
  enabledVersionNumber: number | null;
  targetVersionId: string | null;
  coverages: RiskMatrixCoverageKeyEnum[];
  conflicts: RiskMatrixBindingConflict[];
  switchFrom: { versionId: string; versionNumber: number } | null;
  action: MatrixWorkspaceAvailabilityAction;
  canEnable: boolean;
  canDisable: boolean;
  canSwitch: boolean;
};

export type MatrixWorkspaceAvailability = {
  matrixId: string;
  matrixName: string;
  matrixStatus: CompanyRiskMatrixStatusEnum;
  simpleSst: { alwaysAvailable: true };
  enableable: boolean;
  targetPublishedVersion: MatrixWorkspaceAvailabilityTargetVersion | null;
  workspaces: MatrixWorkspaceAvailabilityWorkspace[];
};

export type RiskMatrixApiErrorBody = {
  statusCode?: number;
  message?: string;
  error?: string;
  code?: string;
  conflicts?: RiskMatrixBindingConflict[];
  activeBindings?: RiskMatrixActiveBinding[];
  versionId?: string;
  expectedCoverages?: RiskMatrixCoverageKeyEnum[];
  actualCoverages?: RiskMatrixCoverageKeyEnum[];
};
