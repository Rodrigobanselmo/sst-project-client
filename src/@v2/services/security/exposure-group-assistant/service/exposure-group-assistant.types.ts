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

export type SimilarityConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export type SimilarityIndication =
  | 'STRONG_CANDIDATE'
  | 'REVIEW'
  | 'KEEP_SEPARATE'
  | 'INSUFFICIENT_DATA'
  | 'BLOCKED';

export type SimilarityBlock = {
  code: string;
  message: string;
};

export type SimilarityCandidateParticipant = {
  elementId: string;
  name: string;
  type: string;
  coveredEmployeeCount: number;
  riskCount: number;
  riskFingerprintHash: string;
  riskSourceType?: 'OWN' | 'REPRESENTATIVE_ANCESTOR' | 'UNAVAILABLE';
  representativeSourceName?: string;
  representativeDistance?: number;
};

export type SimilarityProposalMode = 'SINGLETON' | 'CONSOLIDATED';

export type GseDraftClassification =
  | 'STRUCTURAL'
  | 'ADMINISTRATIVE'
  | 'OPERATIONAL'
  | 'TRANSVERSAL'
  | 'EQUIPMENT'
  | 'FUNCTIONAL'
  | 'MIXED';

export type GseDraftWarning = {
  code: string;
  message: string;
  severity: 'INFO' | 'ATTENTION' | 'CRITICAL';
};

export type GseDraftProposal = {
  proposalId: string;
  proposalMode: SimilarityProposalMode;
  classification: GseDraftClassification;
  name: string;
  description: string;
  companyId: string;
  workspaceIds: string[];
  status: 'ACTIVE';
  type: null;
  hierarchyIds: string[];
  suggestedName: string;
  suggestedDescription: string;
  technicalJustification: string;
  formationReason: string;
  populationDescription: string;
  operationalContext: string;
  occupationalContext: string;
  includedElements: Array<{
    elementId: string;
    name: string;
    type: string;
    inclusionReason: string;
    coveredEmployeeCount: number;
    riskCount: number;
  }>;
  excludedElements: Array<{
    elementId?: string;
    name?: string;
    reason: string;
  }>;
  includedEmployees: {
    count: number;
    intersectionCount: number;
    summaryLabel: string;
  };
  includedJobs: string[];
  includedRisks: {
    riskIds: string[];
    count: number;
  };
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  warnings: GseDraftWarning[];
  confidence: SimilarityConfidence;
  score: number;
  reviewNotes: string[];
  algorithmVersion: string;
};

export type SimilarityCandidate = {
  provisionalName: string;
  elementCount: number;
  participants: SimilarityCandidateParticipant[];
  elementTypes: string[];
  commonAncestorId: string | null;
  commonAncestorName: string | null;
  coveredEmployeeCountUnion: number;
  coveredEmployeeCountIntersection?: number;
  employeeCoverage?: {
    unionCount: number;
    intersectionCount: number;
    relation: 'SAME' | 'PARTIAL' | 'DISTINCT' | 'UNAVAILABLE' | 'MIXED_EMPTY';
    summaryLabel: string;
  };
  commonRiskIds: string[];
  /** Union of participant risk ids (complementary exposure profile). */
  unionRiskIds?: string[];
  exclusiveRiskIdsByElement: Array<{ elementId: string; riskIds: string[] }>;
  globalScore: number;
  riskScore: number | null;
  employeeScore: number | null;
  structuralScore: number;
  confidence: SimilarityConfidence;
  indication: SimilarityIndication;
  favorableReasons: string[];
  divergences: string[];
  blocks: SimilarityBlock[];
  cohortScoreMin: number;
  cohortScoreAvg: number;
  cohortScoreMax: number;
  pairCount: number;
  broadCohortReviewRequired?: boolean;
  intermediateUnitId?: string | null;
  intermediateUnitName?: string | null;
  proposalMode?: SimilarityProposalMode;
  suggestedName?: string;
  suggestedDescription?: string;
  technicalJustification?: string;
  justificationSummary?: string;
  commonRoleNames?: string[];
  draft?: GseDraftProposal;
  materialization?: GseProposalMaterialization;
};

