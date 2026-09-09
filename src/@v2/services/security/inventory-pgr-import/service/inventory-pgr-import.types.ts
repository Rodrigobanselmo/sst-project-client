export type InventoryEvidence = {
  page: number | null;
  excerpt: string;
  section: string | null;
};

export type InventoryMatchStatus =
  | 'NEW'
  | 'EXACT_MATCH'
  | 'AMBIGUOUS'
  | 'PARENT_REQUIRED'
  | 'CONFLICT'
  | 'EXACT_MATCH_OTHER_WORKSPACE'
  | 'WORKSPACE_LINK_REQUIRED'
  | 'ALREADY_LINKED'
  | 'BLOCKED_BY_ROLE'
  | 'BLOCKED_BY_GSE';

export type InventoryIssueSeverity = 'info' | 'warning' | 'error';

export type InventoryIssueType =
  | 'LAYOUT_UNRECOGNIZED'
  | 'PARENT_REQUIRED'
  | 'AMBIGUOUS'
  | 'CONFLICT'
  | 'NO_TEXT'
  | 'PARTIAL_EXTRACTION'
  | 'AI_UNAVAILABLE'
  | 'AI_UNVERIFIED_ITEM'
  | 'NO_ROLES_IN_GROUP'
  | 'POSSIBLE_TEXT_TRUNCATION'
  | 'IGNORED_INDEX_ENTRY'
  | 'LOW_EXTRACTION_COVERAGE'
  | 'ORPHAN_ROLE_OUTSIDE_GROUP'
  | 'UNPARSED_ROLE_TABLE'
  | 'GROUP_NAME_REQUIRED'
  | 'HEADCOUNT_MISMATCH'
  | 'UNPARSED_INLINE_ROLE_LIST'
  | 'AMBIGUOUS_INLINE_ROLE'
  | 'UNPARSED_STRUCTURED_TABLE'
  | 'LAYOUT_LIMIT_EXCEEDED'
  | 'OTHER';

export type InventoryExtractionCompleteness =
  | 'COMPLETE'
  | 'PARTIAL'
  | 'LOW'
  | 'UNRECOGNIZED';

export type InventoryExtractionFragment = {
  reason: string;
  evidence: InventoryEvidence;
};

export type InventoryExtractionQuality = {
  completeness: InventoryExtractionCompleteness;
  needsReview: boolean;
  observedGroupSignals: number;
  extractedGroupCount: number;
  unparsedSections: InventoryExtractionFragment[];
  suspiciousFragments: InventoryExtractionFragment[];
};

export type InventoryMatchCandidate = {
  id: string;
  name: string;
  detail: string | null;
};

export type InventoryStructuralEvidenceSource =
  | 'EXPLICIT_DOCUMENT'
  | 'GSE_SEMANTIC'
  | 'NONE';

export type InventoryStructuralEvidenceContext =
  | 'EXPLICIT_HIERARCHY'
  | 'WORK_UNIT_GSE'
  | 'GENERIC_GSE'
  | 'UNKNOWN';

export type InventoryStructureAction =
  | 'REUSE_EXISTING'
  | 'PROPOSE_CREATE'
  | 'AMBIGUOUS'
  | 'NONE';

export type InventoryOrganogramMatchStatus =
  | 'UNIQUE'
  | 'NONE'
  | 'AMBIGUOUS'
  | 'NOT_EVALUATED';

export type InventoryGseSemanticSkipReason =
  | 'MISSING_NAME'
  | 'EQUIPMENT_OR_PROCESS'
  | 'NOT_STRUCTURAL';

export type InventoryGseSemanticEvidence = {
  groupKey: string;
  groupName: string;
  groupCode: string | null;
  groupLabel: string | null;
  rawName: string;
  suggestedName: string | null;
  promoted: boolean;
  context: InventoryStructuralEvidenceContext;
  skipReason: InventoryGseSemanticSkipReason | null;
  evidence: InventoryEvidence | null;
};

export type InventoryCompatibleParent = {
  id: string;
  name: string;
  type: string;
};

export type InventoryEligibleParentType =
  | 'DIRECTORY'
  | 'MANAGEMENT'
  | 'SECTOR'
  | 'SUB_SECTOR';

export type InventoryStructuralParentEvidence = {
  source: InventoryStructuralEvidenceSource;
  context: InventoryStructuralEvidenceContext;
  suggestedName: string | null;
  organogramMatch: InventoryOrganogramMatchStatus;
  structureAction: InventoryStructureAction;
  proposedStructureKey: string | null;
  proposedType: InventoryEligibleParentType | null;
  suggestedParentHierarchyId: string | null;
  suggestedParentName: string | null;
  suggestedParentType: string | null;
  compatibleParents: InventoryCompatibleParent[];
  gseEvidences: InventoryGseSemanticEvidence[];
};

