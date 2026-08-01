export type StructureAttentionLevel =
  | 'INFORMATIONAL'
  | 'ATTENTION'
  | 'RELEVANT'
  | 'PRIORITY';

export type StructureFindingCategory =
  | 'COVERAGE'
  | 'INTEGRITY'
  | 'COMPLETENESS'
  | 'FRAGMENTATION'
  | 'DATA_INSUFFICIENT'
  | 'EXISTING_GSE_REVIEW';

export type NarrativeStance =
  | 'OPPORTUNITY'
  | 'ATTENTION_POINT'
  | 'EXPECTED_SITUATION'
  | 'REVIEW_RECOMMENDED'
  | 'INTERVENTION_LIKELY';

export type NarrativeRouteHint =
  | 'HIERARCHY'
  | 'CHARACTERIZATION'
  | 'GHO'
  | 'RISKS'
  | 'WORKSPACE';

export type StructureEntityRef = {
  entityType: string;
  entityId: string | number;
  label?: string;
};

export type InterpretedRecommendation = {
  id: string;
  findingId: string;
  /** Internal — do not display in UI. */
  kind: string;
  category: StructureFindingCategory;
  attentionLevel: StructureAttentionLevel;
  stance: NarrativeStance;
  title: string;
  listSummary: string;
  situation: string;
  whyAttention: string;
  whenExpected: string;
  howToReview: string;
  routeHint?: NarrativeRouteHint;
  ctaTarget?:
    | 'CHARACTERIZATION_EDIT_DATA'
    | 'CHARACTERIZATION_EDIT_ROLES'
    | 'CHARACTERIZATION_EDIT_RISKS'
    | 'GHO'
    | 'HIERARCHY'
    | 'EMPLOYEES'
    | 'ENTITY_RISKS'
    | 'CHARACTERIZATION_LIST';
  primaryEntityId?: string | number;
  primaryEntityType?: string;
  entityKindLabel?: string;
  primaryEntityName?: string;
  entityStatusLabel?: string;
  directRiskCount?: number;
  workerRiskCoverage?: string;
  workerCoverageStats?: {
    totalWorkers: number;
    coveredDirectly: number;
    coveredIndirectly: number;
    uncovered: number;
    coMembershipOnly: number;
    coveragePercent: number | null;
  };
  peerCoverageSources?: Array<{
    entityType: string;
    entityId: string;
    label: string;
    relationKind: string;
    relationKindLabel: string;
  }>;
  coverageSources?: Array<{
    sourceElementId: string;
    sourceElementType: string;
    sourceElementLabel: string;
    relationKind: string;
    relationKindLabel: string;
    sourceHierarchyId?: string;
    matchedEmployeeCount: number;
    matchedEmployeeIds: number[];
  }>;
  hierarchyPath?: Array<{
    hierarchyId: string;
    hierarchyType: string;
    typeLabel: string;
    name: string;
    depth: number;
  }>;
  hierarchyPathDisplay?: string;
  hierarchyPathLotacao?: string;
  hierarchyType?: string;
  affectedEntities: StructureEntityRef[];
  totalAffectedCount: number;
  affectedTruncated: boolean;
};

export type DevelopedRoleDeletionEligibility =
  | 'ELIGIBLE_DIRECT_DELETE'
  | 'ELIGIBLE_AFTER_EMPLOYEE_DETACH'
  | 'BLOCKED_TECHNICAL_USE'
  | 'BLOCKED_OTHER_REFERENCES'
  | 'UNKNOWN';

export type DevelopedRoleEmployeeDetachPlan = {
  employeeCount: number;
  employeeIds: string[];
  primaryRolesPreserved: boolean;
  employees: Array<{
    employeeId: string;
    employeeName: string;
    primaryRoleId: string;
    primaryRoleName: string;
  }>;
};