export type GseMaterializationStatus =
  | 'NOT_MATERIALIZED'
  | 'EXACT_CREATED_PROPOSAL'
  | 'EXACT_EXISTING_GSE'
  | 'PARTIAL_OVERLAP';

export type GseProposalMaterialization = {
  status: GseMaterializationStatus;
  homogeneousGroupId?: string;
  homogeneousGroupName?: string;
  createdAt?: string;
  createdByName?: string | null;
  matchedHierarchyIds?: string[];
  missingHierarchyIds?: string[];
  matchedElementIds?: string[];
  missingElementIds?: string[];
  matchReason?: string;
};

export type SimilarityDiscardedSummary = {
  elementIdA: string;
  elementIdB: string;
  reason: string;
  blockCodes: string[];
  globalScore: number | null;
};

export type SimilarityProposalsResponse = {
  schemaVersion: string;
  similarityAlgorithmVersion: string;
  generatedAt: string;
  snapshotContentHash: string;
  workspace: {
    id: string;
    name: string;
    companyId: string;
    companyName: string;
  };
  processingTimeMs: number;
  timingMs: {
    load: number;
    build: number;
    score: number;
    total: number;
  };
  totals: {
    elementsEvaluated: number;
    pairsPossible: number;
    pairsAfterPrefilter: number;
    pairsEvaluated: number;
    candidates: number;
    blockedOrDiscarded: number;
    riskContextOwn?: number;
    riskContextRepresentativeAncestor?: number;
    riskContextUnavailable?: number;
    elementsEligibleForProposal?: number;
    elementsDocumentaryContext?: number;
    elementsIneligibleOther?: number;
    elementsReviewRequired?: number;
    materializedProposals?: number;
    partialOverlapProposals?: number;
  };
  coverage?: {
    eligibleElementTotal: number;
    consolidatedProposalTotal: number;
    singletonProposalTotal: number;
    elementsInConsolidatedProposals: number;
    elementsInSingletonProposals: number;
    eligibleElementsWithoutProposal: number;
    reviewRequiredTotal: number;
  };
  truncation: {
    displayTruncated: boolean;
    displayLimit: number;
    technicalCandidatesTotal: number;
    pairsEvaluationCapped: boolean;
    maxPairsEvaluated: number;
  };
  formula: {
    weights: {
      risks: number;
      employees: number;
      structural: number;
      auxiliary: number;
    };
    bands: {
      strong: string;
      moderate: string;
      low: string;
      notRecommended: string;
      blocked: string;
    };
    notes: string[];
  };
  limitations: Array<{ code: string; message: string }>;
  fingerprintDoc: {
    algorithm: string;
    fields: readonly string[];
    limitations: readonly string[];
  };
  candidates: SimilarityCandidate[];
  discardedSummary: SimilarityDiscardedSummary[];
  consultativeNotice: string;
};

export type RunSimilarityProposalsParams = {
  companyId: string;
  workspaceId: string;
  confidence?: SimilarityConfidence[];
  elementTypes?: string[];
  nameQuery?: string;
  withoutBlocksOnly?: boolean;
  commonAncestorId?: string;
  displayLimit?: number;
  proposalMode?: SimilarityProposalMode | 'ALL';
};

/**
 * Editable text surface of a GseDraftProposal — the only fields a human or
 * the AI refinement step may change. Mirrors the API's `GseDraftTextFields`.
 */
export type GseDraftTextFields = {
  name: string;
  description: string;
  technicalJustification: string;
  formationReason: string;
  populationDescription: string;
  operationalContext: string;
  occupationalContext: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  reviewNotes: string[];
};

// —— Refine draft (AI) ——

export type RefineGseDraftElementInput = {
  elementId: string;
  name: string;
  type: string;
  coveredEmployeeCount: number;
  riskCount: number;
};

export type RefineGseDraftWarningInput = {
  code: string;
  message: string;
  severity: string;
};

export type RefineGseDraftEmployeesInput = {
  count: number;
  intersectionCount: number;
  summaryLabel: string;
};