export type InventoryStructureProposal = {
  key: string;
  proposedName: string;
  proposedNormalizedName: string;
  proposedType: InventoryEligibleParentType;
  action: 'REUSE_EXISTING' | 'PROPOSE_CREATE';
  context: InventoryStructuralEvidenceContext;
  reusedParentHierarchyId: string | null;
  reusedParentName: string | null;
  reusedParentType: string | null;
  groupKeys: string[];
  roleKeys: string[];
  evidence: InventoryEvidence[];
};

export type InventoryRolePreview = {
  key: string;
  sourceName: string;
  normalizedName: string;
  parentHints: string[];
  evidence: InventoryEvidence[];
  matchStatus: InventoryMatchStatus;
  matchedHierarchyId: string | null;
  suggestedParentHierarchyId: string | null;
  suggestedParentName: string | null;
  structuralParent: InventoryStructuralParentEvidence;
  candidates: InventoryMatchCandidate[];
};

export type InventoryGroupPreview = {
  key: string;
  sourceName: string;
  sourceCode: string | null;
  sourceLabel: string | null;
  noRolesFound: boolean;
  semanticNameMissing?: boolean;
  structuralContext?: InventoryStructuralEvidenceContext;
  parentHints: string[];
  evidence: InventoryEvidence[];
  matchStatus: InventoryMatchStatus;
  matchedHomogeneousGroupId: string | null;
  candidates: InventoryMatchCandidate[];
};

export type InventoryLinkPreview = {
  roleKey: string;
  groupKey: string;
  roleName: string;
  groupName: string;
  evidence: InventoryEvidence[];
  matchStatus: InventoryMatchStatus;
};

export type InventoryPreviewIssue = {
  type: InventoryIssueType;
  severity: InventoryIssueSeverity;
  message: string;
  evidence: InventoryEvidence[];
};

export type InventoryExtractionMode =
  | 'deterministic'
  | 'deterministic+spatial'
  | 'ai+deterministic'
  | 'deterministic+spatial+assisted';

export type InventoryParentCatalogItem = {
  id: string;
  name: string;
  normalizedName: string;
  type: string;
  parentId: string | null;
  workspaceIds: string[];
};

export type InventoryPgrImportPreview = {
  persisted: false;
  message: string;
  fingerprint: string;
  extractionFingerprint: string;
  catalogFingerprint: string;
  extractionMode: InventoryExtractionMode;
  extractionQuality: InventoryExtractionQuality;
  source: {
    fileName: string;
    fileHash: string;
    pageCount: number | null;
    truncated: boolean;
  };
  eligibleParents: InventoryParentCatalogItem[];
  roles: InventoryRolePreview[];
  groups: InventoryGroupPreview[];
  links: InventoryLinkPreview[];
  structureProposals: InventoryStructureProposal[];
  issues: InventoryPreviewIssue[];
};

export type InventoryReviewRoleDecision = {
  key: string;
  included: boolean;
  appliedName?: string | null;
  parentHierarchyId?: string | null;
  proposedStructureKey?: string | null;
  resolvedMatchId?: string | null;
};

export type InventoryReviewStructureSplitPart = {
  key: string;
  appliedName: string;
  appliedType?: InventoryEligibleParentType | null;
};

export type InventoryReviewStructureDecision = {
  key: string;
  included: boolean;
  appliedName?: string | null;
  appliedType?: InventoryEligibleParentType | null;
  reuseParentHierarchyId?: string | null;
  splitParts?: InventoryReviewStructureSplitPart[];
};

export type InventoryReviewGroupDecision = {
  key: string;
  included: boolean;
  appliedName?: string | null;
  resolvedMatchId?: string | null;
  confirmWorkspaceLink?: boolean;
};

export type InventoryReviewLinkDecision = {
  roleKey: string;
  groupKey: string;
  included: boolean;
};

export type InventoryReviewDecisions = {
  roles: InventoryReviewRoleDecision[];
  groups: InventoryReviewGroupDecision[];
  links: InventoryReviewLinkDecision[];
  structures?: InventoryReviewStructureDecision[];
  acknowledgedIssueTypes: string[];
};

export type InventoryReviewPlanAction =
  | 'create'
  | 'reuse'
  | 'link-workspace'
  | 'already-linked'
  | 'skip'
  | 'blocked';

export type InventoryReviewBlocker = {
  code: string;
  itemType: 'role' | 'group' | 'link' | 'extraction' | 'structure';
  itemKey: string | null;
  type: string;
  hard: boolean;
  message: string;
};

export type InventoryReviewedRole = InventoryRolePreview & {
  included: boolean;
  appliedName: string;
  appliedNormalizedName: string;
  nameCorrected: boolean;
  selectedParentHierarchyId: string | null;
  selectedParentName: string | null;
  selectedProposedStructureKey: string | null;
  planAction: InventoryReviewPlanAction;
};