export type DevelopedRoleDeletionAnalysis = {
  hierarchyId: string;
  hierarchyName: string;
  hierarchyType: string;
  companyId: string;
  workspaceId: string;
  eligibility: DevelopedRoleDeletionEligibility;
  analysisHash: string;
  primaryRolePreserved: boolean;
  primaryRole: { hierarchyId: string; name: string } | null;
  currentEmployeeCount: number;
  employeesMissingPrimaryRoleCount: number;
  employeeDetachPlan: DevelopedRoleEmployeeDetachPlan | null;
  currentRiskCount: number;
  historicalRiskEvidenceCount: number;
  activeCharacterizationCount: number;
  historicalCharacterizationCount: number;
  historicalCharacterizationWithoutTechnicalUseCount: number;
  gseCount: number;
  documentReferenceCount: number;
  otherBlockingReferenceCount: number;
  auxiliaryLotacaoHistoryCount: number;
  hierarchicalChildCount: number;
  hierarchicalChildren: Array<{ id: string; name: string; type: string }>;
  relatedElements: Array<{
    id: string;
    name: string;
    status: string;
    linkedVia: string;
    hasTechnicalUse: boolean;
    technicalUseSignals: string[];
  }>;
  hierarchyPath: Array<{
    hierarchyId: string;
    hierarchyType: string;
    typeLabel: string;
    name: string;
    depth: number;
  }>;
  hierarchyPathDisplay: string;
  blockingReasons: Array<{ code: string; message: string; count?: number }>;
  warnings: string[];
  evidenceNotes: string[];
  analyzedAt: string;
};

export type AnalyzeDevelopedRoleDeletionParams = {
  companyId: string;
  workspaceId: string;
  hierarchyId: string;
};

export const DEVELOPED_ROLE_DELETE_CONFIRMATION =
  'DETACH_EMPLOYEES_AND_DELETE_DEVELOPED_ROLE' as const;

export type DeleteDevelopedRoleParams = {
  companyId: string;
  workspaceId: string;
  hierarchyId: string;
  expectedAnalysisHash: string;
  confirmation: typeof DEVELOPED_ROLE_DELETE_CONFIRMATION;
};

export type DeleteDevelopedRoleResult = {
  hierarchyId: string;
  hierarchyName: string;
  deleted: true;
  detachedEmployeeIds: string[];
  primaryRolesPreserved: true;
  relatedCharacterizationIdsPreserved: string[];
  message: string;
};

export type CategoryConclusion = {
  category: StructureFindingCategory;
  title: string;
  conclusion: string;
  stance: NarrativeStance;
  recommendationCount: number;
  highestAttentionLevel: StructureAttentionLevel | null;
};

export type DiagnosisNarrative = {
  schemaVersion: string;
  opening: string;
  principles: string[];
  categoryConclusions: CategoryConclusion[];
  recommendations: InterpretedRecommendation[];
  closing: string;
};

export type ExposureGroupAssistantDiagnosisResponse = {
  schemaVersion: string;
  workspace: {
    id: string;
    name: string;
    companyId: string;
    companyName: string;
  };
  snapshotContentHash: string;
  detectorSetVersion: string;
  generatedAt: string;
  maturity: 'EMPTY' | 'PARTIAL' | 'MATURE';
  maturitySignals: Record<string, unknown>;
  summary: {
    totalFindings: number;
    findingsByCategory: Record<string, number>;
    findingsByAttentionLevel: Record<string, number>;
    findingsByKind: Record<string, number>;
    priorityAttentionCount: number;
    dataInsufficiencyCount: number;
    affectedEmployeesCount: number;
    affectedRolesCount: number;
    affectedElementsCount: number;
    affectedGsesCount: number;
  };
  metrics: {
    employees: number;
    roles: number;
    functions: number;
    sectors: number;
    characterizableElements: number;
    existingExposureGroups: number;
    coverageBroad: number;
    coverageStrict: number;
    roleCoverageBroad: number;
    roleCoverageStrict: number;
    riskBearingElements: number;
    elementsWithoutDirectRisks: number;
    elementsWithDirectRiskCoverage: number;
    elementsWithIndirectWorkerCoverage: number;
    elementsWithPartialWorkerCoverage?: number;
    elementsWithCoverageGap: number;
  };
  narrative: DiagnosisNarrative;
  findings: unknown[];
  limitations: Array<{ code: string; message: string }>;
  processingTimeMs: number;
  timingMs: {
    load: number;
    build: number;
    diagnose: number;
    total: number;
  };
  truncation: {
    anyTruncated: boolean;
    findingsPerKindCapped: boolean;
    kindsCapped: string[];
    snapshotTruncated: boolean;
    snapshotHashMode: string;
  };
  existingExposureGroupsSample: Array<{
    id: string;
    name: string;
    purpose: string;
    purposeLabel: string;
    directRiskCount: number;
    derivedRiskCount: number | null;
    aggregatedRiskCount: number | null;
    aggregatedRiskStatus: string;
    estimatedEmployeeCount: number;
    linkedHierarchyCount: number;
    linkedWorkspaceCount: number | null;
  }>;
};

export type RunExposureGroupDiagnosisParams = {
  companyId: string;
  workspaceId: string;
};
