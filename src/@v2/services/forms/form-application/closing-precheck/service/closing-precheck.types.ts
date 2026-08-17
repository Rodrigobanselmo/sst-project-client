export type ClosingConsistencyClassification =
  | 'MATCH'
  | 'LIKELY_TRANSFER'
  | 'LIKELY_CONTAMINATION'
  | 'INCONCLUSIVE'
  | 'NO_RESPONSE'
  | 'OUT_OF_CURRENT_POPULATION'
  | 'UNRESOLVED_SECTOR';

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
  snapshotSectorId: string | null;
  snapshotSectorName: string | null;
  snapshotHierarchyState: 'ok' | 'missing' | 'inactive' | 'none';
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
  summary: ClosingPrecheckSummary;
  sectors: ClosingPrecheckSector[];
  employees: ClosingPrecheckEmployee[];
  possibleDuplicateHierarchyNames: PossibleDuplicateHierarchyName[];
  findings: ClosingPrecheckFinding[];
};