export type InventoryReviewedStructure = InventoryStructureProposal & {
  included: boolean;
  appliedName: string;
  appliedNormalizedName: string;
  appliedType: InventoryEligibleParentType;
  nameCorrected: boolean;
  selectedReuseParentHierarchyId: string | null;
  planAction: InventoryReviewPlanAction;
  splitFromKey?: string | null;
};

export type InventoryReviewedGroup = InventoryGroupPreview & {
  included: boolean;
  appliedName: string;
  appliedNormalizedName: string;
  persistedName: string;
  nameCorrected: boolean;
  confirmWorkspaceLink: boolean;
  planAction: InventoryReviewPlanAction;
};

export type InventoryReviewedLink = InventoryLinkPreview & {
  included: boolean;
  appliedRoleName: string;
  appliedGroupName: string;
  excludedBecause: 'role-skipped' | 'group-skipped' | null;
  planAction: InventoryReviewPlanAction;
};

export type InventoryReviewSummary = {
  roles: { create: number; reuse: number; skip: number };
  groups: {
    create: number;
    reuse: number;
    linkWorkspace: number;
    skip: number;
  };
  structures: { create: number; reuse: number; skip: number };
  links: { create: number; alreadyLinked: number; skip: number };
  pendingBlockers: number;
};

export type InventoryReviewExtractionInput = {
  source: InventoryPgrImportPreview['source'];
  extractionMode: InventoryExtractionMode;
  extractionQuality: InventoryExtractionQuality;
  roles: Array<{
    key: string;
    sourceName: string;
    normalizedName: string;
    parentHints: string[];
    evidence: InventoryEvidence[];
  }>;
  groups: Array<{
    key: string;
    sourceName: string;
    sourceCode: string | null;
    sourceLabel: string | null;
    noRolesFound: boolean;
    semanticNameMissing?: boolean;
    structuralContext?: InventoryStructuralEvidenceContext;
    parentHints: string[];
    evidence: InventoryEvidence[];
  }>;
  links: Array<{
    roleKey: string;
    groupKey: string;
    evidence: InventoryEvidence[];
  }>;
  issues: InventoryPreviewIssue[];
};

export type InventoryPgrImportReview = {
  persisted: false;
  readyForFutureApply: boolean;
  message: string;
  fingerprint: string;
  extractionFingerprint: string;
  catalogFingerprint: string;
  reviewFingerprint: string;
  extractionQuality: InventoryExtractionQuality;
  eligibleParents: InventoryParentCatalogItem[];
  roles: InventoryReviewedRole[];
  groups: InventoryReviewedGroup[];
  links: InventoryReviewedLink[];
  structures: InventoryReviewedStructure[];
  blockers: InventoryReviewBlocker[];
  summary: InventoryReviewSummary;
  issues: InventoryPreviewIssue[];
};

export type PreviewInventoryPgrImportParams = {
  companyId: string;
  workspaceId: string;
  file: File;
};

export type ReviewInventoryPgrImportParams = {
  companyId: string;
  workspaceId: string;
  extraction: InventoryReviewExtractionInput;
  decisions: InventoryReviewDecisions;
};

export type InventoryApplyEntityAction = 'create' | 'reuse' | 'link-workspace';

export type InventoryApplyCounts = {
  structures: { created: number; reused: number; skipped: number };
  roles: { created: number; reused: number; skipped: number };
  groups: {
    created: number;
    reused: number;
    workspaceLinked: number;
    skipped: number;
  };
  links: { created: number; alreadyLinked: number; skipped: number };
};

export type InventoryPgrImportApply = {
  persisted: true;
  message: string;
  extractionFingerprint: string;
  catalogFingerprint: string;
  reviewFingerprint: string;
  counts: InventoryApplyCounts;
  ids: {
    structures: Array<{
      key: string;
      hierarchyId: string;
      action: InventoryApplyEntityAction;
    }>;
    roles: Array<{
      key: string;
      hierarchyId: string;
      parentHierarchyId: string | null;
      action: InventoryApplyEntityAction;
    }>;
    groups: Array<{
      key: string;
      homogeneousGroupId: string;
      action: InventoryApplyEntityAction;
    }>;
    links: Array<{
      roleKey: string;
      groupKey: string;
      hierarchyOnHomogeneousId: number | null;
      action: 'create' | 'already-linked';
    }>;
  };
};

export type ApplyInventoryPgrImportParams = {
  companyId: string;
  workspaceId: string;
  extraction: InventoryReviewExtractionInput;
  decisions: InventoryReviewDecisions;
  extractionFingerprint: string;
  catalogFingerprint: string;
  reviewFingerprint: string;
};
