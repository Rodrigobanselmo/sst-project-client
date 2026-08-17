export type ClosingConsistencyClassification =
  | 'MATCH'
  | 'LIKELY_TRANSFER'
  | 'LIKELY_CONTAMINATION'
  | 'INCONCLUSIVE'
  | 'NO_RESPONSE'
  | 'OUT_OF_CURRENT_POPULATION'
  | 'UNRESOLVED_SECTOR';

export type ClosingDivergenceResolutionStatus = 'PENDING' | 'CONFIRMED_LEGITIMATE';

export type ClosingDivergenceResolutionAction = 'CORRECT' | 'CONFIRM_LEGITIMATE';

export type ClosingDivergenceSkipReason =
  | 'STALE_VALUE'
  | 'STALE_REFERENCE'
  | 'STALE_CLASSIFICATION'
  | 'NOT_ELIGIBLE'
  | 'MISSING_REFERENCE'
  | 'MISSING_ANSWER'
  | 'WRONG_APPLICATION'
  | 'DUPLICATE_ITEM';

export type ClosingFindingSeverity = 'BLOCKING' | 'WARNING' | 'INFO';

export type ClosingHistoryEvidence = {
  coveringHierarchyId: string | null;
  coveringSectorId: string | null;
  coveringStartDate: string | null;
  coveringMotive: string | null;
  nextStartDate: string | null;
  laterMovement: boolean;
  usedStartDateOnly: true;
  note: string;
};

export type ClosingPrecheckWorkspace = {
  id: string;
  name: string;
};

export type ClosingPrecheckSummary = {
  applicationId: string;
  status: string;
  workspaces: ClosingPrecheckWorkspace[];
  populationTotal: number;
  respondentsTotal: number;
  validAnswersTotal: number;
  withoutResponseTotal: number;
  divergenceTotal: number;
  pendingReviewTotal?: number;
  correctedTotal?: number;
  confirmedLegitimateTotal?: number;
  blockingTotal: number;
  warningTotal: number;
  infoTotal: number;
};

export type ClosingPrecheckSector = {
  hierarchyId: string;
  name: string;
  currentEmployeeCount: number;
  respondentCount: number;
  withoutResponseCount: number;
  snapshotMatchCount: number;
  divergenceCount: number;
  summaryStatus: 'OK' | 'WARNING' | 'BLOCKING' | 'INFO';
};

export type ClosingPrecheckEmployee = {
  employeeId: number;
  name: string;
  officeName: string | null;
  officeHierarchyId: string | null;
  currentSectorId: string | null;
  currentSectorName: string | null;
  inCurrentPopulation: boolean;
  eligible: boolean;
  hasResponded: boolean;
  submissionId: string | null;
  submissionStatus: string | null;
  submittedAt: string | null;
  formAnswerId: string | null;
  snapshotSectorId: string | null;
  snapshotSectorName: string | null;
  snapshotHierarchyState: 'ok' | 'missing' | 'inactive' | 'none';
  coveringSectorId?: string | null;
  coveringSectorName?: string | null;
  referenceSectorId?: string | null;
  referenceSectorName?: string | null;
  canCorrect?: boolean;
  canConfirmLegitimate?: boolean;
  resolutionStatus?: ClosingDivergenceResolutionStatus | null;
  classification: ClosingConsistencyClassification;
  snapshotClassification: ClosingConsistencyClassification | null;
  severity: ClosingFindingSeverity | 'OK';
  historyEvidence: ClosingHistoryEvidence | null;
};

export type PossibleDuplicateHierarchyName = {
  hierarchyIdA: string;
  nameA: string;
  hierarchyIdB: string;
  nameB: string;
  distance: number;
  similarity: number;
  employeeCountA: number;
  employeeCountB: number;
  responseCountA: number;
  responseCountB: number;
};

export type ClosingPrecheckFinding = {
  code: string;
  severity: ClosingFindingSeverity;
  message: string;
  employeeId?: number;
  hierarchyId?: string;
  duplicate?: PossibleDuplicateHierarchyName;
};

export type ClosingPrecheckResult = {
  readOnly: true;
  canResolve?: boolean;
  summary: ClosingPrecheckSummary;
  sectors: ClosingPrecheckSector[];
  employees: ClosingPrecheckEmployee[];
  possibleDuplicateHierarchyNames: PossibleDuplicateHierarchyName[];
  findings: ClosingPrecheckFinding[];
};

export type ResolveClosingDivergenceItem = {
  employeeId: number;
  submissionId: string;
  formAnswerId: string;
  expectedPreviousValue: string;
  expectedReferenceValue: string;
  expectedClassification: ClosingConsistencyClassification;
};

export type ResolveClosingDivergencesParams = {
  companyId: string;
  applicationId: string;
  action: ClosingDivergenceResolutionAction;
  observation?: string;
  items: ResolveClosingDivergenceItem[];
};

export type ResolveClosingDivergencesResult = {
  requested: number;
  applied: number;
  skipped: Array<{
    employeeId: number;
    formAnswerId: string;
    reason: ClosingDivergenceSkipReason;
  }>;
  results: Array<{
    employeeId: number;
    formAnswerId: string;
    previousValue: string | null;
    resultingValue: string | null;
    referenceValue: string | null;
  }>;
  batchId: string | null;
};