/** Body sent to POST .../similarity-proposals/refine-draft. */
export type RefineGseDraftBody = {
  proposalId: string;
  proposalMode: SimilarityProposalMode;
  classification: string;
  name: string;
  description: string;
  technicalJustification: string;
  formationReason: string;
  populationDescription: string;
  operationalContext: string;
  occupationalContext: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  reviewNotes: string[];
  includedElements: RefineGseDraftElementInput[];
  includedJobs: string[];
  riskIds: string[];
  riskNameById?: Record<string, string>;
  includedEmployees?: RefineGseDraftEmployeesInput;
  score?: number;
  confidence?: string;
  favorableReasons?: string[];
  divergences?: string[];
  warnings?: RefineGseDraftWarningInput[];
};

export type RefineGseDraftParams = {
  companyId: string;
  workspaceId: string;
  draft: GseDraftProposal;
  riskNameById?: Record<string, string>;
};

export type GseDraftRefinementNormalized = GseDraftTextFields & {
  /** Redactional-only warnings from the AI — never block creation. */
  editorialWarnings: string[];
};

export type RefineGseDraftResult = {
  refined: boolean;
  draft: GseDraftRefinementNormalized;
  fallbackReason?: string;
  aiModel?: string;
  aiPromptRevision?: number | null;
};

// —— Create GSE from proposal (preview + create) ——

/** Shared composition + editable texts sent to both create-preview and create. */
export type CreateGseFromProposalSharedBody = GseDraftTextFields & {
  proposalId: string;
  proposalMode: SimilarityProposalMode;
  classification: string;
  snapshotHash: string;
  algorithmVersion: string;
  elementIds: string[];
  hierarchyIds: string[];
  riskIds: string[];
  commonRoleNames?: string[];
  employeeUnionCount: number;
  aiRefined?: boolean;
  aiModel?: string;
  aiPromptRevision?: number;
  /** Original (pre human/AI edit) texts — kept for provenance/audit. */
  deterministicTexts: GseDraftTextFields;
};

export type CreateGsePreviewBody = CreateGseFromProposalSharedBody;

export type CreateGseFromProposalBody = CreateGseFromProposalSharedBody & {
  /** Must match the fingerprint returned by the most recent preview call. */
  proposalFingerprint: string;
  /** Explicit confirmation required to proceed when only WARNING-level alerts are present. */
  confirmBlockingWarnings?: boolean;
};

export type CreateGsePreviewParams = {
  companyId: string;
  workspaceId: string;
  body: CreateGsePreviewBody;
};

export type CreateGseFromProposalParams = {
  companyId: string;
  workspaceId: string;
  body: CreateGseFromProposalBody;
};

export type GseCreationAlertSeverity = 'INFO' | 'WARNING' | 'BLOCKING';

export type GseCreationAlert = {
  code: string;
  message: string;
  severity: GseCreationAlertSeverity;
};

export type CreateGsePreviewResult = {
  proposalId: string;
  proposalFingerprint: string;
  name: string;
  description: string;
  alerts: GseCreationAlert[];
  hasBlockingAlerts: boolean;
  hasWarningAlerts: boolean;
  impact: {
    willCreateHomogeneousGroup: true;
    hierarchyLinksCount: number;
    originElementsCount: number;
    employeeUnionCount?: number;
    riskIdsCount?: number;
    willCopyRiskFactorData: false;
  };
  revalidation: {
    elementsChecked: number;
    elementsMissing: string[];
    elementsWrongWorkspace: string[];
    elementsInactiveOrDeleted: string[];
    elementsWithoutOwnRisks: string[];
    hasOccupationalUniverse: boolean;
  };
  conflicts: {
    nameAlreadyUsed: boolean;
    proposalAlreadyCreated: {
      homogeneousGroupId: string;
      homogeneousGroupName?: string;
    } | null;
    existingEquivalentGse?: {
      homogeneousGroupId: string;
      homogeneousGroupName: string;
    } | null;
    elementsAlreadyLinked: string[];
  };
  snapshotChangedSincePreview: boolean;
  generatedAt: string;
};

export type CreateGseMaterializationStatus =
  | 'CREATED'
  | 'ALREADY_CREATED'
  | 'EXISTING_EQUIVALENT';

export type CreateGseFromProposalResult = {
  gseId: string;
  name: string;
  proposalId: string;
  proposalFingerprint?: string;
  alreadyExisted?: boolean;
  materializationStatus?: CreateGseMaterializationStatus;
};
