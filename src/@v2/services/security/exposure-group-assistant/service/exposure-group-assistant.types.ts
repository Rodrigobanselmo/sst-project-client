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
  integrityReview?: CharacterizationIntegrityReviewInfo | null;
  operationalReviewStatus?: IntegrityOperationalReviewStatus;
  operationalBucket?: 'PENDING' | 'INFORMATIONAL';
};

export type IntegrityOperationalReviewStatus =
  | 'PENDING'
  | 'JUSTIFIED_VALID'
  | 'JUSTIFIED_STALE';

export type CharacterizationIntegrityReviewInfo = {
  id: string;
  status: 'JUSTIFIED' | 'REOPENED';
  reason: string;
  reviewedByUserId: number | null;
  reviewedByName: string | null;
  reviewedAt: string;
  reopenedByUserId: number | null;
  reopenedByName: string | null;
  reopenedAt: string | null;
  dependencyHash: string | null;
  staleDueToDependencyChange: boolean;
  operationalStatus: IntegrityOperationalReviewStatus;
};

export const INTEGRITY_JUSTIFY_REASON_SUGGESTION =
  'Elemento mantido como evidência técnica do levantamento. A cobertura ocupacional e os riscos foram consolidados em estrutura superior, por decisão técnica, evitando duplicação de riscos e recomendações.';

export const UNREACHED_ELEMENT_FINDING_KIND =
  'ELEMENT_WITHOUT_LINKED_ROLES_OR_EMPLOYEES';

export type JustifyIntegrityReviewParams = {
  companyId: string;
  workspaceId: string;
  elementId: string;
  reason: string;
  findingKind?: string;
};

export type ReopenIntegrityReviewParams = {
  companyId: string;
  workspaceId: string;
  elementId: string;
  findingKind?: string;
};

export type JustifyIntegrityReviewResponse = {
  companyId: string;
  workspaceId: string;
  elementId: string;
  findingKind: string;
  technicalConditionActive: true;
  operationalStatus: 'JUSTIFIED_VALID';
  review: CharacterizationIntegrityReviewInfo;
};

export type ReopenIntegrityReviewResponse = {
  companyId: string;
  workspaceId: string;
  elementId: string;
  findingKind: string;
  operationalStatus: 'PENDING';
  review: CharacterizationIntegrityReviewInfo;
};

export type BulkJustifyListFilters = {
  operationalBucket?: 'PENDING' | 'INFORMATIONAL';
  category?: StructureFindingCategory | 'ALL';
  attentionLevel?: StructureAttentionLevel | 'ALL';
  stance?: NarrativeStance | 'ALL';
  entityQuery?: string;
  existingGseOnly?: boolean;
};

export type BulkJustifyIntegrityReviewParams = BulkJustifyListFilters & {
  companyId: string;
  workspaceId: string;
};

export type BulkJustifyFiltersSnapshot = {
  operationalBucket: 'PENDING' | 'INFORMATIONAL';
  category: StructureFindingCategory | 'ALL';
  attentionLevel: StructureAttentionLevel | 'ALL';
  stance: NarrativeStance | 'ALL';
  entityQuery: string;
  existingGseOnly: boolean;
};

export type BulkJustifyIntegrityReviewExecuteParams = {
  companyId: string;
  workspaceId: string;
  reason: string;
  selectionFingerprint: string;
  eligibleElementIds: string[];
} & BulkJustifyListFilters;

export type BulkJustifyIneligibilityGroup = {
  code: string;
  message: string;
  count: number;
};

export type BulkJustifyPreviewResponse = {
  companyId: string;
  workspaceId: string;
  foundCount: number;
  eligibleCount: number;
  ignoredCount: number;
  confirmableCount: number;
  filtersSnapshot: BulkJustifyFiltersSnapshot;
  eligibleElementIds: string[];
  selectionFingerprint: string;
  ineligibilitySummary: BulkJustifyIneligibilityGroup[];
};

export type BulkJustifyFailure = {
  elementId: string;
  findingId?: string;
  reason: string;
};

export type BulkJustifyResponse = {
  companyId: string;
  workspaceId: string;
  foundCount: number;
  processedCount: number;
  ignoredCount: number;
  selectionFingerprint: string;
  failures: BulkJustifyFailure[];
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
  pendingCount?: number;
  informationalCount?: number;
  technicalRecommendationCount?: number;
  justifiedValidCount?: number;
  truncated?: boolean;
  displayedRecommendationCount?: number;
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
    kindStats?: Array<{
      kind: string;
      technicalTotal: number;
      pendingTotal: number;
      informationalTotal: number;
      justifiedValidTotal: number;
      justifiedStaleTotal: number;
      displayedPendingTotal: number;
      displayedInformationalTotal: number;
      displayedTotal: number;
      pendingTruncated: boolean;
      informationalTruncated: boolean;
      truncated: boolean;
      limit: number;
    }>;
    operationalTotals?: {
      technicalTotal: number;
      pendingTotal: number;
      informationalTotal: number;
      justifiedValidTotal: number;
      justifiedStaleTotal: number;
      displayedPendingTotal: number;
      displayedInformationalTotal: number;
    };
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
